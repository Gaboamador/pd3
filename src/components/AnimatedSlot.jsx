// import { motion, AnimatePresence } from "framer-motion";
// import styles from "../styles/CategoryCard.module.scss";

// function AnimatedSlot({ value, display }) {
//   return (
//     <div className={styles.slotWrapper}>
//       <AnimatePresence mode="wait">
//         <motion.div
//           key={value}
//           className={`${styles.slot} font-din`}
//           initial={{ opacity: 0, y: -10, scale: 0.98 }}
//           animate={{ opacity: 1, y: 0, scale: 1 }}
//           exit={{ opacity: 0, y: 10, scale: 0.98 }}
//           transition={{ duration: 0.18, ease: "easeOut" }}
//         >
//           {display}
//         </motion.div>
//       </AnimatePresence>
//     </div>
//   );
// }

// export default AnimatedSlot;
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../styles/CategoryCard.module.scss";

const SLOT_HEIGHT = 50;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AnimatedSlot({ spinKey, finalLabel, display, options = [] }) {
  const prevKeyRef = useRef(null);
  const [wheel, setWheel] = useState(null);

  const normalizedOptions = useMemo(() => {
    // opciones siempre string y sin vacíos
    return options
      .map(o => (o == null ? "" : String(o)).trim())
      .filter(Boolean);
  }, [options]);

  useEffect(() => {
    // 1) No girar si no hay final
    if (!finalLabel) return;

    // 2) No girar en el primer mount
    if (prevKeyRef.current == null) {
      prevKeyRef.current = spinKey;
      return;
    }

    // 3) Solo girar si cambió el resultado (spinKey)
    if (prevKeyRef.current === spinKey) return;
    prevKeyRef.current = spinKey;

    // 4) Armar rueda: dummies + FINAL (finalLabel al final)
    const pool = normalizedOptions.filter(x => x !== finalLabel);
    const dummies = shuffle(pool).slice(0, Math.min(7, pool.length));

    setWheel([...dummies, finalLabel]);
  }, [spinKey, finalLabel, normalizedOptions]);

  // Estado normal: render final (JSX o string)
  if (!wheel) {
    return (
      <div className={styles.slotWrapper}>
        <div className={`${styles.slot} font-din`}>{display}</div>
      </div>
    );
  }

  // Estado spin: solo strings, termina EXACTO en finalLabel
  return (
    <div className={styles.slotWrapper}>
      <motion.div
        className={styles.slotTrack}
        initial={{ y: -SLOT_HEIGHT * (wheel.length - 1) }}
        animate={{ y: 0 }}
        transition={{ duration: 0.65, ease: [0.15, 0.85, 0.25, 1] }}
        onAnimationComplete={() => setWheel(null)}
      >
        {wheel.map((txt, i) => (
          <div key={`${spinKey}-${i}`} className={`${styles.slot} font-din`}>
            {txt}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
