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
      description="Promotion Profit Diagnosis：基于原始 CSV 动态拆解折扣、营销、成本与利润的关系，判断促销增长到底是表面繁荣，还是有效盈利。"
    >
      <Card className="chart-card" bordered={false} title="问题说明">
        <Paragraph className="chart-card__description">
          本页面用于回答一个核心问题：高折扣和高营销投入是否真的换来了有效利润。系统不会只看销量和销售额，而是进一步拆解折扣让利、营销支出、商品成本、物流成本和最终利润，判断促销是带来真金白银，还是只制造了表面繁荣。
        </Paragraph>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总销售额" value={formatCurrency(total.grossSalesUsd)} description="观察促销前口径下的总体销售规模。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总净收入" value={formatCurrency(total.netRevenueUsd)} description="扣除折扣后的真实收入表现。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="总利润" value={formatCurrency(total.profitUsd)} description="促销活动最终沉淀下来的利润。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="整体利润率" value={formatPercent(total.totalProfitMarginPct)} description="收入增长是否同步转化为盈利效率。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="促销投入" value={formatCurrency(total.promoInvestmentUsd)} description="折扣让利与营销支出的合计投入。" />
        </Col>
        <Col xs={24} sm={12} xl={8}>
          <KpiCard title="促销ROI" value={formatMetricValue('promoRoi', total.promoRoi)} description="每一单位促销投入换回了多少利润。" />
        </Col>
      </Row>

      <FilterBar filters={filters} options={options} onChange={setFilters} />

      <ChartCard
        title="表面繁荣：折扣是否拉动销售规模？"
        description="观察不同折扣区间下的总销售额和销量变化，判断促销是否确实带来规模增长。"
      >
        {hasData ? (
          <EChart option={buildPromotionScaleOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <ChartCard
        title="利润效率：收入增长是否同步转化为利润？"
        description="对比不同折扣区间下的净收入和总体利润率，判断促销带来的收入是否真正转化为盈利能力。"
      >
        {hasData ? (
          <EChart option={buildPromotionProfitEfficiencyOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <ChartCard
        title="利润拆账：销售额最后被哪些成本吃掉？"
        description="把原始销售额拆成折扣让利、商品成本、营销支出、物流成本和最终利润，展示促销利润被压缩的过程。"
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
        title="黄金区间：哪个折扣区间最值得做？"
        description="综合利润率和促销 ROI，寻找销售规模和利润效率之间相对平衡的折扣区间。"
      >
        {hasData ? (
          <EChart option={buildPromotionGoldenZoneOption(sortedDiscountRows)} />
        ) : (
          <Empty description="当前筛选条件下暂无数据" className="chart-empty" />
        )}
      </ChartCard>

      <InsightCard title="诊断结论" content={diagnosisContent} />

      <ChartCard title="折扣区间利润诊断明细" description="下表同步展示各折扣区间的规模、利润、投入与回报表现。">
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
