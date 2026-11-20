import { useEffect, useRef } from "react";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({ title, name, onCancel, onConfirm, loading = false }) {
  const cancelRef = useRef(null);
  useEffect(() => { cancelRef.current?.focus(); }, []);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape" && !loading) onCancel();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onCancel, loading]);

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !loading) onCancel();
    }}>
      <section className="modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <button className="icon-button modal-close" aria-label="Close dialog" onClick={onCancel}><X size={18} /></button>
        <div className="confirm-icon"><AlertTriangle size={22} /></div>
        <h2 id="confirm-title">{title}</h2>
        <p><strong>{name}</strong> will be permanently removed. This action cannot be undone.</p>
        <div className="modal-actions">
          <button ref={cancelRef} className="button button-secondary" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="button button-danger" onClick={onConfirm} disabled={loading}>{loading ? "Deleting…" : "Delete"}</button>
        </div>
      </section>
    </div>
  );
}
