import { SchemaBox } from "../../types/cartographer";

export const BUNDLE_NAME = 'nodecg-cartographer';

export function formatSchemaBox(value: string | SchemaBox) {
  if (typeof value === 'string') return value;

  return [
    normalizeMetric(value.top) || normalizeMetric(value.vertical) || '0',
    normalizeMetric(value.right) || normalizeMetric(value.horizontal) || '0',
    normalizeMetric(value.bottom) || normalizeMetric(value.vertical) || '0',
    normalizeMetric(value.left) || normalizeMetric(value.horizontal) ||  '0',
  ].join(' ');
}

export function normalizeMetric(value: string | number | null | undefined) {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number') return `${value}px`;

  return value;
}
