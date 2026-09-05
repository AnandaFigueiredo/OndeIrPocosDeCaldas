import { useEffect, useRef } from 'react';
export default function ConfirmModal({ title, children, onCancel, onConfirm, busy = false, confirmLabel = 'Excluir' }) {
  const ref = useRef(null);
  useEffect(() => { const node = ref.current; const previous = document.activeElement; node.showModal(); return () => { node.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} className="admin-modal" aria-labelledby="confirm-title" onCancel={e => { e.preventDefault(); if (!busy) onCancel(); }}><h2 id="confirm-title">{title}</h2><div>{children}</div><div className="admin-actions"><button autoFocus type="button" className="admin-button secondary" disabled={busy} onClick={onCancel}>Cancelar</button><button type="button" className="admin-button danger" disabled={busy} onClick={onConfirm}>{busy ? 'Aguarde…' : confirmLabel}</button></div></dialog>;
}
