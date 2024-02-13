import { NodeCGServer } from 'nodecg-types/types/lib/nodecg-instance';
import path from 'path';
import fs from 'fs';
import YAML from 'yaml';
import chokidar from 'chokidar';
import { BUNDLE_NAME } from './lib/utils';
import { error, log } from './lib/log';
import { info } from 'console';

function getCartographerConfig(bundlePath: string) {
  const bundleFile = path.join(bundlePath, 'package.json')
      
  if (!fs.existsSync(bundleFile)) return;

  const spec = JSON.parse(fs.readFileSync(bundleFile).toString());
  
  return spec.nodecg && spec.nodecg.cartographer;
}

function findLayouts(layoutPath: string): string[] {
  if (!fs.existsSync(layoutPath)) return [];
  if (layoutPath.includes('bundles')) {
    // Check to make sure Cartographer is enabled
    if (!getCartographerConfig(path.join(layoutPath, '..'))) {
      return [];
    }
  }
  const layouts = fs.readdirSync(layoutPath).map(filename => path.join(layoutPath, filename));

  log(`Found ${layouts.length} layout(s) at ${layoutPath}.`);

  return layouts;
}

export = (nodecg: NodeCGServer) => {
  // NODECG_ROOT isn't reliable anymore it seems, but we know where the bundle has to be installed.
  const nodeCGRoot = process.env.NODECG_ROOT || path.join(__dirname, '..', '..', '..');
  const rootLayoutDir = process.env.CARTOGRAPHER_LAYOUT_DIR || path.join(nodeCGRoot, 'layouts');

  const bundleDirs = fs.readdirSync(path.join(nodeCGRoot, 'bundles')).map(filename => path.join(nodeCGRoot, 'bundles', filename, 'layouts'));
  const layouts = [
    rootLayoutDir,
    ...bundleDirs,
  ].flatMap(findLayouts)

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

      if (!config) return;

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
  const bundleRoot = path.join(nodeCGRoot, 'bundles');
  
  const bundleFolders = fs.readdirSync(bundleRoot);

  bundleFolders.forEach(bundle => {
    try {
      const cartographerConfig = getCartographerConfig(path.join(bundleRoot, bundle));
      if (!!cartographerConfig) {
        const handlerFileName = cartographerConfig.file || 'dist/module.js';
        const cssDirectory = cartographerConfig.css || 'css';

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