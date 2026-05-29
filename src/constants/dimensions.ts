import type { DimensionKey } from '../types/fmcg';

export interface DimensionConfig {
  key: DimensionKey;
  label: string;
}

export const DIMENSION_CONFIGS: DimensionConfig[] = [
  { key: 'year', label: '年份' },
  { key: 'discountBin', label: '折扣区间' },
  { key: 'salesChannel', label: '销售渠道' },
  { key: 'productCategory', label: '产品品类' },
  { key: 'region', label: '地区' },
  { key: 'promotionType', label: '促销类型' },
  { key: 'customerType', label: '客户类型' },
];

export const DIMENSION_CONFIG_MAP = Object.fromEntries(
  DIMENSION_CONFIGS.map((config) => [config.key, config]),
) as Record<DimensionKey, DimensionConfig>;
