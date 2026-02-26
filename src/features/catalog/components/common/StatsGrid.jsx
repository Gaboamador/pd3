import styles from "./StatsGrid.module.scss";

export default function StatsGrid({
  columns,
  rows,
  className = "",
  description,
}) {
  if (!rows?.length) return null;

  const columnCount = columns?.length ?? 2;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {description && (
        <div className={styles.description}>
          {description}
        </div>
      )}

      <div
        className={styles.table}
        style={{
          gridTemplateColumns: `2fr ${Array(columnCount - 1)
            .fill("1fr")
            .join(" ")}`,
        }}
      >
        {columns && (
          <div className={styles.headerRow}>
            {columns.map((col) => (
              <span key={col}>{col}</span>
            ))}
          </div>
        )}

        {rows
        .filter((row) => {
          // Ignorar primera celda (label)
          const values = row.slice(1).map(cell => cell?.value);

          return values.some(
            (v) =>
              v !== null &&
              v !== undefined &&
              v !== "-" &&
              !(typeof v === "number" && isNaN(v))
          );
        })
        .map((row, i) => (
          <div key={i} className={styles.row}>
            {row.map((cell, j) => (
              <span key={j} className={cell.className}>
                {cell.value}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}