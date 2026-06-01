import { useState } from 'react';
import { Segmented, Tabs } from 'antd';
import { AggregatedDataTable } from '../components/AggregatedDataTable';
import { ChartCard } from '../components/ChartCard';
import { EChart } from '../components/EChart';
import { FilterBar } from '../components/FilterBar';
import { InsightCard } from '../components/InsightCard';
import { PageContainer } from '../components/PageContainer';
import type { DimensionKey, FilterOptions, FilterState, FmcgRow, MetricKey } from '../types/fmcg';
import { aggregateByDimension, createEmptyFilters, filterRows, sortAggregatedRows } from '../utils/aggregator';
import {
  buildMetricBarOption,
  buildProfitMarginComboOption,
  buildRevenueMarginComboOption,
} from '../utils/chartOptions';
import { generateBusinessDimensionInsight } from '../utils/insightGenerator';

interface BusinessDimensionPageProps {
  rows: FmcgRow[];
  options: FilterOptions;
}

type BusinessTabKey = 'salesChannel' | 'productCategory' | 'region';

const SORT_OPTIONS: Array<{ label: string; value: MetricKey }> = [
  { label: '按利润排序', value: 'profitUsd' },
  { label: '按净收入排序', value: 'netRevenueUsd' },
  { label: '按利润率排序', value: 'totalProfitMarginPct' },
];

export function BusinessDimensionPage({ rows, options }: BusinessDimensionPageProps) {
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters());
  const [activeTab, setActiveTab] = useState<BusinessTabKey>('salesChannel');
  const [sortMetric, setSortMetric] = useState<MetricKey>('profitUsd');

  const filteredRows = filterRows(rows, filters);
  const aggregatedRows = sortAggregatedRows(
    aggregateByDimension(filteredRows, activeTab as DimensionKey),
    activeTab as DimensionKey,
    sortMetric,
    'desc',
  );

  const chartOption =
    activeTab === 'salesChannel'
      ? buildProfitMarginComboOption(aggregatedRows)
      : activeTab === 'productCategory'
        ? buildRevenueMarginComboOption(aggregatedRows)
        : buildMetricBarOption(aggregatedRows, 'profitUsd');

  return (
    <PageContainer
      title="业务维度分析"
      description="从销售渠道、产品品类和地区市场三个维度，对比不同业务单元的收入、利润及利润率表现。"
    >
      <FilterBar filters={filters} options={options} onChange={setFilters} />

      <ChartCard
        title="核心业务维度对比"
        description="不同业务维度下的收入规模、利润贡献与利润率表现存在差异，可用于识别重点业务单元。"
        extra={
          <Segmented
            options={SORT_OPTIONS}
            value={sortMetric}
            onChange={(value) => setSortMetric(value as MetricKey)}
          />
        }
      >
        <Tabs
          activeKey={activeTab}
          onChange={(value) => setActiveTab(value as BusinessTabKey)}
          items={[
            { key: 'salesChannel', label: '销售渠道' },
            { key: 'productCategory', label: '产品品类' },
            { key: 'region', label: '地区市场' },
          ]}
        />
        <EChart option={chartOption} />
      </ChartCard>

      <ChartCard title="业务维度聚合数据表" description="下表列示当前维度、排序方式和筛选条件下的聚合结果。">
        <AggregatedDataTable rows={aggregatedRows} pageSize={10} />
      </ChartCard>

      <InsightCard
        title="维度结论"
        content={generateBusinessDimensionInsight(aggregatedRows, activeTab as DimensionKey, sortMetric)}
      />
    </PageContainer>
  );
}
