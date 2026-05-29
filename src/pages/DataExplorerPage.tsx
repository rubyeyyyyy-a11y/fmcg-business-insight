import { useState } from 'react';
import { Card, Empty, Segmented, Select, Space, Typography } from 'antd';
import { AggregatedDataTable } from '../components/AggregatedDataTable';
import { ChartCard } from '../components/ChartCard';
import { EChart } from '../components/EChart';
import { FilterBar } from '../components/FilterBar';
import { InsightCard } from '../components/InsightCard';
import { PageContainer } from '../components/PageContainer';
import { DIMENSION_CONFIGS } from '../constants/dimensions';
import { METRIC_CONFIGS } from '../constants/metrics';
import type {
  ChartType,
  DimensionKey,
  FilterOptions,
  FilterState,
  FmcgRow,
  MetricKey,
  SortOrder,
} from '../types/fmcg';
import { aggregateByDimension, createEmptyFilters, filterRows, sortAggregatedRows } from '../utils/aggregator';
import { buildExplorerChartOption } from '../utils/chartOptions';
import { generateExplorerInsight } from '../utils/insightGenerator';

const { Text } = Typography;

interface DataExplorerPageProps {
  rows: FmcgRow[];
  options: FilterOptions;
}

export function DataExplorerPage({ rows, options }: DataExplorerPageProps) {
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters());
  const [dimension, setDimension] = useState<DimensionKey>('salesChannel');
  const [metric, setMetric] = useState<MetricKey>('profitUsd');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  const filteredRows = filterRows(rows, filters);
  const aggregatedRows = sortAggregatedRows(
    aggregateByDimension(filteredRows, dimension),
    dimension,
    metric,
    sortOrder,
  );
  const hasData = aggregatedRows.length > 0;

  return (
    <PageContainer
      title="数据探索器"
      description="基于原始 CSV 实时筛选、分组和聚合，自由组合维度、指标、图表类型，完成课堂分析展示。"
    >
      <div className="explorer-layout">
        <Card className="explorer-panel" bordered={false}>
          <Space direction="vertical" size={16} className="explorer-panel__space">
            <FilterBar filters={filters} options={options} onChange={setFilters} />
            <div className="control-item">
              <Text>分析维度</Text>
              <Select<DimensionKey>
                value={dimension}
                options={DIMENSION_CONFIGS.map((item) => ({ label: item.label, value: item.key }))}
                onChange={setDimension}
              />
            </div>
            <div className="control-item">
              <Text>分析指标</Text>
              <Select<MetricKey>
                value={metric}
                options={METRIC_CONFIGS.map((item) => ({ label: item.label, value: item.key }))}
                onChange={setMetric}
              />
            </div>
            <div className="control-item">
              <Text>图表类型</Text>
              <Segmented
                block
                options={[
                  { label: '柱状图', value: 'bar' },
                  { label: '折线图', value: 'line' },
                  { label: '饼图', value: 'pie' },
                ]}
                value={chartType}
                onChange={(value) => setChartType(value as ChartType)}
              />
            </div>
            <div className="control-item">
              <Text>排序方式</Text>
              <Select<SortOrder>
                value={sortOrder}
                options={[
                  { label: '默认排序', value: 'default' },
                  { label: '按当前指标升序', value: 'asc' },
                  { label: '按当前指标降序', value: 'desc' },
                ]}
                onChange={setSortOrder}
              />
            </div>
          </Space>
        </Card>

        <div className="explorer-main">
          <ChartCard
            title="动态聚合图表"
            description="主流程始终基于 `/data/fmcg_sales_cleaned_2023_2025.csv` 原始订单数据，不依赖静态汇总表。"
          >
            {hasData ? <EChart option={buildExplorerChartOption(aggregatedRows, dimension, metric, chartType)} /> : <Empty description="当前筛选条件下暂无数据" className="chart-empty" />}
          </ChartCard>
          <InsightCard title="自动分析结论" content={generateExplorerInsight(aggregatedRows, dimension, metric)} />
        </div>
      </div>

      <ChartCard title="聚合结果表格" description="表格同步展示当前维度、指标、排序方式和筛选条件下的结果。">
        <AggregatedDataTable rows={aggregatedRows} pageSize={10} />
      </ChartCard>
    </PageContainer>
  );
}
