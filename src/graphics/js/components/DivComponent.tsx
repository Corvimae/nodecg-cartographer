import React from 'react';

type DivComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  text?: string;
}

export const DivComponent: React.FC<DivComponentProps> = props => (
  <div {...props}>{props.text}</div>
)