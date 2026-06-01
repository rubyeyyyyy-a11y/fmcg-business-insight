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

  return `当前筛选条件下，${top.dimension}折扣区间的${METRIC_CONFIG_MAP[metric].label}最高（${formatMetricValue(metric, top[metric])}）。整体来看，较高折扣区间通常对应更高的平均销量和平均利润，说明折扣对销售规模具有一定拉动作用；但促销效果仍需结合利润率和成本结构综合评估。`;
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
    return `${base} 需结合收入规模与成本结构共同判断利润率表现。`;
  }

  if (dimension === 'salesChannel') {
    return `${base} 不同销售渠道在收入规模和利润贡献上存在差异，需结合利润率判断渠道经营效率。`;
  }

  if (dimension === 'productCategory') {
    return `${base} 不同产品品类的收入贡献与利润率表现并不完全一致，需要同时关注销售规模和盈利效率。`;
  }

  return `${base} 不同地区市场的利润贡献存在差异，可用于识别重点市场和后续优化方向。`;
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
    return `当前筛选条件下，${volumeLeader.dimension} 折扣区间销量最高（${formatMetricValue('unitsSold', volumeLeader.unitsSold)}），同时利润率（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}）和促销ROI（${formatMetricValue('promoRoi', roiLeader.promoRoi)}）也处于最高水平，说明该区间当前兼顾了销售规模与利润效率。`;
  }

  return `当前筛选条件下，${volumeLeader.dimension} 折扣区间销量表现最高（${formatMetricValue('unitsSold', volumeLeader.unitsSold)}），说明该区间对销售规模的拉动更明显；但利润率最高区间为 ${marginLeader.dimension}（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}），促销ROI最高区间为 ${roiLeader.dimension}（${formatMetricValue('promoRoi', roiLeader.promoRoi)}），促销投入最高区间为 ${investmentLeader.dimension}（${formatMetricValue('promoInvestmentUsd', investmentLeader.promoInvestmentUsd)}）。这表明销售规模最大并不必然代表利润效率最高，促销策略仍需在规模增长与利润回报之间取得平衡。`;
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
      ? `最终利润为 ${formatMetricValue('profitUsd', row.profitUsd)}，总体利润率为 ${formatMetricValue('totalProfitMarginPct', row.totalProfitMarginPct)}。`
      : `最终利润为 ${formatMetricValue('profitUsd', row.profitUsd)}，总体利润率为 ${formatMetricValue('totalProfitMarginPct', row.totalProfitMarginPct)}。`;

  return `${row.dimension} 折扣区间的总销售额为 ${formatMetricValue('grossSalesUsd', row.grossSalesUsd)}，其中 ${primaryCost.label} 是影响利润表现的最大单项成本因素（${formatMetricValue(
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
    return `${marginLeader.dimension} 同时拥有最高总体利润率（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}）和最高促销ROI（${formatMetricValue('promoRoi', roiLeader.promoRoi)}），在当前筛选条件下体现出较高的投入效率。`;
  }

  const balancedRow = getBalancedPromotionRow(rows);
  return `利润率最高的是 ${marginLeader.dimension}（${formatMetricValue('totalProfitMarginPct', marginLeader.totalProfitMarginPct)}），促销ROI最高的是 ${roiLeader.dimension}（${formatMetricValue('promoRoi', roiLeader.promoRoi)}）。若同时关注利润效率与投入回报，${balancedRow.dimension} 的综合表现相对更均衡。`;
}
