import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";
import { formatDeployableStat } from "./utils/formatters";

export default function DeployableStatsSection({ deployable }) {
  if (!deployable) return null;

  const rows = Object.entries(deployable.stats || {})
    .filter(([_, v]) => !Array.isArray(v))
    .map(([key, value]) => [
      { value: prettifyKey(key) },
      { value: formatDeployableStat(key, value) },
    ]);

  return (
    <StatsGrid
      description={deployable.description}
      columns={["Stat", "Value"]}
      rows={rows}
    />
  );
}