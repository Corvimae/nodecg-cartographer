export interface ModuleFactoryDefinition {
  bundleName: string;
  handlerFileName: string;
  cssAssets: string[];
}

export type SchemaModuleEntry = Record<string, unknown> & {
  type: string;
  width?: string | number;
  height?: string | number;
}