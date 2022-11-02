import React, { useMemo, useRef } from 'react';
import styled from 'styled-components';

type SourceComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  id?: string;
  resolution?: string;
}

export const SourceComponent: React.FC<SourceComponentProps> = props => {
  const ref = useRef<HTMLDivElement>();
  const isDebugMode = useMemo(() => (
    Boolean(Object.fromEntries(new URLSearchParams(window.location.search)).debug)
  ), [window.location.search]);

  const inverseResolution = useMemo(() => {
    if (!props.resolution) return 1;
    
    const [x, y] = props.resolution.split('x').map(Number);

    console.log(x, y);
    if (Number.isNaN(x) || Number.isNaN(y)) return 1;

    return y / x;
  }, [props.resolution]);

  const metrics = useMemo(() => {
    if(!isDebugMode || !ref.current) return null;
    return ref.current.getBoundingClientRect();
    
  }, [isDebugMode, ref.current])

  return (
    <Container ref={ref} debugMode={isDebugMode} {...props} inverseResolution={inverseResolution}>
      {isDebugMode && (
        <DebugInfo>
          <div>{props.id}</div>
          {metrics && (
            <div>{metrics.width}x{metrics.height} @ ({metrics.x}, {metrics.y})</div>
          )}
        </DebugInfo>
      )}
    </Container>
  );
};

const Container = styled.div<{ inverseResolution: number; debugMode: boolean }>`
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: ${({ debugMode }) => debugMode && 'rgba(0, 0, 0, 0.25)'};
  padding-top: ${({ inverseResolution }) => inverseResolution * 100}%;
`;

const DebugInfo = styled.div`
  position: absolute;
  text-align: center;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
