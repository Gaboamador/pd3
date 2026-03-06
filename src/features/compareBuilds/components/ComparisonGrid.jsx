import { Link } from "react-router-dom";
import styles from "./ComparisonGrid.module.scss";
import { useLoadBuild } from "../../../hooks/useLoadBuild";

export default function ComparisonGrid({ title, buildIds, builds, buildLabels, rows, showLevel = true }) {
  
  const {loadBuild} = useLoadBuild();
  
  if (!rows || rows.length === 0) return null;

  return (

      <div className={styles.tableWrap}>
        <table className={styles.table}>
            <colgroup>
                <col className={styles.colFeature} />
                {buildIds.map((id) => (
                    <col key={id} className={styles.colBuild} />
                ))}
            </colgroup>
          <thead>
            <tr>
              <th className={styles.featureCol}>SKILL</th>
              {buildIds.map((id) => {
                const build = builds?.find(b => b.id === id);
                return (
                  <th
                    key={id}
                    className={styles.buildCol}
                    onClick={() => {
                      sessionStorage.setItem(
                        "pd3_compare_scroll",
                        String(window.scrollY)
                      );
                      loadBuild(build, {
                        fromComparison: true
                      });
                    }}
                    style={{ cursor: build ? "pointer" : "default" }}
                  >
                    {buildLabels?.[id] || `Build ${id}`}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((r) => (
              <tr key={`${r.type}:${r.slot || ""}:${r.key || r.value || r.label}`}>
                <td className={styles.featureCell}>
                    <div className={styles.featureLabel}>
                        {/* {r.label} */}
                        {r.type === "skill" ? (
                            <Link
                            to={`/catalog/${r.key}`}
                            state={{ fromCompare: true }}
                            className={styles.skillLink}
                            onClick={() => {
                              sessionStorage.setItem(
                                "pd3_compare_scroll",
                                String(window.scrollY)
                              );
                            }}
                            >
                            {r.label}
                            </Link>
                        ) : (
                            r.label
                        )}
                    </div>
                    {r.kind === "level" && <div className={styles.subLabel}>level differs</div>}
                    {r.slot && <div className={styles.subLabel}>{r.slot}</div>}
                </td>

                {buildIds.map((id) => {
                  const cell = r.cells?.[id];
                  const present = !!cell?.present;

                //   let badge = present ? "✓" : "–";
                  let badge = null;
                  let detail = null;

                  if (!present) {
                    badge = "-"
                  }

                  if (showLevel && present && cell?.level) {
                    // "aced" / "base"
                    detail = cell.level;
                  }

                  return (
                    <td
                      key={id}
                      className={[
                        styles.cell,
                        present ? styles.present : styles.absent
                      ].join(" ")}
                      title={detail || ""}
                    >
                      <div className={styles.badgeRow}>
                        {badge && <span className={styles.badge}>{badge}</span>}
                        {detail && <span className={`${styles.detail} ${detail === 'aced' ? styles.aced : ""}`}>{detail}</span>}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
  );
}