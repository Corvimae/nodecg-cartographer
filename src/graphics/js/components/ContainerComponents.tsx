import React from 'react';
import styled from 'styled-components';
import { SchemaModuleEntry } from '../../../../types/cartographer';
import { LayoutItem } from '../LayoutItem';

type Direction = 'row' | 'column';

type ContainerComponentProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: SchemaModuleEntry[];
  justify?: string;
  alignItems?: string;
}

const ContainerComponent: React.FC<ContainerComponentProps & { direction: Direction }> = ({
  direction,
  justify,
  alignItems,
  children = [],
  ...props
}) => (
  <Container direction={direction} justify={justify} alignItems={alignItems} {...props}>
    {children.map((childDefinition, index) => (
      <LayoutItem key={index} definition={childDefinition} parent={direction} />
    ))}
  </Container>
)

export const ColumnComponent: React.FC<ContainerComponentProps> = props => (
  <ContainerComponent direction="column" {...props} />
);

export const RowComponent: React.FC<ContainerComponentProps> = props => (
  <ContainerComponent direction="row" {...props} />
);

interface ContainerStyledProps {
  direction: Direction;
  justify?: string;
  alignItems?: string;
}

export const Container = styled.div<ContainerStyledProps>`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: ${({ direction }) => direction};
  justify-content: ${({ justify }) => justify};
  align-items: ${({ alignItems }) => alignItems};
`;
