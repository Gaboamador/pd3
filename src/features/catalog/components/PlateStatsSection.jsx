import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";
import { formatPlateStat } from "./utils/formatters";
import styles from "./PlateStatsSection.module.scss";

export default function PlateStatsSection({ plate }) {
  if (!plate) return null;

  const rows = Object.entries(plate.stats || {}).map(
    ([key, value]) => [
      { value: prettifyKey(key) },
      { value: formatPlateStat(key, value) },
    ]
  );

  const specialBlock = plate.special ? (
    <div
      className={styles.special}
      style={{ borderLeft: `4px solid ${plate.color}` }}
    >
      {plate.special}
    </div>
  ) : null;

  return (
    <StatsGrid
      description={specialBlock}
      columns={["Stat", "Value"]}
      rows={rows}
    />
  );
}