import type { FmcgRawRow, FmcgRow } from '../types/fmcg';

export function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }

  const normalized = value.trim().replace(/[$,%\s]/g, '').replace(/,/g, '');
  if (!normalized) {
    return 0;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getDiscountBin(discountPct: number): string {
  if (discountPct < 5) {
    return '0-5%';
  }
  if (discountPct < 10) {
    return '5-10%';
  }
  if (discountPct < 15) {
    return '10-15%';
  }
  if (discountPct < 20) {
    return '15-20%';
  }
  if (discountPct < 25) {
    return '20-25%';
  }
  if (discountPct <= 30) {
    return '25-30%';
  }
  return '30%+';
}

export function normalizeFmcgRow(raw: FmcgRawRow): FmcgRow {
  const discountPct = toNumber(raw.Discount_Pct);

  return {
    orderId: raw.Order_ID,
    orderDate: raw.Order_Date,
    year: toNumber(raw.Year),
    quarter: raw.Quarter,
    month: toNumber(raw.Month),
    monthName: raw.Month_Name,
    region: raw.Region,
    country: raw.Country,
    city: raw.City,
    salesPerson: raw.Sales_Person,
    customerType: raw.Customer_Type,
    salesChannel: raw.Sales_Channel,
    promotionType: raw.Promotion_Type,
    productCategory: raw.Product_Category,
    brand: raw.Brand,
    productName: raw.Product_Name,
    sku: raw.SKU,
    unitsSold: toNumber(raw.Units_Sold),
    unitPriceUsd: toNumber(raw.Unit_Price_USD),
    discountPct,
    discountBin: getDiscountBin(discountPct),
    grossSalesUsd: toNumber(raw.Gross_Sales_USD),
    marketingSpendUsd: toNumber(raw.Marketing_Spend_USD),
    cogsUsd: toNumber(raw.COGS_USD),
    logisticsCostUsd: toNumber(raw.Logistics_Cost_USD),
    netRevenueUsd: toNumber(raw.Net_Revenue_USD),
    profitUsd: toNumber(raw.Profit_USD),
    profitMarginPct: toNumber(raw.Profit_Margin_Pct),
  };
}
