import { motion } from "framer-motion";
import AnimatedSlot from "./AnimatedSlot.jsx";
import styles from "../styles/CategoryCard.module.scss";
import { LuRefreshCw } from "react-icons/lu";

function CategoryCard({ label, value, options, onReroll, collapsed, onToggleCollapse, highlight = false, hasData, animationKey }) {

  return (
    <motion.div
      className={`${styles.card} ${highlight ? styles.cardHighlight : ""} ${hasData ? styles.dataLabel : ""}`}
      whileHover={{ y: -2, boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
    {/* HEADER CLICKABLE → TOGGLE COLLAPSE */}
      <div
        className={styles.headerRow}
        onClick={onToggleCollapse}
        style={{ cursor: "pointer" }}
      >
        <span className={styles.label}>
          {label}
          </span>
      </div>

      {/* BODY SOLO SI NO ESTÁ COLAPSADO */}
      {!collapsed && (
        <div className={styles.cardBody}>
          {/* <AnimatedSlot value={animationKey ?? value} display={value} options={options}/> */}
          <AnimatedSlot
  spinKey={animationKey ?? String(value ?? "")}
  finalLabel={typeof value === "string" ? value : ""}  // para armor la seteamos desde BuildLayout
  display={value}
  options={options}
/>
          <button
            type="button"
            className={styles.rerollButton}
            onClick={onReroll}
          >
            <LuRefreshCw/>
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default CategoryCard;
