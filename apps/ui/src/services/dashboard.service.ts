import apiClient from './api.client';
import {
  CategoryBreakdownResponse,
  MonthOption,
  MonthSummary,
  TopMerchantsResponse,
} from '@repo/shared';

export const dashboardService = {
  async getMonths(): Promise<MonthOption[]> {
    const res = await apiClient.get<{ success: true; data: MonthOption[] }>(
      '/dashboard/months'
    );
    return res.data.data;
  },

  async getSummary(month: string): Promise<MonthSummary> {
    const res = await apiClient.get<{ success: true; data: MonthSummary }>(
      '/dashboard/summary',
      { params: { month } }
    );
    return res.data.data;
  },

  async getCategories(month: string): Promise<CategoryBreakdownResponse> {
    const res = await apiClient.get<{
      success: true;
      data: CategoryBreakdownResponse;
    }>('/dashboard/categories', { params: { month } });
    return res.data.data;
  },

  async getMerchants(month: string): Promise<TopMerchantsResponse> {
    const res = await apiClient.get<{
      success: true;
      data: TopMerchantsResponse;
    }>('/dashboard/merchants', { params: { month } });
    return res.data.data;
  },
};
