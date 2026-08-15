import React, { useState } from 'react';
import { Category, PaginationMeta, TransactionDetail } from '@repo/shared';
import { formatDate, formatINR } from '../../utils/formatters';
import { InlineCategorySelect } from './InlineCategorySelect';
import { NoteModal } from './NoteModal';
import { FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface LedgerTableProps {
  items: TransactionDetail[];
  meta: PaginationMeta;
  summary: { count: number; totalAmount: number };
  onPageChange: (page: number) => void;
  onUpdateCategory: (transactionId: string, category: Category) => Promise<unknown>;
  onUpdateNote: (transactionId: string, note: string | null) => Promise<unknown>;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({
  items,
  meta,
  summary,
  onPageChange,
  onUpdateCategory,
  onUpdateNote,
}) => {
  const [selectedTxnForNote, setSelectedTxnForNote] = useState<TransactionDetail | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Top summary counter */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 0.5rem',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          Showing <strong>{items.length}</strong> of <strong>{summary.count}</strong> transactions
        </span>
        <span>
          Filtered Net Total:{' '}
          <strong
            style={{
              color: summary.totalAmount >= 0 ? 'var(--status-income)' : 'var(--status-expense)',
            }}
          >
            {formatINR(summary.totalAmount, { showSign: true })}
          </strong>
        </span>
      </div>

      {/* Main Table */}
      <div className="table-container glass-panel">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Date</th>
              <th>Description / Merchant</th>
              <th style={{ width: '180px' }}>Category</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '130px', textAlign: 'right' }}>Balance</th>
              <th style={{ width: '80px', textAlign: 'center' }}>Note</th>
            </tr>
          </thead>
          <tbody>
            {items.map((txn) => {
              const isIncome = txn.amount > 0;
              return (
                <tr key={txn.id}>
                  {/* Date */}
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8125rem', whiteSpace: 'nowrap' }}>
                    {formatDate(txn.txnDate)}
                  </td>

                  {/* Description & Merchant */}
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {txn.description}
                    </div>
                    {txn.merchant && (
                      <span
                        style={{
                          fontSize: '0.6875rem',
                          color: 'var(--accent-primary)',
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {txn.merchant}
                      </span>
                    )}
                  </td>

                  {/* Category with Inline Editor */}
                  <td>
                    <InlineCategorySelect
                      currentCategory={txn.category}
                      onUpdate={(newCat) => onUpdateCategory(txn.id, newCat)}
                    />
                  </td>

                  {/* Amount */}
                  <td style={{ textAlign: 'right', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    <span
                      style={{
                        color: isIncome ? 'var(--status-income)' : 'var(--status-expense)',
                      }}
                    >
                      {formatINR(txn.amount, { showSign: true })}
                    </span>
                  </td>

                  {/* Balance */}
                  <td style={{ textAlign: 'right', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {txn.balance !== null ? formatINR(txn.balance) : '—'}
                  </td>

                  {/* Notes Modal trigger */}
                  <td style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedTxnForNote(txn)}
                      className="btn btn-ghost"
                      style={{
                        padding: '0.35rem',
                        color: txn.note ? 'var(--accent-primary)' : 'var(--text-muted)',
                      }}
                      title={txn.note || 'Add note'}
                    >
                      <FileText size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {meta.totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 0.5rem',
          }}
        >
          <button
            type="button"
            disabled={meta.page <= 1}
            onClick={() => onPageChange(meta.page - 1)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Page <strong>{meta.page}</strong> of <strong>{meta.totalPages}</strong>
          </span>

          <button
            type="button"
            disabled={meta.page >= meta.totalPages}
            onClick={() => onPageChange(meta.page + 1)}
            className="btn btn-secondary"
            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8125rem' }}
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Edit Note Modal */}
      <NoteModal
        transaction={selectedTxnForNote}
        isOpen={Boolean(selectedTxnForNote)}
        onClose={() => setSelectedTxnForNote(null)}
        onSave={onUpdateNote}
      />
    </div>
  );
};
