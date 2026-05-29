import { METRIC_CONFIG_MAP } from '../constants/metrics';
import type { MetricKey } from '../types/fmcg';

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrency(value: number): string {
  const absValue = Math.abs(value);

  if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  }

  if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return `$${value.toFixed(2)}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatMetricValue(metric: MetricKey, value: number): string {
  const config = METRIC_CONFIG_MAP[metric];

  switch (config.valueType) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return formatPercent(value);
    default:
      return formatNumber(value);
  }
}
