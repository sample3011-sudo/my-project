import apiClient from './api.client';
import {
  BankPreset,
  BankPresetWrite,
  ColumnMapping,
  CommitResult,
  ImportRecord,
  MalformedRowsPatch,
  PaginationMeta,
  UploadMalformedData,
  UploadPreview,
} from '@repo/shared';

export const uploadService = {
  async uploadFile(file: File, bankName?: string): Promise<UploadPreview> {
    const formData = new FormData();
    formData.append('file', file);
    if (bankName) {
      formData.append('bankName', bankName);
    }

    const res = await apiClient.post<{ success: true; data: UploadPreview }>(
      '/uploads',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data.data;
  },

  async getPreview(uploadId: string): Promise<UploadPreview> {
    const res = await apiClient.get<{ success: true; data: UploadPreview }>(
      `/uploads/${uploadId}/preview`
    );
    return res.data.data;
  },

  async saveMapping(
    uploadId: string,
    mapping: ColumnMapping
  ): Promise<UploadPreview> {
    const res = await apiClient.patch<{ success: true; data: UploadPreview }>(
      `/uploads/${uploadId}/mapping`,
      mapping
    );
    return res.data.data;
  },

  async parseSession(uploadId: string): Promise<UploadMalformedData> {
    const res = await apiClient.post<{
      success: true;
      data: UploadMalformedData;
    }>(`/uploads/${uploadId}/parse`);
    return res.data.data;
  },

  async updateMalformed(
    uploadId: string,
    patch: MalformedRowsPatch
  ): Promise<UploadMalformedData> {
    const res = await apiClient.patch<{
      success: true;
      data: UploadMalformedData;
    }>(`/uploads/${uploadId}/malformed`, patch);
    return res.data.data;
  },

  async commitSession(uploadId: string): Promise<CommitResult> {
    const res = await apiClient.post<{ success: true; data: CommitResult }>(
      `/uploads/${uploadId}/commit`
    );
    return res.data.data;
  },

  async getBankPresets(bankName?: string): Promise<BankPreset[] | BankPreset> {
    const res = await apiClient.get<{
      success: true;
      data: BankPreset[] | BankPreset;
    }>('/mappings', {
      params: bankName ? { bankName } : undefined,
    });
    return res.data.data;
  },

  async saveBankPreset(preset: BankPresetWrite): Promise<BankPreset> {
    const res = await apiClient.post<{ success: true; data: BankPreset }>(
      '/mappings',
      preset
    );
    return res.data.data;
  },

  async getImports(
    page = 1,
    pageSize = 50
  ): Promise<{ items: ImportRecord[]; meta: PaginationMeta }> {
    const res = await apiClient.get<{
      success: true;
      data: { items: ImportRecord[]; meta: PaginationMeta };
    }>('/imports', {
      params: { page, pageSize },
    });
    return res.data.data;
  },

  async getImportDetail(importId: string): Promise<ImportRecord> {
    const res = await apiClient.get<{ success: true; data: ImportRecord }>(
      `/imports/${importId}`
    );
    return res.data.data;
  },

  async rollbackImport(importId: string): Promise<{ success: true }> {
    const res = await apiClient.delete<{ success: true; data: { success: true } }>(
      `/imports/${importId}`
    );
    return res.data.data;
  },
};
