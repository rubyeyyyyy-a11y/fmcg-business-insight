import { useEffect, useState } from 'react';
import { Card, Col, Empty, Row, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { ChartCard } from '../components/ChartCard';
import { EChart } from '../components/EChart';
import { FilterBar } from '../components/FilterBar';
import { InsightCard } from '../components/InsightCard';
import { KpiCard } from '../components/KpiCard';
import { PageContainer } from '../components/PageContainer';
import type { AggregatedRow, FilterOptions, FilterState, FmcgRow } from '../types/fmcg';
import { aggregateByDimension, aggregateTotal, createEmptyFilters, filterRows, sortAggregatedRows } from '../utils/aggregator';
import {
  buildPromotionCostWaterfallOption,
  buildPromotionGoldenZoneOption,
  buildPromotionProfitEfficiencyOption,
  buildPromotionScaleOption,
} from '../utils/chartOptions';
import { formatCurrency, formatMetricValue, formatNumber, formatPercent } from '../utils/formatter';
import {
  generatePromotionCostInsight,
  generatePromotionDiagnosisSummary,
  generatePromotionGoldenZoneInsight,
} from '../utils/insightGenerator';

const { Paragraph } = Typography;

interface PromotionProfitDiagnosisPageProps {
  rows: FmcgRow[];
  options: FilterOptions;
}

const NO_DATA_TEXT = '当前筛选条件下暂无数据，请调整筛选条件。';

const TABLE_COLUMNS: ColumnsType<AggregatedRow> = [
  {
    title: '折扣区间',
    dataIndex: 'dimension',
    key: 'dimension',
    fixed: 'left',
    width: 120,
  },
  {
    title: '订单数量',
    dataIndex: 'orders',
    key: 'orders',
    render: (value: number) => formatNumber(value),
  },
  {
    title: '销量',
    dataIndex: 'unitsSold',
    key: 'unitsSold',
    render: (value: number) => formatNumber(value),
  },
  {
    title: '总销售额',
    dataIndex: 'grossSalesUsd',
    key: 'grossSalesUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '净收入',
    dataIndex: 'netRevenueUsd',
    key: 'netRevenueUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '利润',
    dataIndex: 'profitUsd',
    key: 'profitUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '总体利润率',
    dataIndex: 'totalProfitMarginPct',
    key: 'totalProfitMarginPct',
    render: (value: number) => formatPercent(value),
  },
  {
    title: '折扣让利',
    dataIndex: 'discountLossUsd',
    key: 'discountLossUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '营销支出',
    dataIndex: 'marketingSpendUsd',
    key: 'marketingSpendUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '促销投入',
    dataIndex: 'promoInvestmentUsd',
    key: 'promoInvestmentUsd',
    render: (value: number) => formatCurrency(value),
  },
  {
    title: '促销ROI',
    dataIndex: 'promoRoi',
    key: 'promoRoi',
    render: (value: number) => formatMetricValue('promoRoi', value),
  },
  {
    title: '营销ROI',
    dataIndex: 'marketingRoi',
    key: 'marketingRoi',
    render: (value: number) => formatMetricValue('marketingRoi', value),
  },
  {
    title: '单件利润',
    dataIndex: 'profitPerUnit',
    key: 'profitPerUnit',
    render: (value: number) => formatCurrency(value),
  },
];

export function PromotionProfitDiagnosisPage({
  rows,
  options,
}: PromotionProfitDiagnosisPageProps) {
  const [filters, setFilters] = useState<FilterState>(createEmptyFilters());
  const [selectedDiscountBin, setSelectedDiscountBin] = useState<string>();

  const filteredRows = filterRows(rows, filters);
  const total = aggregateTotal(filteredRows);
  const discountRows = aggregateByDimension(filteredRows, 'discountBin');
  const sortedDiscountRows = sortAggregatedRows(discountRows, 'discountBin', 'profitUsd', 'default');
  const hasData = sortedDiscountRows.length > 0;

  useEffect(() => {
    if (sortedDiscountRows.length === 0) {
      setSelectedDiscountBin(undefined);
      return;
    }

    const stillExists = sortedDiscountRows.some((row) => row.dimension === selectedDiscountBin);
    if (stillExists) {
      return;
    }

    const defaultRow = [...sortedDiscountRows].sort(
      (a, b) => b.promoInvestmentUsd - a.promoInvestmentUsd || a.dimension.localeCompare(b.dimension),
    )[0];
    setSelectedDiscountBin(defaultRow.dimension);
  }, [selectedDiscountBin, sortedDiscountRows]);

  const selectedDiscountRow =
    sortedDiscountRows.find((row) => row.dimension === selectedDiscountBin) ?? sortedDiscountRows[0] ?? null;

  const diagnosisContent = hasData
    ? [
        generatePromotionDiagnosisSummary(sortedDiscountRows),
        generatePromotionCostInsight(selectedDiscountRow),
        generatePromotionGoldenZoneInsight(sortedDiscountRows),
      ].join(' ')
    : NO_DATA_TEXT;

  return (
    <PageContainer
      title="促销利润诊断"
      description="本页面围绕“高折扣与高营销是否真正转化为利润”展开分析，通过销售规模、利润率、成本拆解和促销 ROI 判断促销活动的实际经营价值。"
    >
      <Card className="chart-card" bordered={false} title="问题说明">
        <Paragraph className="chart-card__description">
          本页面围绕高折扣与高营销投入是否真正转化为利润展开分析，结合销售规模、利润率、成本拆解和促销 ROI，评估促销活动的实际经营价值。
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总销售额" value={formatCurrency(total.grossSalesUsd)} description="反映当前筛选条件下的整体销售规模。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总净收入" value={formatCurrency(total.netRevenueUsd)} description="反映扣除折扣后的实际收入规模。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总利润" value={formatCurrency(total.profitUsd)} description="反映促销活动最终形成的利润表现。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="整体利润率" value={formatPercent(total.totalProfitMarginPct)} description="用于判断收入规模是否同步转化为利润效率。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="促销投入" value={formatCurrency(total.promoInvestmentUsd)} description="折扣让利与营销支出的合计投入。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="促销ROI" value={formatMetricValue('promoRoi', total.promoRoi)} description="用于衡量单位促销投入对应的利润回报。" />
        </Col>
      </Row>

      <FilterBar filters={filters} options={options} onChange={setFilters} />

      <ChartCard
        title="表面繁荣：折扣是否拉动销售规模？"
        description="对比不同折扣区间下的总销售额与销量，观察折扣力度对销售规模的拉动效果。"
      >
        {hasData ? (
          <EChart option={buildPromotionScaleOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <ChartCard
        title="利润效率：收入增长是否同步转化为利润？"
        description="对比不同折扣区间下的净收入与总体利润率，判断销售规模增长是否同步带来利润效率提升。"
      >
        {hasData ? (
          <EChart option={buildPromotionProfitEfficiencyOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <ChartCard
        title="利润拆账：销售额如何转化为最终利润？"
        description="从总销售额出发，依次扣除折扣让利、商品成本、营销支出和物流成本，展示最终利润的形成过程。"
        extra={
          <Select
            placeholder="选择折扣区间"
            value={selectedDiscountRow?.dimension}
            onChange={setSelectedDiscountBin}
            disabled={!hasData}
            style={{ width: 240 }}
            options={sortedDiscountRows.map((row) => ({
              label: `${row.dimension} | 促销投入 ${formatCurrency(row.promoInvestmentUsd)}`,
              value: row.dimension,
            }))}
          />
        }
      >
        {hasData && selectedDiscountRow ? (
          <EChart option={buildPromotionCostWaterfallOption(selectedDiscountRow)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <ChartCard
        title="黄金区间：哪个折扣区间更具投入价值？"
        description="综合比较不同折扣区间的总体利润率与促销 ROI，识别销售规模与利润效率相对均衡的折扣区间。"
      >
        {hasData ? (
          <EChart option={buildPromotionGoldenZoneOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <InsightCard title="诊断结论" content={diagnosisContent} />

      <ChartCard title="折扣区间利润诊断明细" description="下表列示各折扣区间的销售规模、利润表现及投入回报结果。">
        <Table
          rowKey={(row) => row.dimension}
          columns={TABLE_COLUMNS}
          dataSource={sortedDiscountRows}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1600 }}
        />
      </ChartCard>
    </PageContainer>
  );
}
