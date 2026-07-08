import { useEffect, type ReactNode } from 'react';
import { LuX } from 'react-icons/lu';

/** Dialog simples e acessível (overlay + Esc), sem dependência externa. */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg rounded-large border border-border bg-card p-5 shadow-pop">
        {title && (
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold">{title}</h2>
            <button onClick={onClose} aria-label="Fechar" className="text-text-muted hover:text-foreground">
              <LuX size={18} />
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
