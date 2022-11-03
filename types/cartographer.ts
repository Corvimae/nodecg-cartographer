export interface ModuleFactoryDefinition {
  bundleName: string;
  handlerFileName: string;
  cssAssets: string[];
}

export type SchemaBox = Partial<{
  vertical: number | string;
  horizontal: number | string;
  top: number | string;
  right: number | string;
  bottom: number | string;
  left: number | string;
}>;

export type SchemaModuleEntry = Record<string, unknown> & {
  type: string;
  width?: string | number;
  height?: string | number;
  padding?: string | SchemaBox;
  margin?: string | SchemaBox;
}