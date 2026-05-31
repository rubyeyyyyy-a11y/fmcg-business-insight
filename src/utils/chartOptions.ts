import type { EChartsOption } from 'echarts';
import { DIMENSION_CONFIG_MAP } from '../constants/dimensions';
import { METRIC_CONFIG_MAP } from '../constants/metrics';
import type { AggregatedRow, ChartType, DimensionKey, MetricKey } from '../types/fmcg';
import { formatMetricValue } from './formatter';

function buildAxisTooltipFormatter(
  seriesMetrics: MetricKey[],
  seriesLabels: string[],
): (params: any) => string {
  return (params) => {
    const items = Array.isArray(params) ? params : [params];
    const lines = items.map((item: any) => {
      const index = item.seriesIndex ?? 0;
      const metric = seriesMetrics[index] ?? seriesMetrics[0];
      const label = seriesLabels[index] ?? '';
      return `${item.marker ?? ''}${label}: ${formatMetricValue(metric, Number(item.value ?? 0))}`;
    });

    return [items[0]?.axisValueLabel ?? items[0]?.name ?? '', ...lines].join('<br/>');
  };
}

function buildCommonGrid() {
  return {
    left: 24,
    right: 24,
    top: 56,
    bottom: 72,
    containLabel: true,
  };
}

function buildCategoryAxis(rows: AggregatedRow[]) {
  return {
    type: 'category' as const,
    data: rows.map((row) => row.dimension),
    axisLabel: {
      interval: 0,
      rotate: rows.length > 6 ? 24 : 0,
    },
  };
}

export function buildAnnualTrendOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#1d4ed8', '#f97316'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(['netRevenueUsd', 'profitUsd'], ['净收入', '利润']),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.dimension),
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatMetricValue('netRevenueUsd', value),
      },
    },
    series: [
      {
        name: '净收入',
        type: 'line',
        smooth: true,
        data: rows.map((row) => row.netRevenueUsd),
      },
      {
        name: '利润',
        type: 'line',
        smooth: true,
        data: rows.map((row) => row.profitUsd),
      },
    ],
  };
}

export function buildMetricBarOption(
  rows: AggregatedRow[],
  metric: MetricKey,
  title?: string,
): EChartsOption {
  return {
    color: ['#2563eb'],
    title: title
      ? {
          text: title,
          left: 0,
          textStyle: {
            fontSize: 16,
            fontWeight: 600,
          },
        }
      : undefined,
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter([metric], [METRIC_CONFIG_MAP[metric].label]),
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.dimension),
      axisLabel: {
        interval: 0,
        rotate: rows.length > 6 ? 24 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatMetricValue(metric, value),
      },
    },
    series: [
      {
        type: 'bar',
        name: METRIC_CONFIG_MAP[metric].label,
        barMaxWidth: 48,
        data: rows.map((row) => row[metric]),
      },
    ],
  };
}

export function buildProfitMarginComboOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#0f766e', '#dc2626'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(['profitUsd', 'totalProfitMarginPct'], ['利润', '总体利润率']),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.dimension),
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '利润',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('profitUsd', value),
        },
      },
      {
        type: 'value',
        name: '利润率',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('totalProfitMarginPct', value),
        },
      },
    ],
    series: [
      {
        name: '利润',
        type: 'bar',
        barMaxWidth: 48,
        data: rows.map((row) => row.profitUsd),
      },
      {
        name: '总体利润率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => row.totalProfitMarginPct),
      },
    ],
  };
}

export function buildRevenueMarginComboOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#1d4ed8', '#ea580c'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(['netRevenueUsd', 'totalProfitMarginPct'], ['净收入', '总体利润率']),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.dimension),
      axisLabel: {
        interval: 0,
        rotate: rows.length > 6 ? 24 : 0,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '净收入',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('netRevenueUsd', value),
        },
      },
      {
        type: 'value',
        name: '利润率',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('totalProfitMarginPct', value),
        },
      },
    ],
    series: [
      {
        name: '净收入',
        type: 'bar',
        barMaxWidth: 48,
        data: rows.map((row) => row.netRevenueUsd),
      },
      {
        name: '总体利润率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => row.totalProfitMarginPct),
      },
    ],
  };
}

export function buildPromotionScaleOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#2563eb', '#f97316'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(['grossSalesUsd', 'unitsSold'], ['总销售额', '销量']),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: buildCategoryAxis(rows),
    yAxis: [
      {
        type: 'value',
        name: '总销售额',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('grossSalesUsd', value),
        },
      },
      {
        type: 'value',
        name: '销量',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('unitsSold', value),
        },
      },
    ],
    series: [
      {
        name: '总销售额',
        type: 'bar',
        barMaxWidth: 48,
        data: rows.map((row) => row.grossSalesUsd),
      },
      {
        name: '销量',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => row.unitsSold),
      },
    ],
  };
}

export function buildPromotionProfitEfficiencyOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#0f766e', '#dc2626'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(
        ['netRevenueUsd', 'totalProfitMarginPct'],
        ['净收入', '总体利润率'],
      ),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: buildCategoryAxis(rows),
    yAxis: [
      {
        type: 'value',
        name: '净收入',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('netRevenueUsd', value),
        },
      },
      {
        type: 'value',
        name: '总体利润率',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('totalProfitMarginPct', value),
        },
      },
    ],
    series: [
      {
        name: '净收入',
        type: 'bar',
        barMaxWidth: 48,
        data: rows.map((row) => row.netRevenueUsd),
      },
      {
        name: '总体利润率',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => row.totalProfitMarginPct),
      },
    ],
  };
}

export function buildPromotionCostWaterfallOption(row: AggregatedRow): EChartsOption {
  const categories = ['总销售额', '折扣让利', '商品成本', '营销支出', '物流成本', '利润'];
  const firstRemaining = row.grossSalesUsd - row.discountLossUsd;
  const secondRemaining = firstRemaining - row.cogsUsd;
  const thirdRemaining = secondRemaining - row.marketingSpendUsd;
  const fourthRemaining = thirdRemaining - row.logisticsCostUsd;

  return {
    color: ['#2563eb', '#f59e0b', '#64748b', '#f97316', '#06b6d4', '#16a34a'],
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const dataValue = Array.isArray(params.value)
          ? Number(params.value[0] ?? 0)
          : Number(params.value ?? 0);
        const value = params.seriesName === '辅助' ? 0 : dataValue;
        const metricMap: Record<string, MetricKey> = {
          总销售额: 'grossSalesUsd',
          折扣让利: 'discountLossUsd',
          商品成本: 'cogsUsd',
          营销支出: 'marketingSpendUsd',
          物流成本: 'logisticsCostUsd',
          利润: 'profitUsd',
        };
        const metric = metricMap[params.name] ?? 'profitUsd';
        const prefix = params.name === '总销售额' || params.name === '利润' ? '' : '-';
        return `${params.name}<br/>${prefix}${formatMetricValue(metric, Math.abs(value))}`;
      },
    },
    legend: {
      top: 12,
      data: categories,
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: categories,
      axisLabel: {
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatMetricValue('grossSalesUsd', value),
      },
    },
    series: [
      {
        name: '辅助',
        type: 'bar',
        stack: 'total',
        silent: true,
        itemStyle: {
          color: 'transparent',
          borderColor: 'transparent',
        },
        emphasis: {
          disabled: true,
        },
        data: [0, firstRemaining, secondRemaining, thirdRemaining, fourthRemaining, 0],
      },
      {
        name: '总销售额',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 44,
        data: [row.grossSalesUsd, '-', '-', '-', '-', '-'],
      },
      {
        name: '折扣让利',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 44,
        data: ['-', row.discountLossUsd, '-', '-', '-', '-'],
      },
      {
        name: '商品成本',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 44,
        data: ['-', '-', row.cogsUsd, '-', '-', '-'],
      },
      {
        name: '营销支出',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 44,
        data: ['-', '-', '-', row.marketingSpendUsd, '-', '-'],
      },
      {
        name: '物流成本',
        type: 'bar',
        stack: 'total',
        barMaxWidth: 44,
        data: ['-', '-', '-', '-', row.logisticsCostUsd, '-'],
      },
      {
        name: '利润',
        type: 'bar',
        stack: 'profit',
        barMaxWidth: 44,
        itemStyle: {
          color: row.profitUsd >= 0 ? '#16a34a' : '#dc2626',
        },
        data: ['-', '-', '-', '-', '-', row.profitUsd],
      },
    ],
  };
}

export function buildPromotionGoldenZoneOption(rows: AggregatedRow[]): EChartsOption {
  return {
    color: ['#dc2626', '#2563eb'],
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter(
        ['totalProfitMarginPct', 'promoRoi'],
        ['总体利润率', '促销ROI'],
      ),
    },
    legend: {
      top: 12,
    },
    grid: buildCommonGrid(),
    xAxis: buildCategoryAxis(rows),
    yAxis: [
      {
        type: 'value',
        name: '总体利润率',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('totalProfitMarginPct', value),
        },
      },
      {
        type: 'value',
        name: '促销ROI',
        axisLabel: {
          formatter: (value: number) => formatMetricValue('promoRoi', value),
        },
      },
    ],
    series: [
      {
        name: '总体利润率',
        type: 'line',
        smooth: true,
        data: rows.map((row) => row.totalProfitMarginPct),
        markPoint: {
          data: [{ type: 'max', name: '利润率最高' }],
        },
      },
      {
        name: '促销ROI',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: rows.map((row) => row.promoRoi),
        markPoint: {
          data: [{ type: 'max', name: 'ROI最高' }],
        },
      },
    ],
  };
}

export function buildExplorerChartOption(
  rows: AggregatedRow[],
  dimension: DimensionKey,
  metric: MetricKey,
  chartType: ChartType,
): EChartsOption {
  const dimensionLabel = DIMENSION_CONFIG_MAP[dimension].label;
  const metricLabel = METRIC_CONFIG_MAP[metric].label;
  const title = `按${dimensionLabel}统计${metricLabel}`;

  if (chartType === 'pie') {
    return {
      color: ['#2563eb', '#14b8a6', '#f97316', '#9333ea', '#e11d48', '#0ea5e9', '#84cc16'],
      title: {
        text: title,
        left: 0,
        textStyle: {
          fontSize: 16,
          fontWeight: 600,
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = Array.isArray(params.value) ? Number(params.value[0] ?? 0) : Number(params.value ?? 0);
          return `${params.name}<br/>${metricLabel}: ${formatMetricValue(metric, value)}`;
        },
      },
      legend: {
        orient: 'vertical',
        right: 0,
        top: 'middle',
      },
      series: [
        {
          type: 'pie',
          radius: ['35%', '68%'],
          center: ['38%', '52%'],
          avoidLabelOverlap: true,
          data: rows.map((row) => ({
            name: row.dimension,
            value: row[metric],
          })),
        },
      ],
    };
  }

  return {
    color: ['#2563eb'],
    title: {
      text: title,
      left: 0,
      textStyle: {
        fontSize: 16,
        fontWeight: 600,
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: buildAxisTooltipFormatter([metric], [metricLabel]),
    },
    grid: buildCommonGrid(),
    xAxis: {
      type: 'category',
      data: rows.map((row) => row.dimension),
      axisLabel: {
        interval: 0,
        rotate: rows.length > 6 ? 24 : 0,
      },
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: (value: number) => formatMetricValue(metric, value),
      },
    },
    series: [
      {
        type: chartType,
        name: metricLabel,
        smooth: chartType === 'line',
        barMaxWidth: chartType === 'bar' ? 48 : undefined,
        data: rows.map((row) => row[metric]),
      },
    ],
  };
}
