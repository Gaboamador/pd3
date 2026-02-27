import { useState, useMemo } from "react";
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import styles from "./WeaponTypeComparisonSection.module.scss";
import {
  formatDamageValue,
  formatAP,
  parsePelletString,
} from "./utils/newStatsFormat";

function getSortableNumeric(value) {
  if (typeof value === "number") return value;
  const parsed = parsePelletString(value);
  if (parsed) return parsed.total;
  return 0;
}

export default function WeaponTypeComparisonSection({ weapons }) {
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  const sortedWeapons = useMemo(() => {
    const sorted = [...weapons];

    sorted.sort((a, b) => {
      let aVal;
      let bVal;

      switch (sortConfig.key) {
        case "close":
          aVal = getSortableNumeric(a.newStats.close);
          bVal = getSortableNumeric(b.newStats.close);
          break;
        case "medium":
          aVal = getSortableNumeric(a.newStats.medium);
          bVal = getSortableNumeric(b.newStats.medium);
          break;
        case "far":
          aVal = getSortableNumeric(a.newStats.far);
          bVal = getSortableNumeric(b.newStats.far);
          break;
        case "ap":
          aVal = a.newStats.ap ?? 0;
          bVal = b.newStats.ap ?? 0;
          break;
        default:
          aVal = a.name ?? a.key;
          bVal = b.name ?? b.key;
      }

      if (typeof aVal === "string") {
        return sortConfig.direction === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return sortConfig.direction === "asc"
        ? aVal - bVal
        : bVal - aVal;
    });

    return sorted;
  }, [weapons, sortConfig]);

  function toggleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "desc" };
    });
  }

  function sortIndicator(key) {
    if (sortConfig.key !== key) return "";
    // return sortConfig.direction === "asc" ? " ↑" : " ↓";
    return sortConfig.direction === "asc" ? <FaCircleChevronUp size={12} /> : <FaCircleChevronDown size={12} />;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <colgroup>
            <col className={styles.colWeapon} />
            <col className={styles.colStat} />
            <col className={styles.colStat} />
            <col className={styles.colStat} />
            <col className={styles.colStat} />
        </colgroup>
        <thead>
            <tr>
            <th onClick={() => toggleSort("name")} className={sortConfig.key === "name" ? styles.active : ""}>
                <div className={styles.headerContent}>
                <span>Weapon</span>
                <span className={styles.sortIcon}>
                    {sortIndicator("name")}
                </span>
                </div>
            </th>

            <th onClick={() => toggleSort("close")} className={sortConfig.key === "close" ? styles.active : ""}>
                <div className={styles.headerContent}>
                <span>Close</span>
                <span className={styles.sortIcon}>
                    {sortIndicator("close")}
                </span>
                </div>
            </th>

            <th onClick={() => toggleSort("medium")} className={sortConfig.key === "medium" ? styles.active : ""}>
                <div className={styles.headerContent}>
                <span>Med.</span>
                <span className={styles.sortIcon}>
                    {sortIndicator("medium")}
                </span>
                </div>
            </th>

            <th onClick={() => toggleSort("far")} className={sortConfig.key === "far" ? styles.active : ""}>
                <div className={styles.headerContent}>
                <span>Far</span>
                <span className={styles.sortIcon}>
                    {sortIndicator("far")}
                </span>
                </div>
            </th>

            <th onClick={() => toggleSort("ap")} className={sortConfig.key === "ap" ? styles.active : ""}>
                <div className={styles.headerContent}>
                <span>AP</span>
                <span className={styles.sortIcon}>
                    {sortIndicator("ap")}
                </span>
                </div>
            </th>
            </tr>
        </thead>

        <tbody>
          {sortedWeapons.map((w) => (
            <tr key={w.key}>
              <td>{w.name ?? w.key}</td>
              <td>{formatDamageValue(w.newStats.close)}</td>
              <td>{formatDamageValue(w.newStats.medium)}</td>
              <td>{formatDamageValue(w.newStats.far)}</td>
              <td>{formatAP(w.newStats.ap)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}