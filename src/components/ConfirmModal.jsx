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
            className={styles.modal}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <h3>{title}</h3>
            <p>{message}</p>

            <div className={styles.actions}>
              <button className="secondary" onClick={onCancel}>
                {cancelLabel}
              </button>
              <button onClick={onConfirm}>
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}