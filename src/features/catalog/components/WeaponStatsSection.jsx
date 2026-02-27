import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";
import styles from "./WeaponStatsSection.module.scss";
import { formatNumber, formatDamageValue, formatAP } from "./utils/newStatsFormat";

// Orden “humano” típico (ajustalo si querés)
const MOD_SLOT_ORDER = [
  "Magazine",
  "Barrel",
  "BarrelExtension",
  "ForeGrip",
  "Stock",
  "Sight",
  "Receiver",
  "Grip",
];

function buildNewStatsRows(newStats) {
  if (!newStats) return [];

  return [
    ["Damage Close", formatDamageValue(newStats.close)],
    ["Damage Medium", formatDamageValue(newStats.medium)],
    ["Damage Far", formatDamageValue(newStats.far)],
    ["Armor Penetration", formatNumber(newStats.ap)],
  ]
    .filter(([_, v]) => v != null)
    .map(([k, v]) => [{ value: k }, { value: v }]);
}

function buildModsInfo(weapon) {
  const modsBySlot = weapon?.mods;
  if (!modsBySlot || typeof modsBySlot !== "object") return [];

  const entries = Object.entries(modsBySlot)
    .filter(([_, slotMods]) => slotMods && typeof slotMods === "object")
    .map(([slot, slotMods]) => {
      const names = Object.values(slotMods)
        .map((m) => m?.name)
        .filter(Boolean);

      return { slot, names };
    })
    .filter((x) => x.names.length > 0);

  // Ordenar slots (primero los conocidos, después alfabético)
  entries.sort((a, b) => {
    const ia = MOD_SLOT_ORDER.indexOf(a.slot);
    const ib = MOD_SLOT_ORDER.indexOf(b.slot);

    const aKnown = ia !== -1;
    const bKnown = ib !== -1;

    if (aKnown && bKnown) return ia - ib;
    if (aKnown) return -1;
    if (bKnown) return 1;
    return a.slot.localeCompare(b.slot);
  });

  return entries;
}

export default function WeaponStatsSection({ weapon }) {
  if (!weapon) return null;

  const rows = buildNewStatsRows(weapon.newStats);
  if (rows.length === 0) return null;

  const modsInfo = buildModsInfo(weapon);

  return (
    <>
      <StatsGrid columns={["Stat", "Value"]} rows={rows} />

      {modsInfo.length > 0 && (
        <div className={styles.modsSection}>
          <div className={styles.modsTitle}>Mods Available</div>

          <div className={styles.modsGrid}>
            {modsInfo.map(({ slot, names }) => (
              <div key={slot} className={styles.modRow}>
                <div className={styles.modSlot}>
                  {prettifyKey(slot)}
                </div>

                <div className={styles.modNames}>
                  {names.map((name) => (
                    <span key={name} className={styles.modChip}>
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}