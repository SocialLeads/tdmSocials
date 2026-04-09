import React from 'react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  bullets?: string[];
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  loading?: boolean;
}

const ConfirmModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  bullets,
  confirmLabel = 'Bevestigen',
  cancelLabel = 'Annuleren',
  confirmVariant = 'primary',
  loading = false,
}) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const confirmClass =
    confirmVariant === 'danger'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-[color:var(--c-primary)] text-white hover:opacity-90';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="bg-[color:var(--c-bg)] rounded-xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[color:var(--c-text)]">{title}</h2>
            <p className="mt-1 text-sm text-[color:var(--c-text2)]">{message}</p>
          </div>
        </div>

        {bullets && bullets.length > 0 && (
          <ul className="mb-5 ml-13 space-y-1">
            {bullets.map((item, i) => (
              <li key={i} className="text-sm text-[color:var(--c-text2)] flex items-start gap-2">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[color:var(--c-text2)] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-[color:var(--c-text2)] hover:text-[color:var(--c-text)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium rounded-lg disabled:opacity-50 transition-opacity ${confirmClass}`}
          >
            {loading ? 'Bezig...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
