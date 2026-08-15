import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TransactionDetail } from '@repo/shared';
import { Loader2 } from 'lucide-react';

interface NoteModalProps {
  transaction: TransactionDetail | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transactionId: string, note: string | null) => Promise<unknown>;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  transaction,
  isOpen,
  onClose,
  onSave,
}) => {
  const [note, setNote] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (transaction) {
      setNote(transaction.note || '');
      setError(null);
    }
  }, [transaction]);

  if (!transaction) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (note.length > 500) {
      setError('Note cannot exceed 500 characters.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSave(transaction.id, note.trim() || null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Note — ${transaction.description}`}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--status-expense-bg)',
              color: '#f87171',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <div className="form-group">
          <label className="form-label" htmlFor="txn-note">
            Transaction Note / Remarks
          </label>
          <textarea
            id="txn-note"
            rows={4}
            className="form-textarea"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add context or notes for this transaction..."
            maxLength={500}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <div
            style={{
              textAlign: 'right',
              fontSize: '0.75rem',
              color: note.length > 450 ? 'var(--status-warning)' : 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            {note.length} / 500 characters
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSaving}
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Note'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
