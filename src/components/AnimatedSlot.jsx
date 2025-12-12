import { motion, AnimatePresence } from "framer-motion";
import styles from "../styles/CategoryCard.module.scss";

function AnimatedSlot({ value, display }) {
  return (
    <div className={styles.slotWrapper}>
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          className={`${styles.slot} font-din`}
          initial={{ opacity: 0, y: -10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.98 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
        >
          {display}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default AnimatedSlot;
