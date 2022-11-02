import React from 'react';
import styled from 'styled-components';
import { SchemaModuleEntry } from '../../../../types/cartographer';
import { LayoutItem } from '../LayoutItem';

type Direction = 'row' | 'column';

type ContainerComponentProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  children?: SchemaModuleEntry[];
}


const ContainerComponent: React.FC<ContainerComponentProps & { direction: Direction }> = ({
  direction,
  children = [],
}) => (
  <Container direction={direction}>
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
}

export const Container = styled.div<ContainerStyledProps>`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: ${({ direction }) => direction};
`;
