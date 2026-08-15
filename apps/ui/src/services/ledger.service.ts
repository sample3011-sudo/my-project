import apiClient from './api.client';
import {
  LedgerFilters,
  LedgerResponse,
  Transaction,
  TransactionDetail,
  TransactionUpdate,
} from '@repo/shared';

export const ledgerService = {
  async getTransactions(
    filters: LedgerFilters
  ): Promise<LedgerResponse['data']> {
    const res = await apiClient.get<LedgerResponse>('/transactions', {
      params: filters,
    });
    return res.data.data;
  },

  async getTransaction(transactionId: string): Promise<TransactionDetail> {
    const res = await apiClient.get<{ success: true; data: TransactionDetail }>(
      `/transactions/${transactionId}`
    );
    return res.data.data;
  },

  async updateTransaction(
    transactionId: string,
    updates: TransactionUpdate
  ): Promise<Transaction> {
    const res = await apiClient.patch<{ success: true; data: Transaction }>(
      `/transactions/${transactionId}`,
      updates
    );
    return res.data.data;
  },
};
