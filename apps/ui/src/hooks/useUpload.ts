import { useState } from 'react';
import { uploadService } from '../services/upload.service';
import {
  BankPreset,
  ColumnMapping,
  CommitResult,
  MalformedRow,
  UploadMalformedData,
  UploadPreview,
} from '@repo/shared';

export type UploadWizardStep = 'upload' | 'mapping' | 'review' | 'success';

export const useUpload = () => {
  const [step, setStep] = useState<UploadWizardStep>('upload');
  const [preview, setPreview] = useState<UploadPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({
    date: '',
    description: '',
    debit: null,
    credit: null,
    balance: null,
    ref: null,
  });
  const [malformedData, setMalformedData] =
    useState<UploadMalformedData | null>(null);
  const [commitResult, setCommitResult] = useState<CommitResult | null>(null);
  const [presets, setPresets] = useState<BankPreset[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPresets = async () => {
    try {
      const res = await uploadService.getBankPresets();
      if (Array.isArray(res)) {
        setPresets(res);
      }
    } catch (_err) {
      // Ignore preset fetch errors
    }
  };

  const uploadStatement = async (file: File, bankName?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await uploadService.uploadFile(file, bankName);
      setPreview(res);
      if (res.mapping) {
        setMapping(res.mapping);
      }
      setStep('mapping');
      await fetchPresets();
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to upload file. Please ensure it is a valid CSV or Excel statement.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const submitMapping = async (customMapping: ColumnMapping) => {
    if (!preview?.uploadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const updatedPreview = await uploadService.saveMapping(
        preview.uploadId,
        customMapping
      );
      setPreview(updatedPreview);
      setMapping(customMapping);

      // Trigger server-side parse
      const parsed = await uploadService.parseSession(preview.uploadId);
      setMalformedData(parsed);
      setStep('review');
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to apply column mapping. Please verify that Date, Description, and Debit/Credit are correctly mapped.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMalformedRow = async (rowIndex: number) => {
    if (!preview?.uploadId || !malformedData) return;
    const targetRow = malformedData.malformedRows.find(
      (r) => r.rowIndex === rowIndex
    );
    if (!targetRow) return;

    const newExcluded = !targetRow.excluded;
    const patch = [{ rowIndex, excluded: newExcluded }];

    try {
      const updated = await uploadService.updateMalformed(
        preview.uploadId,
        patch
      );
      setMalformedData(updated);
    } catch (err: any) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to update row exclusion status.'
      );
    }
  };

  const commitImport = async () => {
    if (!preview?.uploadId) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await uploadService.commitSession(preview.uploadId);
      setCommitResult(result);
      setStep('success');
    } catch (err: any) {
      const msg =
        err.response?.data?.error?.message ||
        'Failed to commit transactions. Please review and try again.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const resetWizard = () => {
    setStep('upload');
    setPreview(null);
    setMalformedData(null);
    setCommitResult(null);
    setError(null);
  };

  return {
    step,
    setStep,
    preview,
    mapping,
    setMapping,
    malformedData,
    commitResult,
    presets,
    isLoading,
    error,
    uploadStatement,
    submitMapping,
    toggleMalformedRow,
    commitImport,
    resetWizard,
  };
};
