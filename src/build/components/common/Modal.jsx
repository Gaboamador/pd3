import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import styles from "./Modal.module.scss";

let openModalCount = 0;
let originalBodyOverflow = "";

export default function Modal({ open, onClose, title, children, width = "900px", fixedMobileHeight = false, centeredMobile = false }) {
  const modalRef = useRef(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement;
    if (openModalCount === 0) {
      originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    openModalCount += 1;
    modalRef.current?.querySelector('[data-modal-close]')?.focus({ preventScroll: true });

    function handleKey(event) {
      // Nested confirmation dialogs must receive the keyboard first.
      const dialogs = document.querySelectorAll('[data-pd3-dialog]');
      if (dialogs[dialogs.length - 1] !== modalRef.current) return;
      if (event.key === "Escape") {
        event.stopPropagation();
        onCloseRef.current?.();
      }
      if (event.key !== "Tab") return;
      const focusable = [...modalRef.current.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter(el => el.getClientRects().length > 0);
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      openModalCount = Math.max(0, openModalCount - 1);
      if (openModalCount === 0) document.body.style.overflow = originalBodyOverflow;
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className={`${styles.backdrop} ${centeredMobile ? styles.centeredMobile : ""}`} onClick={() => onCloseRef.current?.()}>
      <div
        ref={modalRef}
        data-pd3-dialog
        role="dialog"
        aria-modal="true"
        aria-label={title || "Dialog"}
        className={`${styles.modal} ${fixedMobileHeight ? styles.fixedMobileHeight : ""}`}
        style={{ maxWidth: width }}
        onClick={event => event.stopPropagation()}
      >
        {(title || onClose) && (
          <div className={styles.header}>
            {title && <div className={styles.title}>{title}</div>}
            <button
              type="button"
              data-modal-close
              className={styles.close}
              onClick={() => onCloseRef.current?.()}
              aria-label="Close"
            >×</button>
          </div>
        )}
        <div className={styles.content}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
