import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import styles from "../styles/ConfettiBurst.module.scss";

const COLORS = [
  "rgba(87,166,255,0.9)",
  "rgba(155,189,255,0.9)",
  "rgba(255,255,255,0.9)",
  "rgba(200,220,255,0.9)"
];

const PARTICLE_COUNT = 34;
const DURATION = 1.6;
const STEPS = 9;
const OFFSCREEN_MARGIN = 120;

export default function ConfettiBurst({ trigger, origin }) {
  const [particles, setParticles] = useState([]);
  const particleRefs = useRef({});

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
      const size = Math.random() < 0.35 ? 4 : Math.random() < 0.75 ? 6 : 8;

      const vx0 = (Math.random() - 0.5) * 260;
      const vy0 = -(Math.random() * 420 + 520);
      const g = Math.random() * 900 + 1400;
      const wind = (Math.random() - 0.5) * 140;

      const r0 = (Math.random() - 0.5) * 180;
      const r1 = r0 + (Math.random() - 0.5) * 900;

      const xs = [];
      const ys = [];
      const rs = [];
      const times = [];

      for (let s = 0; s < STEPS; s++) {
        const tNorm = s / (STEPS - 1);
        const t = tNorm * DURATION;

        xs.push(vx0 * t + wind * (tNorm ** 2));
        ys.push(vy0 * t + 0.5 * g * (t ** 2));
        rs.push(r0 + (r1 - r0) * tNorm);
        times.push(tNorm);
      }

      return {
        id: `${trigger}-${i}`,
        xs,
        ys,
        rs,
        times,
        size,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    });

    setParticles(newParticles);
  }, [trigger]);

  // 🔴 Limpieza física real
  useEffect(() => {
    if (particles.length === 0) return;

    let raf;

    const check = () => {
      setParticles(prev =>
        prev.filter(p => {
          const el = particleRefs.current[p.id];
          if (!el) return false;

          const rect = el.getBoundingClientRect();
          return rect.top < window.innerHeight + OFFSCREEN_MARGIN;
        })
      );

      raf = requestAnimationFrame(check);
    };

    raf = requestAnimationFrame(check);
    return () => cancelAnimationFrame(raf);
  }, [particles]);

  return (
    <div
      className={styles.confettiContainer}
      style={{ left: origin.x, top: origin.y }}
    >
      {particles.map(p => (
        <motion.div
          key={p.id}
          ref={el => (particleRefs.current[p.id] = el)}
          className={styles.confettiParticle}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0 }}
          animate={{ opacity: [0, 1, 1], x: p.xs, y: p.ys, rotate: p.rs }}
          transition={{ duration: DURATION, times: p.times, ease: "linear" }}
          style={{
            backgroundColor: p.color,
            width: p.size,
            height: p.size * 1.6
          }}
        />
      ))}
    </div>
  );
}
