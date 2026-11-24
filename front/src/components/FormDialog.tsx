import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  className: string;
  closeLabel?: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function FormDialog({ title, className, closeLabel = 'Cerrar modal', busy, onClose, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  return <dialog ref={ref} className={`tca-modal ${className}`} aria-label={title}
    onCancel={event => event.preventDefault()}>
    <button type="button" className="tca-modal-close" aria-label={closeLabel} disabled={busy} onClick={onClose}>×</button>
    {children}
  </dialog>;
}
