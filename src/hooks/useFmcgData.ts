import { useEffect, useState } from 'react';
import type { FilterOptions, FmcgRow } from '../types/fmcg';
import { loadFmcgCsv } from '../utils/dataLoader';

function sortStrings(values: string[]): string[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function buildOptions(rows: FmcgRow[]): FilterOptions {
  return {
    years: [...new Set(rows.map((row) => row.year))].sort((a, b) => a - b),
    regions: sortStrings([...new Set(rows.map((row) => row.region))]),
    salesChannels: sortStrings([...new Set(rows.map((row) => row.salesChannel))]),
    productCategories: sortStrings([...new Set(rows.map((row) => row.productCategory))]),
    promotionTypes: sortStrings([...new Set(rows.map((row) => row.promotionType))]),
  };
}

export function useFmcgData() {
  const [rows, setRows] = useState<FmcgRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [options, setOptions] = useState<FilterOptions>({
    years: [],
    regions: [],
    salesChannels: [],
    productCategories: [],
    promotionTypes: [],
  });

  useEffect(() => {
    let mounted = true;

    async function fetchRows() {
      setLoading(true);
      setError(null);

      try {
        const data = await loadFmcgCsv();
        if (!mounted) {
          return;
        }

        setRows(data);
        setOptions(buildOptions(data));
      } catch (fetchError) {
        if (!mounted) {
          return;
        }

        const message =
          fetchError instanceof Error ? fetchError.message : '数据读取失败，请稍后重试。';
        setError(message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void fetchRows();

    return () => {
      mounted = false;
    };
  }, []);

  return { rows, loading, error, options };
}
