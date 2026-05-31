import type { MetricKey, MetricValueType } from '../types/fmcg';

export interface MetricConfig {
  key: MetricKey;
  label: string;
  valueType: MetricValueType;
}

export const METRIC_CONFIGS: MetricConfig[] = [
  { key: 'orders', label: '订单数量', valueType: 'number' },
  { key: 'unitsSold', label: '销量', valueType: 'number' },
  { key: 'grossSalesUsd', label: '总销售额', valueType: 'currency' },
  { key: 'netRevenueUsd', label: '净收入', valueType: 'currency' },
  { key: 'profitUsd', label: '利润', valueType: 'currency' },
  { key: 'discountLossUsd', label: '折扣让利', valueType: 'currency' },
  { key: 'promoInvestmentUsd', label: '促销投入', valueType: 'currency' },
  { key: 'promoRoi', label: '促销ROI', valueType: 'number' },
  { key: 'marketingRoi', label: '营销ROI', valueType: 'number' },
  { key: 'revenueToProfitRate', label: '销售额转利润率', valueType: 'percent' },
  { key: 'marketingSpendUsd', label: '营销支出', valueType: 'currency' },
  { key: 'cogsUsd', label: '销售成本', valueType: 'currency' },
  { key: 'logisticsCostUsd', label: '物流成本', valueType: 'currency' },
  { key: 'cogsRatio', label: '商品成本占比', valueType: 'percent' },
  { key: 'marketingSpendRatio', label: '营销支出占比', valueType: 'percent' },
  { key: 'logisticsCostRatio', label: '物流成本占比', valueType: 'percent' },
  { key: 'profitPerUnit', label: '单件利润', valueType: 'currency' },
  { key: 'avgUnitsSold', label: '平均销量', valueType: 'number' },
  { key: 'avgNetRevenueUsd', label: '平均净收入', valueType: 'currency' },
  { key: 'avgProfitUsd', label: '平均利润', valueType: 'currency' },
  { key: 'avgProfitMarginPct', label: '平均利润率', valueType: 'percent' },
  { key: 'totalProfitMarginPct', label: '总体利润率', valueType: 'percent' },
];

export const METRIC_CONFIG_MAP = Object.fromEntries(
  METRIC_CONFIGS.map((config) => [config.key, config]),
) as Record<MetricKey, MetricConfig>;
