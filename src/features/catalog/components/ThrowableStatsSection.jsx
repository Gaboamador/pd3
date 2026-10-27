import { useTranslation } from "react-i18next";
import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";

const STAT_ORDER = [
  "damage",
  "specialEffect",
  "ap",
  "capacity",
  "explosionRadius",
  "affectedEnemies",
  "detonationTime",
  "secondaryDetonationTime",
];

const STAT_LABELS = {
  damage: "Damage",
  specialEffect: "Special Effect",
  ap: "Armor Penetration",
  capacity: "Capacity",
  explosionRadius: "Explosion Radius",
  affectedEnemies: "Affected Enemies",
  detonationTime: "Detonation Time",
  secondaryDetonationTime: "Secondary Explosion Time",
};

function formatThrowableStat(key, value) {
  // Un null explícito significa «no aplica». Una propiedad ausente no se muestra.
  if (value === null) return "N/A";

  if (key === "explosionRadius") return `${value}m`;
  if (key === "detonationTime" || key === "secondaryDetonationTime") {
    return `${value}s`;
  }

  // «ap» es un valor absoluto de Armor Penetration, NO un porcentaje.
  return value;
}

export default function ThrowableStatsSection({ throwable }) {
  const { t } = useTranslation();
  if (!throwable) return null;

  const stats = throwable.stats ?? {};
  const rows = Object.entries(stats)
    .filter(([, value]) =>
      value === null || typeof value === "number" || typeof value === "string"
    )
    .sort(([a], [b]) => {
      const ai = STAT_ORDER.indexOf(a);
      const bi = STAT_ORDER.indexOf(b);
      const aOrder = ai < 0 ? Number.MAX_SAFE_INTEGER : ai;
      const bOrder = bi < 0 ? Number.MAX_SAFE_INTEGER : bi;
      return aOrder - bOrder;
    })
    .map(([key, value]) => [
      { value: STAT_LABELS[key] ?? prettifyKey(key) },
      { value: formatThrowableStat(key, value) },
    ]);

  return (
    <StatsGrid
      description={throwable.description}
      columns={[t("catalog.header-stat"), t("catalog.header-value")]}
      rows={rows}
    />
  );
}
