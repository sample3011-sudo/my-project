import { useState, useEffect, useCallback } from 'react';
import { ledgerService } from '../services/ledger.service';
import {
  Category,
  LedgerFilters,
  PaginationMeta,
  TransactionDetail,
} from '@repo/shared';

export const useLedger = (initialFilters?: Partial<LedgerFilters>) => {
  const [filters, setFilters] = useState<LedgerFilters>({
    page: 1,
    pageSize: 50,
    txnType: 'both',
    ...initialFilters,
  });

  const [items, setItems] = useState<TransactionDetail[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page: 1,
    pageSize: 50,
    total: 0,
    totalPages: 1,
  });
  const [summary, setSummary] = useState<{ count: number; totalAmount: number }>({
    count: 0,
    totalAmount: 0,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await ledgerService.getTransactions(filters);
      setItems(data.items);
      setMeta(data.meta);
      setSummary(data.summary);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to load transactions. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const updateFilters = (newFilters: Partial<LedgerFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page ?? 1, // reset to page 1 on filter change unless explicitly paging
    }));
  };

  const updateTransactionCategory = async (
    transactionId: string,
    category: Category
  ) => {
    try {
      const updated = await ledgerService.updateTransaction(transactionId, {
        category,
      });
      // Update local state or refetch to update all transactions matching merchant
      await fetchTransactions();
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message || 'Failed to update category.';
      throw new Error(msg);
    }
  };

  const updateTransactionNote = async (
    transactionId: string,
    note: string | null
  ) => {
    try {
      const updated = await ledgerService.updateTransaction(transactionId, {
        note,
      });
      setItems((prev) =>
        prev.map((item) => (item.id === transactionId ? { ...item, note } : item))
      );
      return updated;
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message || 'Failed to update note.';
      throw new Error(msg);
    }
  };

  const isEmpty = !isLoading && !error && items.length === 0;

  return {
    items,
    meta,
    summary,
    filters,
    isLoading,
    error,
    isEmpty,
    updateFilters,
    updateTransactionCategory,
    updateTransactionNote,
    refetch: fetchTransactions,
  };
};
