import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useIsDebugMode, useOnMount } from '../../../lib/hooks';
import { useFactoryContext, useSchemaContext } from '../util/LayoutContext';

type SourceComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string;
  resolution?: string;
  ignoreWrapper?: boolean;
}

export const SourceComponent: React.FC<SourceComponentProps> = props => {
  const ref = useRef<HTMLDivElement>();
  const [metrics, setMetrics] = useState<DOMRect>(null);
  const schema = useSchemaContext();
  const factories = useFactoryContext();
  const debugIntervalId = useRef(null);

  const [isDebugMode, metricRounding] = useIsDebugMode();

  const inverseResolution = useMemo(() => {
    if (!props.resolution) return 1;
    
    const [x, y] = props.resolution.split('x').map(Number);

    if (Number.isNaN(x) || Number.isNaN(y)) return 1;

    return y / x;
  }, [props.resolution]);

  const possiblyRound = useCallback(value => {
    if (metricRounding) return Math.floor(value);

    return value.toFixed(2);
  }, [metricRounding]);

  useOnMount(() => {
    if(!isDebugMode || !ref.current) {
      if (metrics !== null) setMetrics(null);
      if (debugIntervalId.current) clearInterval(debugIntervalId.current);
    } else {
      const updateMetrics = () => {
        const current = ref.current.getBoundingClientRect();

        if (!metrics || (current.x !== metrics.x || current.y !== metrics.y || current.width !== metrics.width || current.height !== metrics.height)) {
          setMetrics(current);
        }
      };

      debugIntervalId.current = setInterval(updateMetrics, 5000);
      updateMetrics();
    }
  });

  const Wrapper = useMemo(() => {
    if (schema.sourceWrapper && !props.ignoreWrapper) {
      const Factory = factories[schema.sourceWrapper];

      if (Factory) return Factory;
    }
    
    return props => <div {...props} />;
  }, [factories, schema.sourceWrapper])
  
  return (
    <Wrapper>
      <Container ref={ref} debugMode={isDebugMode} {...props} inverseResolution={inverseResolution}>
        {isDebugMode && (
          <DebugInfo>
            <div>{props.id}</div>
            {metrics && (
              <div>{possiblyRound(metrics.width)}x{possiblyRound(metrics.height)} @ ({possiblyRound(metrics.x)}, {possiblyRound(metrics.y)})</div>
            )}
          </DebugInfo>
        )}
      </Container>
    </Wrapper>
  );
};

const Container = styled.div<{ inverseResolution: number; debugMode: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  /* height: 100%; */
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ debugMode }) => debugMode && 'rgba(0, 0, 0, 0.25)'};
  padding-top: ${({ inverseResolution }) => inverseResolution * 100}%;
`;

const DebugInfo = styled.div`
  position: absolute;
  text-align: center;
  width: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
