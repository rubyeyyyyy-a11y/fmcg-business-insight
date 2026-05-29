import { DIMENSION_CONFIG_MAP } from '../constants/dimensions';
import { METRIC_CONFIG_MAP } from '../constants/metrics';
import type { AggregatedRow, DimensionKey, MetricKey } from '../types/fmcg';
import { formatMetricValue } from './formatter';

function isMarginMetric(metric: MetricKey) {
  return metric === 'avgProfitMarginPct' || metric === 'totalProfitMarginPct';
}

export function generateTopBottomInsight(
  rows: AggregatedRow[],
  dimension: DimensionKey,
  metric: MetricKey,
): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const sorted = [...rows].sort((a, b) => b[metric] - a[metric]);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const dimensionLabel = DIMENSION_CONFIG_MAP[dimension].label;
  const metricLabel = METRIC_CONFIG_MAP[metric].label;
  const tone = isMarginMetric(metric) ? '盈利效率' : '该指标';

  return `当前筛选条件下，按${dimensionLabel}统计${metricLabel}时，${top.dimension}最高（${formatMetricValue(metric, top[metric])}），${bottom.dimension}最低（${formatMetricValue(metric, bottom[metric])}），说明不同${dimensionLabel}在${tone}上存在明显差异。`;
}

export function generateExplorerInsight(
  rows: AggregatedRow[],
  dimension: DimensionKey,
  metric: MetricKey,
): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  return generateTopBottomInsight(rows, dimension, metric);
}

export function generatePromotionInsight(rows: AggregatedRow[], metric: MetricKey): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const sorted = [...rows].sort((a, b) => b[metric] - a[metric]);
  const top = sorted[0];

  return `当前筛选条件下，${top.dimension}折扣区间的${METRIC_CONFIG_MAP[metric].label}最高（${formatMetricValue(metric, top[metric])}）。整体上，较高折扣区间通常会带来更强的销售拉动，但这更接近相关性信号，不能直接证明折扣越高越好。`;
}

export function generateBusinessDimensionInsight(
  rows: AggregatedRow[],
  dimension: DimensionKey,
  metric: MetricKey,
): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const base = generateTopBottomInsight(rows, dimension, metric);
  if (isMarginMetric(metric)) {
    return `${base} 建议结合成本和收入规模一起判断利润率表现，避免只看单一效率指标。`;
  }

  return `${base} 建议继续结合收入规模与利润率共同观察，识别高规模但低效率的业务单元。`;
}
