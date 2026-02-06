import { useEffect } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.scss";

export default function Modal({
  open,
  onClose,
  title,
  children,
  width = "900px",
}) {
  useEffect(() => {
    if (!open) return;

    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className={styles.backdrop} onClick={onClose}>
      <div
        className={styles.modal}
        style={{ maxWidth: width }}
        onClick={e => e.stopPropagation()}
      >
        {(title || onClose) && (
          <div className={styles.header}>
            {title && <div className={styles.title}>{title}</div>}

            <button
              className={styles.close}
              onClick={onClose}
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
