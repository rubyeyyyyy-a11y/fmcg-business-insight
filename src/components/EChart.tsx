import ReactECharts from 'echarts-for-react';
import type { EChartsOption } from 'echarts';

interface EChartProps {
  option: EChartsOption;
  height?: number;
}

export function EChart({ option, height = 360 }: EChartProps) {
  return <ReactECharts option={option} style={{ width: '100%', height }} notMerge lazyUpdate />;
}
