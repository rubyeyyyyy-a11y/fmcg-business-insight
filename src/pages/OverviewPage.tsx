import { Col, Row } from 'antd';
import { AggregatedDataTable } from '../components/AggregatedDataTable';
import { ChartCard } from '../components/ChartCard';
import { EChart } from '../components/EChart';
import { InsightCard } from '../components/InsightCard';
import { KpiCard } from '../components/KpiCard';
import { PageContainer } from '../components/PageContainer';
import type { FmcgRow } from '../types/fmcg';
import { aggregateByDimension, aggregateTotal, sortAggregatedRows } from '../utils/aggregator';
import { buildAnnualTrendOption } from '../utils/chartOptions';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatter';

interface OverviewPageProps {
  rows: FmcgRow[];
}

export function OverviewPage({ rows }: OverviewPageProps) {
  const total = aggregateTotal(rows);
  const annualRows = sortAggregatedRows(aggregateByDimension(rows, 'year'), 'year', 'netRevenueUsd', 'default');

  return (
    <PageContainer
      title="首页概览"
      description="基于 2023—2025 年原始订单数据，汇总展示经营规模、盈利表现及年度变化趋势。"
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总订单数" value={formatNumber(total.orders)} description="基于原始 CSV 动态统计全部订单记录。" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总销量" value={formatNumber(total.unitsSold)} description="累计销量反映整体市场出货规模。" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总净收入" value={formatCurrency(total.netRevenueUsd)} description="扣除折扣后的实际收入规模。" />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总利润 / 利润率" value={`${formatCurrency(total.profitUsd)} / ${formatPercent(total.totalProfitMarginPct)}`} description="同时观察利润绝对值和整体盈利效率。" />
        </Col>
      </Row>

      <ChartCard title="年度净收入与利润趋势" description="按年份聚合净收入与利润，用于观察经营规模与利润变化趋势。">
        <EChart option={buildAnnualTrendOption(annualRows)} />
      </ChartCard>

      <ChartCard title="年度聚合数据表" description="年度汇总数据如下，用于补充展示趋势图中的具体指标。">
        <AggregatedDataTable rows={annualRows} pageSize={10} />
      </ChartCard>

      <InsightCard
        title="经营结论"
        content="2023—2025 年净收入与利润保持增长，整体经营规模持续扩大；但 2025 年增幅较 2024 年有所收窄，后续需关注增长动能变化。"
      />
    </PageContainer>
  );
}
