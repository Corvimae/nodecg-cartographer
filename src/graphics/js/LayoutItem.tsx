import React from 'react';
import styled from 'styled-components';
import { SchemaBox, SchemaModuleEntry } from '../../../types/cartographer';
import { formatSchemaBox, normalizeMetric } from '../../lib/utils';
import { useFactoryContext } from './util/LayoutContext';

interface LayoutItemProps {
  definition: SchemaModuleEntry;
  parent: string;
}

function normalizeBox(value: string | null | undefined | SchemaBox) {
  if (value === null || value === undefined) return null;

  return formatSchemaBox(value);
}

export const LayoutItem: React.FC<LayoutItemProps> = ({ definition: { type, ...props }, parent }) => {
  const factories = useFactoryContext();
  const Factory = factories[type];

  if (!Factory) return;

  const width = normalizeMetric(props.width);
  const height = normalizeMetric(props.height);
  const padding = normalizeBox(props.padding);
  const margin = normalizeBox(props.margin);

  const isParentColumn = parent === 'column' || parent === 'root';
  const isParentRow = parent === 'row';
  
  return (
    <LayoutItemContainer
      className={`cartographer-${type}`}
      width={width}
      height={height}
      padding={padding}
      margin={margin}
      isParentColumn={isParentColumn}
      isParentRow={isParentRow}
    >
      <Factory {...props} />
    </LayoutItemContainer>
  );
}

interface ContainerProps {
  width: string;
  height: string;
  padding: string;
  margin: string;
  isParentColumn: boolean;
  isParentRow: boolean;
};

function shouldContainerStretchWidth(props: ContainerProps) {
  return props.width === 'stretch' && props.isParentRow;
}

function shouldContainerStretchHeight(props: ContainerProps) {
  return props.height === 'stretch' && props.isParentColumn;
}

function shouldContainerStretchAcrossFlexAxis(props: ContainerProps) {
  return shouldContainerStretchWidth(props) || shouldContainerStretchHeight(props);
}

const LayoutItemContainer = styled.div<ContainerProps>`
  position: relative;
  width: ${props => !shouldContainerStretchWidth(props) && props.width};
  height: ${props => !shouldContainerStretchHeight(props) && props.height};
  min-width: ${props => shouldContainerStretchWidth(props) ? '0' : props.width};
  min-height: ${props => shouldContainerStretchHeight(props) ? '0' : props.height};
  align-self: ${props => shouldContainerStretchAcrossFlexAxis(props) && 'stretch'};
  flex-grow: ${props => shouldContainerStretchAcrossFlexAxis(props) && '1'};
  padding: ${props => props.padding};
  margin: ${props => props.margin};
`;