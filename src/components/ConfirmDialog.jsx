import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/ConfirmDialog.module.scss";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
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
            className={styles.dialog}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <h3>{title}</h3>
            <p>{message}</p>

            <div className={styles.actions}>
              <button className={styles.cancelButton} onClick={onCancel}>
                Cancel
              </button>

              <button className={styles.confirmButton} onClick={onConfirm}>
                Confirm
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
