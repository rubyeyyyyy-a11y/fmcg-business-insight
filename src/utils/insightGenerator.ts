import { DIMENSION_CONFIG_MAP } from '../constants/dimensions';
import { METRIC_CONFIG_MAP } from '../constants/metrics';
import type { AggregatedRow, DimensionKey, MetricKey } from '../types/fmcg';
import { formatMetricValue } from './formatter';

function isMarginMetric(metric: MetricKey) {
  return metric === 'avgProfitMarginPct' || metric === 'totalProfitMarginPct';
}

function getMaxRow(rows: AggregatedRow[], metric: MetricKey): AggregatedRow {
  return [...rows].sort((a, b) => b[metric] - a[metric] || a.dimension.localeCompare(b.dimension))[0];
}

function getBalancedPromotionRow(rows: AggregatedRow[]): AggregatedRow {
  const marginRanks = [...rows]
    .sort((a, b) => b.totalProfitMarginPct - a.totalProfitMarginPct || a.dimension.localeCompare(b.dimension))
    .map((row, index) => [row.dimension, index] as const);
  const roiRanks = [...rows]
    .sort((a, b) => b.promoRoi - a.promoRoi || a.dimension.localeCompare(b.dimension))
    .map((row, index) => [row.dimension, index] as const);
  const marginRankMap = new Map(marginRanks);
  const roiRankMap = new Map(roiRanks);

  return [...rows].sort((a, b) => {
    const aScore = (marginRankMap.get(a.dimension) ?? rows.length) + (roiRankMap.get(a.dimension) ?? rows.length);
    const bScore = (marginRankMap.get(b.dimension) ?? rows.length) + (roiRankMap.get(b.dimension) ?? rows.length);
    if (aScore !== bScore) {
      return aScore - bScore;
    }
    if (b.profitUsd !== a.profitUsd) {
      return b.profitUsd - a.profitUsd;
    }
    return a.dimension.localeCompare(b.dimension);
  })[0];
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

export function generatePromotionDiagnosisSummary(rows: AggregatedRow[]): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const volumeLeader = getMaxRow(rows, 'unitsSold');
  const marginLeader = getMaxRow(rows, 'totalProfitMarginPct');
  const roiLeader = getMaxRow(rows, 'promoRoi');
  const investmentLeader = getMaxRow(rows, 'promoInvestmentUsd');

  if (
    volumeLeader.dimension === marginLeader.dimension &&
    marginLeader.dimension === roiLeader.dimension
  ) {
    return `当前筛选条件下，${volumeLeader.dimension} 的销量最高（${formatMetricValue('unitsSold', volumeLeader.unitsSold)}），同时也拿到了最高利润率（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}）和最高促销ROI（${formatMetricValue('promoRoi', roiLeader.promoRoi)}），说明该折扣区间当前兼顾了销售规模与利润效率。`;
  }

  return `当前筛选条件下，${volumeLeader.dimension} 的销量最高（${formatMetricValue('unitsSold', volumeLeader.unitsSold)}），说明该折扣区间对销售规模拉动更明显；但利润率最高的区间是 ${marginLeader.dimension}（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}），促销ROI最高的区间是 ${roiLeader.dimension}（${formatMetricValue('promoRoi', roiLeader.promoRoi)}），而促销投入最高的是 ${investmentLeader.dimension}（${formatMetricValue('promoInvestmentUsd', investmentLeader.promoInvestmentUsd)}），说明销售规模最大并不一定等于利润效率最高。`;
}

export function generatePromotionCostInsight(row: AggregatedRow | null | undefined): string {
  if (!row) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const costItems = [
    { label: '折扣让利', value: row.discountLossUsd },
    { label: '商品成本', value: row.cogsUsd },
    { label: '营销支出', value: row.marketingSpendUsd },
    { label: '物流成本', value: row.logisticsCostUsd },
  ].sort((a, b) => b.value - a.value);
  const primaryCost = costItems[0];

  const profitDescription =
    row.profitUsd >= 0
      ? `最终保留下来的利润为 ${formatMetricValue('profitUsd', row.profitUsd)}，总体利润率为 ${formatMetricValue('totalProfitMarginPct', row.totalProfitMarginPct)}。`
      : `最终转为亏损 ${formatMetricValue('profitUsd', row.profitUsd)}，总体利润率为 ${formatMetricValue('totalProfitMarginPct', row.totalProfitMarginPct)}。`;

  return `${row.dimension} 折扣区间的总销售额为 ${formatMetricValue('grossSalesUsd', row.grossSalesUsd)}，其中 ${primaryCost.label} 是压缩利润的最大单项因素（${formatMetricValue(
    primaryCost.label === '折扣让利' ? 'discountLossUsd' : primaryCost.label === '商品成本' ? 'cogsUsd' : primaryCost.label === '营销支出' ? 'marketingSpendUsd' : 'logisticsCostUsd',
    primaryCost.value,
  )}）。促销总投入为 ${formatMetricValue('promoInvestmentUsd', row.promoInvestmentUsd)}。${profitDescription}`;
}

export function generatePromotionGoldenZoneInsight(rows: AggregatedRow[]): string {
  if (rows.length === 0) {
    return '当前筛选条件下暂无数据，请调整筛选条件。';
  }

  const marginLeader = getMaxRow(rows, 'totalProfitMarginPct');
  const roiLeader = getMaxRow(rows, 'promoRoi');

  if (marginLeader.dimension === roiLeader.dimension) {
    return `${marginLeader.dimension} 同时拥有最高总体利润率（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}）和最高促销ROI（${formatMetricValue('promoRoi', roiLeader.promoRoi)}），可视为当前筛选条件下更值得优先复用的黄金折扣区间。`;
  }

  const balancedRow = getBalancedPromotionRow(rows);
  return `利润率最高的是 ${marginLeader.dimension}（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}），促销ROI最高的是 ${roiLeader.dimension}（${formatMetricValue('promoRoi', roiLeader.promoRoi)}）。如果希望兼顾两项指标，${balancedRow.dimension} 在利润率与促销ROI上的综合表现更均衡。`;
}
