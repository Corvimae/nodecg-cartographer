import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { useReplicant, useListenFor, useIsDebugMode } from '../../lib/hooks';
import { BUNDLE_NAME } from '../../lib/utils';
import { ColumnComponent, RowComponent } from './components/ContainerComponents';
import { DivComponent } from './components/DivComponent';
import { SourceComponent } from './components/SourceComponent';
import { LayoutItem } from './LayoutItem';
import { FactoryContext, FactoryModules, SchemaContext } from './util/LayoutContext';

export const LayoutApp = () => {
  const latestFactorySet = useRef({});
  const [factories, setFactories] = useState<FactoryModules>({});
  const hasRegisteredDefaults = useRef(false);
  const [layoutSchemas] = useReplicant('layoutSchemas', {}, {
    namespace: BUNDLE_NAME,
    persistent: false,
  });

  const registerModule = useCallback((itemName, callback) => {
    latestFactorySet.current = {
      ...latestFactorySet.current,
      [itemName]: callback
    };

    setFactories(latestFactorySet.current);
  }, [factories]);

  global.cartographer = {
    register: registerModule,
    useReplicant,
    useListenFor,
    useCallback,
    useMemo,
    useState,
    useEffect,
    useRef,
    styled,
  }

  const layoutKey = useMemo(() => (
    Object.fromEntries(new URLSearchParams(window.location.search)).layout
  ), [window.location.search]);
  
  const activeLayout = layoutSchemas && layoutSchemas[layoutKey];
  const [debugMode] = useIsDebugMode();

  useEffect(() => {
    if (!hasRegisteredDefaults.current) {
      registerModule('div', DivComponent);
      registerModule('row', RowComponent);
      registerModule('column', ColumnComponent);
      registerModule('source', SourceComponent);

      hasRegisteredDefaults.current = true;
    }
  }, []);

  if (!activeLayout) return null;

  return (
    <FactoryContext.Provider value={factories}>
      <SchemaContext.Provider value={activeLayout}>
        <Container className={`cartographer-root ${debugMode ? 'debug' : ''}`}>
          {activeLayout.root.map((item, index) => (
            <LayoutItem key={index} definition={item} parent="root" />
          ))}
        </Container>
      </SchemaContext.Provider>
    </FactoryContext.Provider>
  );
}

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
`;