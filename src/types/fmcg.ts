export interface FmcgRawRow {
  Order_ID: string;
  Order_Date: string;
  Year: string;
  Quarter: string;
  Month: string;
  Month_Name: string;
  Region: string;
  Country: string;
  City: string;
  Sales_Person: string;
  Customer_Type: string;
  Sales_Channel: string;
  Promotion_Type: string;
  Product_Category: string;
  Brand: string;
  Product_Name: string;
  SKU: string;
  Units_Sold: string;
  Unit_Price_USD: string;
  Discount_Pct: string;
  Gross_Sales_USD: string;
  Marketing_Spend_USD: string;
  COGS_USD: string;
  Logistics_Cost_USD: string;
  Net_Revenue_USD: string;
  Profit_USD: string;
  Profit_Margin_Pct: string;
}

export interface FmcgRow {
  orderId: string;
  orderDate: string;
  year: number;
  quarter: string;
  month: number;
  monthName: string;
  region: string;
  country: string;
  city: string;
  salesPerson: string;
  customerType: string;
  salesChannel: string;
  promotionType: string;
  productCategory: string;
  brand: string;
  productName: string;
  sku: string;
  unitsSold: number;
  unitPriceUsd: number;
  discountPct: number;
  discountBin: string;
  grossSalesUsd: number;
  marketingSpendUsd: number;
  cogsUsd: number;
  logisticsCostUsd: number;
  netRevenueUsd: number;
  profitUsd: number;
  profitMarginPct: number;
}

export interface FilterState {
  years: number[];
  regions: string[];
  salesChannels: string[];
  productCategories: string[];
  promotionTypes: string[];
}

export interface FilterOptions {
  years: number[];
  regions: string[];
  salesChannels: string[];
  productCategories: string[];
  promotionTypes: string[];
}

export type DimensionKey =
  | 'year'
  | 'discountBin'
  | 'salesChannel'
  | 'productCategory'
  | 'region'
  | 'promotionType'
  | 'customerType';

export type MetricKey =
  | 'orders'
  | 'unitsSold'
  | 'grossSalesUsd'
  | 'netRevenueUsd'
  | 'profitUsd'
  | 'discountLossUsd'
  | 'promoInvestmentUsd'
  | 'promoRoi'
  | 'marketingRoi'
  | 'revenueToProfitRate'
  | 'marketingSpendUsd'
  | 'cogsUsd'
  | 'logisticsCostUsd'
  | 'cogsRatio'
  | 'marketingSpendRatio'
  | 'logisticsCostRatio'
  | 'profitPerUnit'
  | 'avgUnitsSold'
  | 'avgNetRevenueUsd'
  | 'avgProfitUsd'
  | 'avgProfitMarginPct'
  | 'totalProfitMarginPct';

export interface AggregatedRow {
  dimension: string;
  orders: number;
  unitsSold: number;
  grossSalesUsd: number;
  netRevenueUsd: number;
  profitUsd: number;
  discountLossUsd: number;
  promoInvestmentUsd: number;
  promoRoi: number;
  marketingRoi: number;
  revenueToProfitRate: number;
  marketingSpendUsd: number;
  cogsUsd: number;
  logisticsCostUsd: number;
  cogsRatio: number;
  marketingSpendRatio: number;
  logisticsCostRatio: number;
  profitPerUnit: number;
  avgUnitsSold: number;
  avgNetRevenueUsd: number;
  avgProfitUsd: number;
  avgProfitMarginPct: number;
  totalProfitMarginPct: number;
}

export type ChartType = 'bar' | 'line' | 'pie';

export type SortOrder = 'default' | 'asc' | 'desc';

export type PageKey = 'overview' | 'promotion' | 'promotionProfit' | 'business' | 'explorer';

export type MetricValueType = 'number' | 'currency' | 'percent';
