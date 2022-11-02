import { NodeCGServer } from 'nodecg-types/types/lib/nodecg-instance';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import chokidar from 'chokidar';
import { BUNDLE_NAME } from './lib/utils';
import { error, log } from './lib/log';
import { info } from 'console';



export = (nodecg: NodeCGServer) => {
  const yamlDir = process.env.CARTOGRAPHER_LAYOUT_DIR || path.join(process.env.NODECG_ROOT, 'layouts');

  const layouts = fs.readdirSync(yamlDir).map(filename => path.join(yamlDir, filename));

  log(`[Cartographer] Found ${layouts.length} layout(s) at ${yamlDir}.`);

  const layoutSchemas = nodecg.Replicant('layoutSchemas', BUNDLE_NAME, {
    defaultValue: {},
    persistent: false,
  });

  const factoryModules = nodecg.Replicant('factoryModules', BUNDLE_NAME, {
    defaultValue: [],
    persistent: false,
  });

  function registerSchema(filename: string) {
    try {
      const config = YAML.parse(fs.readFileSync(filename, 'utf8'));
      layoutSchemas.value = {
        ...layoutSchemas.value,
        [config.name]: config,
      };
    } catch (e) {
      error(`Unable to parse ${filename}:`);
      console.error(e);
    }
  }
  
  layouts.forEach(registerSchema);

  const watcher = chokidar.watch(layouts);

  watcher.on('add', path => {
    info(`New layout schema detected: ${path}`);
    registerSchema(path);
  });

  watcher.on('change', path => {
    info(`Layout schema updated: ${path}`);
    registerSchema(path);
  });

  // Scan bundles for any with cartographer: true
  const bundleRoot = path.join(process.env.NODECG_ROOT, 'bundles');
  
  const bundleFolders = fs.readdirSync(bundleRoot);

  bundleFolders.forEach(bundle => {
    try {
      const bundleFile = path.join(bundleRoot, bundle, 'package.json')
      
      if (!fs.existsSync(bundleFile)) return;

      const spec = JSON.parse(fs.readFileSync(bundleFile).toString());

      if (spec.nodecg && spec.nodecg.cartographer) {
        const handlerFileName = spec.nodecg.cartographer.file || 'dist/module.js';
        const cssDirectory = spec.nodecg.cartographer.css || 'css';

        const cssAssets = fs.readdirSync(path.join(bundleRoot, bundle, cssDirectory))
          .filter(file => file.endsWith('.css'))
          .map(file => path.join(cssDirectory, file));
    
        const bundleData = {
          bundleName: bundle,
          handlerFileName,
          cssAssets,
        };
        
        factoryModules.value = [...factoryModules.value, bundleData];

        nodecg.sendMessageToBundle('factoryRegistered', BUNDLE_NAME, bundleData);
      }
    } catch (e) {
      error(`package.json is invalid for ${bundle}:`);
      console.error(e);
    }
  });

  const router = nodecg.Router();

  router.get('/assets/:bundle/:filename(*)', (req, res) => {
    const file = path.join(bundleRoot, req.params.bundle, req.params.filename);

    if (!fs.existsSync(file)) {
      res.sendStatus(404);
    }

    const content = fs.readFileSync(file, 'utf-8');

    res.type(file.endsWith('.css') ? '.css' : '.js');
    res.send(content);
  });

  nodecg.mount('/cartographer', router);
}