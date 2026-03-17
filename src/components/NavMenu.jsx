import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./NavMenu.module.scss";

export default function NavMenu({ open, onClose, items = [], anchorRef }) {

    const location = useLocation();
    const [pos, setPos] = useState({ top: 0, left: 0 });

    useEffect(() => {
    if (open && anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();

        setPos({
        top: rect.bottom + 8,
        left: rect.left
        });
    }
    }, [open, anchorRef]);

    useEffect(() => {
    if (!open) return;

    function handleKey(e) {
        if (e.key === "Escape") {
        onClose();
        }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
    }, [open, onClose]);


  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className={styles.menu}
            style={{
                position: "fixed",
                top: pos.top,
                left: pos.left,
                transformOrigin: "top left"
            }}
            initial={{ opacity: 0, scale: 0.92, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -2 }}
            transition={{
                type: "spring",
                stiffness: 380,
                damping: 28,
                mass: 0.6
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.ul
              className={styles.list}
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0, y: 4 },
visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.18, ease: "easeOut" }
  }

              }}
            >
              {items.map((item, i) => {
                const isActive = item.to === "/" ? location.pathname === "/" : location.pathname.startsWith(item.to);
                return (
                <motion.li
                  key={i}
                  className={styles.item}
                  variants={{
                    hidden: { opacity: 0, y: -6 },
                    visible: { opacity: 1, y: 0 }
                  }}
                >
                  <Link
                    to={item.disabled ? "#" : item.to}
                    className={`${styles.link} ${isActive ? styles.active : ""} ${item.disabled ? styles.disabled : ""}`}
                    onClick={onClose}
                  >
                    <span
                      className={styles.icon}
                      data-service={item.service}
                    >
                      {item.icon}
                    </span>

                    <span className={styles.label}>
                      {item.label}
                    </span>
                  </Link>
                </motion.li>
              )})}
            </motion.ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}