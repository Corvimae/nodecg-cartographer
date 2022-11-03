import React, { useContext } from "react";

export type FactoryModules = Record<string, React.FC<any>>;

export interface SchemaDefinition {
  name: string
  sourceWrapper?: string;
  root: Record<string, unknown>[];
}

export const FactoryContext = React.createContext<FactoryModules>({});
export const SchemaContext = React.createContext<SchemaDefinition>({
  name: 'loading',
  root: [],
});

export const useFactoryContext = () => useContext(FactoryContext);
export const useSchemaContext = () => useContext(SchemaContext);