import { useState, useEffect, useCallback } from 'react';
import { uploadService } from '../services/upload.service';
import { ImportRecord, PaginationMeta } from '@repo/shared';

export const useImports = (page = 1, pageSize = 20) => {
  const [items, setItems] = useState<ImportRecord[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    page,
    pageSize,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImports = useCallback(async (p: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await uploadService.getImports(p, pageSize);
      setItems(data.items);
      setMeta(data.meta);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to load statement import history.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    fetchImports(page);
  }, [page, fetchImports]);

  const rollback = async (importId: string) => {
    setIsLoading(true);
    try {
      await uploadService.rollbackImport(importId);
      await fetchImports(page);
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to rollback import batch.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const isEmpty = !isLoading && !error && items.length === 0;

  return {
    items,
    meta,
    isLoading,
    error,
    isEmpty,
    rollback,
    refetch: () => fetchImports(page),
  };
};
