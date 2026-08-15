import { useState, useEffect, useCallback } from 'react';
import { dashboardService } from '../services/dashboard.service';
import {
  CategoryBreakdownItem,
  MonthOption,
  MonthSummary,
  TopMerchant,
} from '@repo/shared';

export interface DashboardState {
  months: MonthOption[];
  selectedMonth: string;
  summary: MonthSummary | null;
  categories: CategoryBreakdownItem[];
  merchants: TopMerchant[];
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export const useDashboard = () => {
  const [months, setMonths] = useState<MonthOption[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().substring(0, 7)
  );
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [categories, setCategories] = useState<CategoryBreakdownItem[]>([]);
  const [merchants, setMerchants] = useState<TopMerchant[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available months
  useEffect(() => {
    let isMounted = true;
    const fetchMonths = async () => {
      try {
        const data = await dashboardService.getMonths();
        if (isMounted) {
          setMonths(data);
          if (data.length > 0 && data[0]) {
            setSelectedMonth(data[0].month);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load months:', err);
        }
      }
    };

    fetchMonths();
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchMonthData = useCallback(async (month: string) => {
    if (!month) return;
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, catRes, merchRes] = await Promise.all([
        dashboardService.getSummary(month),
        dashboardService.getCategories(month),
        dashboardService.getMerchants(month),
      ]);

      setSummary(sumRes);
      setCategories(catRes.items || []);
      setMerchants(merchRes.items || []);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to load dashboard metrics for this month.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonthData(selectedMonth);
  }, [selectedMonth, fetchMonthData]);

  const isEmpty =
    !isLoading &&
    !error &&
    (!summary || summary.transactionCount === 0);

  return {
    months,
    selectedMonth,
    setSelectedMonth,
    summary,
    categories,
    merchants,
    isLoading,
    error,
    isEmpty,
    refetch: () => fetchMonthData(selectedMonth),
  };
};
