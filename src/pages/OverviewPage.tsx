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
      description="从 2023 至 2025 年的全量原始订单数据出发，动态汇总经营规模、盈利能力和年度变化趋势。"
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

      <ChartCard title="年度净收入与利润趋势" description="按年份动态聚合净收入与利润，帮助观察业务增长节奏。">
        <EChart option={buildAnnualTrendOption(annualRows)} />
      </ChartCard>

      <ChartCard title="年度聚合数据表" description="图表下方同步展示聚合结果，便于做课堂展示与复核。">
        <AggregatedDataTable rows={annualRows} pageSize={10} />
      </ChartCard>

      <InsightCard
        title="经营结论"
        content="2023—2025 年净收入和利润整体呈增长趋势，但 2025 年增速相比 2024 年有所放缓，说明业务规模仍在扩大，但增长动能有所减弱。"
      />
    </PageContainer>
  );
}
