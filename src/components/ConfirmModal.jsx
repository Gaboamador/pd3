import { motion, AnimatePresence } from "framer-motion";
import styles from "./ConfirmModal.module.scss";

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "CONFIRM",
  cancelLabel = "CANCEL",
  onConfirm,
  onCancel,
  destructive = false,
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className={`${styles.modal} ${destructive ? styles.danger : ""}`}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <h3 className={styles.title}>{title}</h3>
            <p className={styles.message}>{message}</p>

            <div className={styles.actions}>
              <button className="secondary" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button onClick={onConfirm} className={destructive ? styles.danger : ""}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}