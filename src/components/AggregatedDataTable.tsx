import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { AggregatedRow } from '../types/fmcg';
import { formatCurrency, formatNumber, formatPercent } from '../utils/formatter';

interface AggregatedDataTableProps {
  rows: AggregatedRow[];
  pageSize?: number;
}

export function AggregatedDataTable({ rows, pageSize = 8 }: AggregatedDataTableProps) {
  const columns: ColumnsType<AggregatedRow> = [
    {
      title: '维度',
      dataIndex: 'dimension',
      key: 'dimension',
      fixed: 'left',
      width: 140,
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
      title: '平均利润',
      dataIndex: 'avgProfitUsd',
      key: 'avgProfitUsd',
      render: (value: number) => formatCurrency(value),
    },
    {
      title: '平均利润率',
      dataIndex: 'avgProfitMarginPct',
      key: 'avgProfitMarginPct',
      render: (value: number) => formatPercent(value),
    },
    {
      title: '总体利润率',
      dataIndex: 'totalProfitMarginPct',
      key: 'totalProfitMarginPct',
      render: (value: number) => formatPercent(value),
    },
  ];

  return (
    <Table
      rowKey={(row) => row.dimension}
      columns={columns}
      dataSource={rows}
      pagination={{ pageSize }}
      scroll={{ x: 960 }}
    />
  );
}
