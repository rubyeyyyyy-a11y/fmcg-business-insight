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
    <PageContainer title="首页概览">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总订单数" value={formatNumber(total.orders)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总销量" value={formatNumber(total.unitsSold)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总净收入" value={formatCurrency(total.netRevenueUsd)} />
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <KpiCard title="总利润 / 利润率" value={`${formatCurrency(total.profitUsd)} / ${formatPercent(total.totalProfitMarginPct)}`} />
        </Col>
      </Row>

      <ChartCard title="年度净收入与利润趋势">
        <EChart option={buildAnnualTrendOption(annualRows)} />
      </ChartCard>

      <ChartCard title="年度聚合数据表">
        <AggregatedDataTable rows={annualRows} pageSize={10} />
      </ChartCard>

      <InsightCard
        title="经营结论"
        content="2023—2025 年净收入和利润整体呈增长趋势，但 2025 年增速相比 2024 年有所放缓，说明业务规模仍在扩大，但增长动能有所减弱。"
      />
    </PageContainer>
  );
}
