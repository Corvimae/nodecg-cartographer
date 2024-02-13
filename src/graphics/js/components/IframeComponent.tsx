import React from 'react';
import styled from 'styled-components';

type IframeComponentProps = Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>, 'ref'>;

export const IframeComponent: React.FC<IframeComponentProps> = props => (
  <Frame scrolling="no" {...props} />
);

const Frame = styled.iframe`
    width: 100%;
    height: 100%;
    border: none;
    overflow: hidden;
    pointer-events: none;
`;