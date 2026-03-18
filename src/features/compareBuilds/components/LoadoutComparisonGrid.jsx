import styles from "./LoadoutComparisonGrid.module.scss";

export default function LoadoutComparisonGrid({
  buildIds,
  buildLabels,
  rows
}) {
  if (!rows?.length) return null;

  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <colgroup>
            <col className={styles.colFeature} />
            {buildIds.map(id => (
            <col key={id} className={styles.colBuild} />
            ))}
        </colgroup>
        <thead>
          <tr>
            <th className={styles.headerFeature}>Loadout</th>
            {buildIds.map(id => (
            <th key={id} className={styles.headerBuild}>
                {buildLabels[id]}
            </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {rows.map(row => (
            <tr key={row.key}>
              <td className={styles.label}>{row.label}</td>

              {buildIds.map(id => (
                <td key={id} className={styles.value}>
                  {row.cells[id]?.value || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}