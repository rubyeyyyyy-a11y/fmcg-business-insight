import Papa from 'papaparse';
import type { FmcgRawRow, FmcgRow } from '../types/fmcg';
import { normalizeFmcgRow } from './dataNormalize';

export async function loadFmcgCsv(): Promise<FmcgRow[]> {
  const response = await fetch('/data/fmcg_sales_cleaned_2023_2025.csv');
  if (!response.ok) {
    throw new Error(`CSV 文件读取失败：${response.status} ${response.statusText}`);
  }

  const csvText = await response.text();

  const parsed = Papa.parse<FmcgRawRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    const [firstError] = parsed.errors;
    throw new Error(`CSV 解析失败：${firstError.message}`);
  }

  return parsed.data
    .filter((row) => row.Order_ID?.trim())
    .map((row) => normalizeFmcgRow(row));
}
