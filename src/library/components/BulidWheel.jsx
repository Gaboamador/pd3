import { useMemo, useRef, useEffect, useState } from "react";
import styles from "./BuildWheel.module.scss";

export default function BuildWheel({
  builds,
  rotation,
}) {
  const wheelRef = useRef(null);
  const [radius, setRadius] = useState(150);

  const segmentAngle = 360 / builds.length;

  useEffect(() => {
    function updateSize() {
      if (!wheelRef.current) return;
      const size = wheelRef.current.offsetWidth;
      setRadius(size / 2 - 20); // 20px padding interior
    }

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

const gradient = useMemo(() => {
  const segmentAngle = 360 / builds.length;

  const parts = builds.map((_, i) => {
    const start = i * segmentAngle;
    const end = start + segmentAngle;

    const lightness = i % 2 === 0 ? 42 : 32;

    return `
      hsl(145, 60%, ${lightness}%)
      ${start}deg ${end}deg
    `;

  });

  return `conic-gradient(${parts.join(",")})`;
}, [builds]);


  return (
  <div className={styles.wrapper}>
  <div
    ref={wheelRef}
    className={styles.wheel}
    style={{
      transform: `rotate(${rotation}deg)`
    }}
  >
    <div
      className={styles.background}
      style={{ background: gradient }}
    />

    <div className={styles.labels}>
      {builds.map((build, i) => {
        const angle =
          segmentAngle * i + segmentAngle / 2;

        return (
          <div
            key={build.id}
            className={styles.label}
            style={{
              transform: `
                rotate(${angle}deg)
                translateY(-${radius * 1.05}px)
                rotate(85deg)
              `,
            }}
          >
            <span>{build.name}</span>
          </div>
        );
      })}
    </div>
  </div>

  <div className={styles.pointer} />
</div>

);

}
