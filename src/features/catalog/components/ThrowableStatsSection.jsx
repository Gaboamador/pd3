import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";
import { formatDeployableStat } from "./utils/formatters";

export default function ThrowableStatsSection({ throwable }) {
  if (!throwable) return null;

  const rows = Object.entries(throwable.stats || {})
    .filter(([_, v]) => !Array.isArray(v))
    .map(([key, value]) => [
      { value: prettifyKey(key) },
      { value: formatDeployableStat(key, value) },
    ]);

  return (
    <StatsGrid
      description={throwable.description}
      columns={["Stat", "Value"]}
      rows={rows}
    />
  );
}