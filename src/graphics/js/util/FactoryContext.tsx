import React, { useContext } from "react";

export type FactoryModules = Record<string, React.FC<any>>;

export const FactoryContext = React.createContext<FactoryModules>({});

export const useFactoryContext = () => useContext(FactoryContext);