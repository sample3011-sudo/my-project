import React, { useState } from 'react';
import { Category, CategoryEnum, CATEGORY_COLORS } from '@repo/shared';
import { Check, Loader2 } from 'lucide-react';

interface InlineCategorySelectProps {
  currentCategory: Category;
  onUpdate: (newCategory: Category) => Promise<unknown>;
}

export const InlineCategorySelect: React.FC<InlineCategorySelectProps> = ({
  currentCategory,
  onUpdate,
}) => {
  const [selected, setSelected] = useState<Category>(currentCategory);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const categories = CategoryEnum.options;

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as Category;
    setSelected(val);
    setIsUpdating(true);
    try {
      await onUpdate(val);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (_err) {
      setSelected(currentCategory); // revert
    } finally {
      setIsUpdating(false);
    }
  };

  const currentColor = CATEGORY_COLORS[selected] || '#94a3b8';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.25rem 0.5rem',
          borderRadius: 'var(--radius-full)',
          backgroundColor: `${currentColor}15`,
          border: `1px solid ${currentColor}40`,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: currentColor,
          }}
        />
        <select
          value={selected}
          disabled={isUpdating}
          onChange={handleChange}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.8125rem',
            fontWeight: 600,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {categories.map((cat) => (
            <option
              key={cat}
              value={cat}
              style={{ backgroundColor: '#111827', color: '#f8fafc' }}
            >
              {cat}
            </option>
          ))}
        </select>
      </div>

      {isUpdating && (
        <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent-primary)' }} />
      )}
      {showSuccess && (
        <span title="Rule updated & applied!">
          <Check size={14} style={{ color: 'var(--status-income)' }} />
        </span>
      )}
    </div>
  );
};
