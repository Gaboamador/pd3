import { useEffect, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";
import styles from "./SlotMachineReel.module.scss";

function computeLoops(count) {
  // escala gradual 3 -> 1 (luego redondeamos)
  const minLoops = 1;
  const maxLoops = 3;

  const minItems = 3;
  const maxItems = 25;

  const clamped = Math.max(minItems, Math.min(count, maxItems));
  const t = (clamped - minItems) / (maxItems - minItems);

  const loopsFloat = maxLoops - t * (maxLoops - minLoops);

  // ✅ loops ENTEROS
  return Math.max(1, Math.round(loopsFloat));
}

export default function SlotMachineReel({
  items,
  SpriteComponent,
  height = 80,
  onFinish,
  duration = 2,
}) {
  const controls = useAnimation();

  const loops = useMemo(
    () => (items?.length ? computeLoops(items.length) : 1),
    [items?.length]
  );

  // ✅ renderizamos suficiente contenido según loops (+1 para cubrir finalIndex)
  const reelItems = useMemo(() => {
    if (!items?.length) return [];
    return Array.from({ length: loops + 1 }, () => items).flat();
  }, [items, loops]);

  useEffect(() => {
    if (!items?.length) return;

    const finalIndex = Math.floor(Math.random() * items.length);

    const totalItems = items.length * loops + finalIndex;
    const offset = totalItems * height;

    controls
      .start({
        y: -offset,
        transition: {
          duration,
          ease: [0.22, 1, 0.36, 1],
        },
      })
      .then(() => {
        onFinish(items[finalIndex]);
      });
  }, [items, loops, height, duration, controls, onFinish]);

  return (
    <div className={styles.viewport} style={{ height }}>
      <motion.div className={styles.reel} initial={{ y: 0 }} animate={controls}>
        {reelItems.map((item, i) => (
          <div
            key={`${item.key ?? item.name}-${i}`}
            className={styles.reelItem}
            style={{ height }}
          >
            {SpriteComponent ? (
              <SpriteComponent
                spritePos={item.sprite_pos}
                height={height}
              />
            ) : (
              <span>{item.name}</span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
