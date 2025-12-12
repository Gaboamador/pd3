import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import styles from "../styles/BuildLayout.module.scss";

const COLORS = [
  "rgba(87,166,255,0.9)",   // azul PD3
  "rgba(155,189,255,0.9)",  // celeste suave
  "rgba(255,255,255,0.9)",  // blanco
  "rgba(200,220,255,0.9)"   // plateado suave
];

export default function ConfettiBurst({ trigger, origin }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: 10 }).map((_, i) => ({
      id: i,
      x: (Math.random() - 0.5) * 160, // rango horizontal
      y: -Math.random() * 120 - 80,   // hacia arriba
      rotate: (Math.random() - 0.5) * 180,
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    }));

    setParticles(newParticles);

    const timeout = setTimeout(() => setParticles([]), 600);
    return () => clearTimeout(timeout);

  }, [trigger]);

  return (
    <div className={styles.confettiContainer} style={{ left: origin.x, top: origin.y }}>
      {particles.map(p => (
        <motion.div
          key={p.id}
          className={styles.confettiParticle}
          initial={{ opacity: 0, y: 0, x: 0, rotate: 0 }}
          animate={{ opacity: 1, y: p.y, x: p.x, rotate: p.rotate }}
          transition={{ duration: 0.6, ease: [0, 0, 0.58, 1] }}
          style={{ backgroundColor: p.color }}
        />
      ))}
    </div>
  );
}
