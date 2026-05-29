import type {
  AggregatedRow,
  DimensionKey,
  FilterState,
  FmcgRow,
  MetricKey,
  SortOrder,
} from '../types/fmcg';

const DISCOUNT_BIN_ORDER = ['0-5%', '5-10%', '10-15%', '15-20%', '20-25%', '25-30%', '30%+'];

function createSeed(dimension: string): AggregatedRow & { profitMarginSum: number } {
  return {
    dimension,
    orders: 0,
    unitsSold: 0,
    grossSalesUsd: 0,
    netRevenueUsd: 0,
    profitUsd: 0,
    marketingSpendUsd: 0,
    cogsUsd: 0,
    logisticsCostUsd: 0,
    avgUnitsSold: 0,
    avgNetRevenueUsd: 0,
    avgProfitUsd: 0,
    avgProfitMarginPct: 0,
    totalProfitMarginPct: 0,
    profitMarginSum: 0,
  };
}

function finalizeSeed(seed: AggregatedRow & { profitMarginSum: number }): AggregatedRow {
  const orders = seed.orders || 1;
  const avgProfitMarginPct = seed.orders === 0 ? 0 : seed.profitMarginSum / seed.orders;
  const totalProfitMarginPct = seed.netRevenueUsd === 0 ? 0 : (seed.profitUsd / seed.netRevenueUsd) * 100;

  return {
    dimension: seed.dimension,
    orders: seed.orders,
    unitsSold: seed.unitsSold,
    grossSalesUsd: seed.grossSalesUsd,
    netRevenueUsd: seed.netRevenueUsd,
    profitUsd: seed.profitUsd,
    marketingSpendUsd: seed.marketingSpendUsd,
    cogsUsd: seed.cogsUsd,
    logisticsCostUsd: seed.logisticsCostUsd,
    avgUnitsSold: seed.unitsSold / orders,
    avgNetRevenueUsd: seed.netRevenueUsd / orders,
    avgProfitUsd: seed.profitUsd / orders,
    avgProfitMarginPct,
    totalProfitMarginPct,
  };
}

function accumulate(seed: AggregatedRow & { profitMarginSum: number }, row: FmcgRow) {
  seed.orders += 1;
  seed.unitsSold += row.unitsSold;
  seed.grossSalesUsd += row.grossSalesUsd;
  seed.netRevenueUsd += row.netRevenueUsd;
  seed.profitUsd += row.profitUsd;
  seed.marketingSpendUsd += row.marketingSpendUsd;
  seed.cogsUsd += row.cogsUsd;
  seed.logisticsCostUsd += row.logisticsCostUsd;
  seed.profitMarginSum += row.profitMarginPct;
}

function getDimensionValue(row: FmcgRow, dimension: DimensionKey): string {
  switch (dimension) {
    case 'year':
      return String(row.year);
    case 'discountBin':
      return row.discountBin;
    case 'salesChannel':
      return row.salesChannel;
    case 'productCategory':
      return row.productCategory;
    case 'region':
      return row.region;
    case 'promotionType':
      return row.promotionType;
    case 'customerType':
      return row.customerType;
    default:
      return '';
  }
}

export function createEmptyFilters(): FilterState {
  return {
    years: [],
    regions: [],
    salesChannels: [],
    productCategories: [],
    promotionTypes: [],
  };
}

export function filterRows(rows: FmcgRow[], filters: FilterState): FmcgRow[] {
  return rows.filter((row) => {
    if (filters.years.length > 0 && !filters.years.includes(row.year)) {
      return false;
    }
    if (filters.regions.length > 0 && !filters.regions.includes(row.region)) {
      return false;
    }
    if (filters.salesChannels.length > 0 && !filters.salesChannels.includes(row.salesChannel)) {
      return false;
    }
    if (
      filters.productCategories.length > 0 &&
      !filters.productCategories.includes(row.productCategory)
    ) {
      return false;
    }
    if (
      filters.promotionTypes.length > 0 &&
      !filters.promotionTypes.includes(row.promotionType)
    ) {
      return false;
    }
    return true;
  });
}

export function aggregateTotal(rows: FmcgRow[]): AggregatedRow {
  const seed = createSeed('全部');
  rows.forEach((row) => accumulate(seed, row));
  return finalizeSeed(seed);
}

export function aggregateByDimension(rows: FmcgRow[], dimension: DimensionKey): AggregatedRow[] {
  const groups = new Map<string, AggregatedRow & { profitMarginSum: number }>();

  rows.forEach((row) => {
    const key = getDimensionValue(row, dimension);
    const seed = groups.get(key) ?? createSeed(key);
    accumulate(seed, row);
    groups.set(key, seed);
  });

  return [...groups.values()].map((seed) => finalizeSeed(seed));
}

function compareMetric(a: AggregatedRow, b: AggregatedRow, metric: MetricKey, sortOrder: 'asc' | 'desc') {
  const diff = a[metric] - b[metric];
  if (diff === 0) {
    return a.dimension.localeCompare(b.dimension);
  }
  return sortOrder === 'asc' ? diff : -diff;
}

export function sortAggregatedRows(
  rows: AggregatedRow[],
  dimension: DimensionKey,
  metric: MetricKey,
  sortOrder: SortOrder,
): AggregatedRow[] {
  const nextRows = [...rows];

  if (sortOrder === 'asc' || sortOrder === 'desc') {
    return nextRows.sort((a, b) => compareMetric(a, b, metric, sortOrder));
  }

  if (dimension === 'year') {
    return nextRows.sort((a, b) => Number(a.dimension) - Number(b.dimension));
  }

  if (dimension === 'discountBin') {
    return nextRows.sort(
      (a, b) => DISCOUNT_BIN_ORDER.indexOf(a.dimension) - DISCOUNT_BIN_ORDER.indexOf(b.dimension),
    );
  }

  return nextRows.sort((a, b) => compareMetric(a, b, metric, 'desc'));
}
