import { Fragment, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCircleChevronUp, FaCircleChevronDown } from "react-icons/fa6";
import perksData from "../../../data/payday3_perks.json";
import styles from "./WeaponTypeComparisonSection.module.scss";

const STAT_COLUMNS = [
  { key: "damage", label: "Dmg" },
  { key: "ap", label: "AP" },
  { key: "recoil", label: "Reco" },
  { key: "stability", label: "Stab" },
  { key: "accuracy", label: "Acc" },
  { key: "handling", label: "Hand" },
  { key: "rof", label: "ROF" },
  { key: "magazine", label: "Mag" },
  { key: "ammo", label: "Ammo" },
];

const VARIANT_FILTERS = [
  { key: "all", labelKey: "catalog.weapon-filter.all", fallback: "All" },
  { key: "standard", labelKey: "catalog.weapon-filter.standard", fallback: "Standard" },
  { key: "iconic", labelKey: "catalog.weapon-filter.iconic", fallback: "Iconic" },
];

function isIconicWeapon(weapon) {
  return weapon?.preset === 1;
}

function formatStatValue(value) {
  if (value == null) return "—";

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return String(value);
}

function formatDamage(stats) {
  if (!stats || stats.damage == null) return "—";

  const damage = formatStatValue(stats.damage);

  if (stats.pellets != null) {
    return `${formatStatValue(stats.pellets)} x ${damage}`;
  }

  return damage;
}

function getSortableNumeric(value) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSortableStat(weapon, key) {
  const stats = weapon?.stats;

  if (!stats || typeof stats !== "object") return 0;

  if (key === "damage") {
    const damage = getSortableNumeric(stats.damage);

    if (stats.pellets != null) {
      return damage * getSortableNumeric(stats.pellets);
    }

    return damage;
  }

  return getSortableNumeric(stats[key]);
}

function formatStat(weapon, key) {
  if (key === "damage") {
    return formatDamage(weapon?.stats);
  }

  return formatStatValue(weapon?.stats?.[key]);
}

function getWeaponPerk(weapon) {
  if (!isIconicWeapon(weapon) || !weapon?.perk) return null;

  const perk = perksData?.[weapon.perk];

  return {
    key: weapon.perk,
    name: perk?.name ?? weapon.perk,
    description: perk?.description ?? "—",
    type: perk?.equipped
      ? "equipped"
      : perk?.persistent
        ? "persistent"
        : null,
  };
}

export default function WeaponTypeComparisonSection({ weapons }) {
  const { t } = useTranslation();
  const [variantFilter, setVariantFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  useEffect(() => {
    setVariantFilter("all");
  }, [weapons]);

  const filteredWeapons = useMemo(() => {
    if (variantFilter === "standard") {
      return weapons.filter((weapon) => !isIconicWeapon(weapon));
    }

    if (variantFilter === "iconic") {
      return weapons.filter(isIconicWeapon);
    }

    return weapons;
  }, [weapons, variantFilter]);

  const sortedWeapons = useMemo(() => {
    const sorted = [...filteredWeapons];

    sorted.sort((a, b) => {
      // En la vista All, las Iconic permanecen agrupadas al final,
      // independientemente de la columna elegida para ordenar.
      if (variantFilter === "all") {
        const iconicOrder = Number(isIconicWeapon(a)) - Number(isIconicWeapon(b));
        if (iconicOrder !== 0) return iconicOrder;
      }

      let aVal;
      let bVal;

      if (sortConfig.key === "name") {
        aVal = a.name ?? a.key ?? "";
        bVal = b.name ?? b.key ?? "";
      } else {
        aVal = getSortableStat(a, sortConfig.key);
        bVal = getSortableStat(b, sortConfig.key);
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
  }, [filteredWeapons, sortConfig, variantFilter]);

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

    return sortConfig.direction === "asc"
      ? <FaCircleChevronUp size={12} />
      : <FaCircleChevronDown size={12} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.filterBar}>
        {VARIANT_FILTERS.map(({ key, labelKey, fallback }) => (
          <button
            key={key}
            type="button"
            className={`${styles.filterBadge} ${
              variantFilter === key ? styles.filterBadgeActive : ""
            }`}
            onClick={() => setVariantFilter(key)}
          >
            {t(labelKey, { defaultValue: fallback })}
          </button>
        ))}
      </div>

      <div className={styles.tableScroller}>
        <table className={styles.table}>
          <colgroup>
          <col className={styles.weaponCol} />
          {STAT_COLUMNS.map(({ key }) => (
            <col key={key} className={styles.statCol} />
          ))}
          </colgroup>

          <thead>
          <tr>
            <th
              onClick={() => toggleSort("name")}
              className={`${styles.weaponColumn} ${
                sortConfig.key === "name" ? styles.active : ""
              }`}
            >
              <div className={styles.headerContent}>
                <span>{t("weapon.compare.name", { defaultValue: "Weapon" })}</span>
                <span className={styles.sortIcon}>
                  {sortIndicator("name")}
                </span>
              </div>
            </th>

            {STAT_COLUMNS.map(({ key, label }) => (
              <th
                key={key}
                onClick={() => toggleSort(key)}
                className={`${styles.statColumn} ${
                  sortConfig.key === key ? styles.active : ""
                }`}
              >
                <div className={styles.headerContent}>
                  <span>{label}</span>
                  <span className={styles.sortIcon}>
                    {sortIndicator(key)}
                  </span>
                </div>
              </th>
            ))}
          </tr>
          </thead>

          <tbody>
          {sortedWeapons.map((weapon) => {
            const perk = getWeaponPerk(weapon);
            const perkRowClass = perk?.type === "equipped"
              ? styles.perkRowEquipped
              : perk?.type === "persistent"
                ? styles.perkRowPersistent
                : "";

            return (
              <Fragment key={weapon.key}>
                <tr
                  className={`${styles.weaponRow} ${
                    isIconicWeapon(weapon) ? styles.iconicWeaponRow : ""
                  }`}
                >
                  <td className={styles.weaponColumn}>{weapon.name ?? weapon.key}</td>
                  {STAT_COLUMNS.map(({ key }) => (
                    <td key={key} className={styles.statColumn}>
                      {formatStat(weapon, key)}
                    </td>
                  ))}
                </tr>

                {perk && (
                  <tr className={`${styles.perkRow} ${perkRowClass}`}>
                    <td className={styles.perkNameCell}>{perk.name}</td>
                    <td
                      className={styles.perkDescriptionCell}
                      colSpan={STAT_COLUMNS.length}
                    >
                      {perk.description}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
