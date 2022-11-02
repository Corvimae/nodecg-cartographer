import React from 'react';
import ReactDOM from 'react-dom/client';
import { ModuleFactoryDefinition } from '../../../types/cartographer';
import { BUNDLE_NAME } from '../../lib/utils';
import { LayoutApp } from './LayoutApp';

function toBundleFilePath(bundleName: string, filename: string) {
  return `/cartographer/assets/${bundleName}/${filename}`;
}

function addModuleScript(filename: string) {
  const scriptElem = document.createElement('script');

  scriptElem.src = filename;
  scriptElem.type = 'text/javascript';

  document.body.appendChild(scriptElem);

  console.info('Registered module factory', filename);
}

function addCSSAsset(filename) {
  const linkElem = document.createElement('link');

  linkElem.href = filename;
  linkElem.type = 'text/css';
  linkElem.rel = 'stylesheet';

  document.head.appendChild(linkElem);

  console.info('Registered module CSS asset', filename);
}

const factoryModules = NodeCG.Replicant('factoryModules', BUNDLE_NAME, {
  defaultValue: [],
  persistent: false,
});

function registerFactory(definition: ModuleFactoryDefinition) {
  addModuleScript(toBundleFilePath(definition.bundleName, definition.handlerFileName));

  definition.cssAssets
    .map(asset => toBundleFilePath(definition.bundleName, asset))
    .forEach(addCSSAsset);
}

NodeCG.waitForReplicants(factoryModules).then(() => {
  factoryModules.value.forEach(registerFactory);
});

nodecg.listenFor('factoryRegistered', BUNDLE_NAME, registerFactory);

const root = ReactDOM.createRoot(document.querySelector('#app'));

root.render(
  <React.StrictMode>
    <LayoutApp />
  </React.StrictMode>
);