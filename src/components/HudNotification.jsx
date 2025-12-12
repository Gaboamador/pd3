import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/BuildLayout.module.scss";

export default function HudNotification({ visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.hudNotification}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.35 }}
        >
          BUILD RANDOMIZED
        </motion.div>
      )}
    </AnimatePresence>
  );
}
