import { useTranslation } from "react-i18next";
import StatsGrid from "./common/StatsGrid";
import { prettifyKey } from "./utils/prettifyKey";
import styles from "./WeaponStatsSection.module.scss";
import perksData from "../../../data/payday3_perks.json";
import { getPerkByKey, getWeaponPerks, isIconicWeapon } from "../../../build/utils/perks.utils";

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

const STAT_DEFINITIONS = [
  { key: "damage", labelKey: "catalog.weapon.damage", fallback: "Damage" },
  { key: "ap", labelKey: "catalog.weapon.ap", fallback: "Armor Penetration" },
  { key: "recoil", labelKey: "catalog.weapon.recoil", fallback: "Recoil" },
  { key: "stability", labelKey: "catalog.weapon.stability", fallback: "Stability" },
  { key: "accuracy", labelKey: "catalog.weapon.accuracy", fallback: "Accuracy" },
  { key: "handling", labelKey: "catalog.weapon.handling", fallback: "Handling" },
  { key: "rof", labelKey: "catalog.weapon.rof", fallback: "Rate of Fire" },
  { key: "magazine", labelKey: "catalog.weapon.magazine", fallback: "Magazine" },
  { key: "ammo", labelKey: "catalog.weapon.ammo", fallback: "Ammo" },
];

function formatStatValue(value) {
  if (value == null) return null;

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : null;
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

function formatDamage(stats) {
  if (!stats || stats.damage == null) return null;

  const damage = formatStatValue(stats.damage);
  if (damage == null) return null;

  if (stats.pellets != null) {
    const pellets = formatStatValue(stats.pellets);
    if (pellets != null) {
      return `${pellets} x ${damage}`;
    }
  }

  return damage;
}

function buildStatsRows(stats, t) {
  if (!stats || typeof stats !== "object") return [];

  return STAT_DEFINITIONS
    .map(({ key, labelKey, fallback }) => {
      const value =
        key === "damage"
          ? formatDamage(stats)
          : formatStatValue(stats[key]);

      return [
        t(labelKey, { defaultValue: fallback }),
        value,
      ];
    })
    .filter(([_, value]) => value != null)
    .map(([label, value]) => [{ value: label }, { value }]);
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
  const { t } = useTranslation();
  if (!weapon) return null;

  const rows = buildStatsRows(weapon.stats, t);
  const modsInfo = buildModsInfo(weapon);

  const isIconic = isIconicWeapon(weapon);
  const perks = isIconic
    ? [getPerkByKey(perksData, weapon.perk)].filter(Boolean)
    : getWeaponPerks(perksData, weapon.type);

  if (rows.length === 0 && modsInfo.length === 0 && perks.length === 0) return null;

  return (
    <>
      {rows.length > 0 && (
        <StatsGrid columns={[t('catalog.header-stat'), t('catalog.header-value')]} rows={rows} />
      )}

      {perks.length > 0 && (
        <div className={styles.perksSection}>
          <div className={styles.modsTitle}>
            {isIconic
              ? t('catalog.label.iconic-perk')
              : t('catalog.title.weapon-perks')}
          </div>

          <div className={styles.perkGrid}>
            {perks.map((perk) => (
              <div key={perk.key} className={styles.perkCard}>
                <div className={styles.perkName}>{perk.name}</div>
                <div className={styles.perkDescription}>{perk.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modsInfo.length > 0 && (
        <div className={styles.modsSection}>
          <div className={styles.modsTitle}>{t('catalog.title.weapon-mods')}</div>

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
