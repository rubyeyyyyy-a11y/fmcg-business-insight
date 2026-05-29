import { useState } from 'react';
import { Segmented } from 'antd';
import { AggregatedDataTable } from '../components/AggregatedDataTable';
import { ChartCard } from '../components/ChartCard';
import { EChart } from '../components/EChart';
import { FilterBar } from '../components/FilterBar';
import { InsightCard } from '../components/InsightCard';
import { PageContainer } from '../components/PageContainer';
import type { FilterOptions, FilterState, FmcgRow, MetricKey } from '../types/fmcg';
import { aggregateByDimension, createEmptyFilters, filterRows, sortAggregatedRows } from '../utils/aggregator';
import { buildMetricBarOption } from '../utils/chartOptions';
import { generatePromotionInsight } from '../utils/insightGenerator';

interface PromotionAnalysisPageProps {
  rows: FmcgRow[];
  options: FilterOptions;
}

const PROMOTION_METRICS: Array<{ label: string; value: MetricKey }> = [
  { label: '平均销量', value: 'avgUnitsSold' },
  { label: '平均净收入', value: 'avgNetRevenueUsd' },
  { label: '平均利润', value: 'avgProfitUsd' },
  { label: '平均利润率', value: 'avgProfitMarginPct' },
];

export function PromotionAnalysisPage({ rows, options }: PromotionAnalysisPageProps) {
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters());
  const [metric, setMetric] = useState<MetricKey>('avgUnitsSold');

  const filteredRows = filterRows(rows, filters);
  const discountRows = sortAggregatedRows(
    aggregateByDimension(filteredRows, 'discountBin'),
    'discountBin',
    metric,
    'default',
  );

  return (
    <PageContainer
      title="促销分析"
      description="观察折扣区间与销量、收入、利润之间的关系，帮助讨论促销策略与盈利之间的平衡。"
    >
      <FilterBar filters={filters} options={options} onChange={setFilters} />

      <ChartCard
        title="折扣区间影响分析"
        description="切换不同指标，比较折扣力度变化对平均业务表现的影响。"
        extra={
          <Segmented
            options={PROMOTION_METRICS}
            value={metric}
            onChange={(value) => setMetric(value as MetricKey)}
          />
        }
      >
        <EChart option={buildMetricBarOption(discountRows, metric)} />
      </ChartCard>

      <ChartCard title="折扣区间聚合数据表" description="表格和图表使用同一批筛选后的原始订单动态聚合。">
        <AggregatedDataTable rows={discountRows} pageSize={10} />
      </ChartCard>

      <InsightCard title="促销结论" content={generatePromotionInsight(discountRows, metric)} />
    </PageContainer>
  );
}
