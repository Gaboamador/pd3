import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaCircleChevronDown, FaCircleChevronUp } from "react-icons/fa6";
import { formatWeaponTypeLabel } from "../../../utils/searchPresentation.utils";
import styles from "./PerksComparisonSection.module.scss";

function buildOverkillNameMap(loadoutData) {
  return Object.values(loadoutData?.overkill ?? {}).reduce((map, weapon) => {
    if (weapon?.key) map[weapon.key] = weapon.name ?? weapon.key;
    return map;
  }, {});
}

function buildOverkillOrderMap(loadoutData) {
  return Object.values(loadoutData?.overkill ?? {}).reduce((map, weapon, index) => {
    if (weapon?.key) map[weapon.key] = index;
    return map;
  }, {});
}

function buildIconicWeaponsByPerkKey(loadoutData) {
  const map = {};

  ["primary", "secondary"].forEach((slot) => {
    Object.values(loadoutData?.[slot] ?? {}).forEach((weapon) => {
      if (weapon?.preset !== 1 || !weapon?.perk) return;

      if (!map[weapon.perk]) {
        map[weapon.perk] = [];
      }

      map[weapon.perk].push({
        key: weapon.key,
        name: weapon.name ?? weapon.key,
      });
    });
  });

  return map;
}

function getAssociationLabel(perk, overkillNameByKey, iconicWeaponsByPerkKey) {
  if (perk?.scope === "weapon") {
    if (perk.iconicOnly) {
      const iconicWeapons = iconicWeaponsByPerkKey?.[perk.key] ?? [];
      return iconicWeapons.map((weapon) => weapon.name).join(", ");
    }

    return (perk.weaponTypes ?? [])
      .map(formatWeaponTypeLabel)
      .filter(Boolean)
      .join(", ");
  }

  if (perk?.scope === "overkill") {
    const weaponName = overkillNameByKey[perk.weaponKey] ?? perk.weaponKey ?? "Overkill Weapon";
    const slotLabel = perk.slotLabel ?? perk.slotKey;
    return [weaponName, slotLabel].filter(Boolean).join(" · ");
  }

  return "—";
}

function getPerkSlotOrder(perk) {
  const match = String(perk?.slotKey ?? "").match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

export default function PerksComparisonSection({ perksData, loadoutData }) {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [selectedWeaponTypes, setSelectedWeaponTypes] = useState([]);
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const overkillNameByKey = useMemo(
    () => buildOverkillNameMap(loadoutData),
    [loadoutData]
  );

  const iconicWeaponsByPerkKey = useMemo(
    () => buildIconicWeaponsByPerkKey(loadoutData),
    [loadoutData]
  );

  const weaponPerks = useMemo(
    () =>
      Object.values(perksData ?? {})
        .filter(
          (perk) =>
            perk?.optionType === "perk" &&
            perk?.scope === "weapon"
        )
        .map((perk) => ({
          ...perk,
          iconicWeapons: iconicWeaponsByPerkKey[perk.key] ?? [],
          association: getAssociationLabel(
            perk,
            overkillNameByKey,
            iconicWeaponsByPerkKey
          ),
        })),
    [perksData, overkillNameByKey, iconicWeaponsByPerkKey]
  );

  const weaponTypeOptions = useMemo(() => {
    const types = new Set();

    weaponPerks.forEach((perk) => {
      (perk.weaponTypes ?? []).forEach((type) => {
        if (type) types.add(type);
      });
    });

    return Array.from(types).sort((a, b) =>
      formatWeaponTypeLabel(a).localeCompare(formatWeaponTypeLabel(b))
    );
  }, [weaponPerks]);

  const weaponRows = useMemo(() => {
    let filtered = selectedWeaponTypes.length
      ? weaponPerks.filter((perk) =>
          (perk.weaponTypes ?? []).some((type) =>
            selectedWeaponTypes.includes(type)
          )
        )
      : weaponPerks;

    if (availabilityFilter === "standard") {
      filtered = filtered.filter((perk) => !perk.iconicOnly);
    } else if (availabilityFilter === "iconic") {
      filtered = filtered.filter((perk) => perk.iconicOnly);
    }

    return [...filtered].sort((a, b) => {
      const key = sortConfig.key;
      const aVal = key === "association" ? a.association : a.name ?? a.key;
      const bVal = key === "association" ? b.association : b.name ?? b.key;
      const result = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortConfig.direction === "asc" ? result : -result;
    });
  }, [weaponPerks, selectedWeaponTypes, availabilityFilter, sortConfig]);

  const overkillRows = useMemo(() => {
    const overkillOrderByKey = buildOverkillOrderMap(loadoutData);

    return Object.values(perksData ?? {})
      .filter(
        (perk) =>
          perk?.optionType === "perk" &&
          perk?.scope === "overkill"
      )
      .map((perk) => ({
        ...perk,
        association: getAssociationLabel(perk, overkillNameByKey, iconicWeaponsByPerkKey),
      }))
      .sort((a, b) => {
        const weaponOrderA =
          overkillOrderByKey[a.weaponKey] ?? Number.MAX_SAFE_INTEGER;
        const weaponOrderB =
          overkillOrderByKey[b.weaponKey] ?? Number.MAX_SAFE_INTEGER;

        if (weaponOrderA !== weaponOrderB) {
          return weaponOrderA - weaponOrderB;
        }

        return getPerkSlotOrder(a) - getPerkSlotOrder(b);
      });
  }, [perksData, loadoutData, overkillNameByKey, iconicWeaponsByPerkKey]);

  function toggleSort(key) {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }

      return { key, direction: "asc" };
    });
  }

  function toggleWeaponType(type) {
    setSelectedWeaponTypes((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );
  }

  function sortIndicator(key) {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <FaCircleChevronUp size={12} />
    ) : (
      <FaCircleChevronDown size={12} />
    );
  }

  function renderTableHeader({ sortable = false } = {}) {
    return (
      <thead>
        <tr>
          <th
            onClick={sortable ? () => toggleSort("name") : undefined}
            className={
              sortable && sortConfig.key === "name" ? styles.active : ""
            }
            data-sortable={sortable || undefined}
          >
            <div className={styles.headerContent}>
              <span>{t("catalog.perks.name")}</span>
              {sortable && (
                <span className={styles.sortIcon}>{sortIndicator("name")}</span>
              )}
            </div>
          </th>

          <th
            onClick={sortable ? () => toggleSort("association") : undefined}
            className={
              sortable && sortConfig.key === "association" ? styles.active : ""
            }
            data-sortable={sortable || undefined}
          >
            <div className={styles.headerContent}>
              <span>{t("catalog.perks.associated-with")}</span>
              {sortable && (
                <span className={styles.sortIcon}>
                  {sortIndicator("association")}
                </span>
              )}
            </div>
          </th>

          <th>{t("catalog.perks.description")}</th>
        </tr>
      </thead>
    );
  }

  function renderAssociation(perk) {
    if (perk?.scope === "weapon" && perk.iconicOnly) {
      return (
        <div className={styles.iconicAssociation}>
          <span className={styles.iconicOnlyBadge}>Iconic only</span>
          <span className={styles.iconicWeapons}>
            {perk.iconicWeapons?.length
              ? perk.iconicWeapons.map((weapon) => weapon.name).join(", ")
              : "—"}
          </span>
        </div>
      );
    }

    return perk.association || "—";
  }

  function renderRows(rows, { overkill = false } = {}) {
    return rows.map((perk, index) => {
      const previousPerk = rows[index - 1];
      const startsOverkillGroup =
        overkill &&
        index > 0 &&
        previousPerk?.weaponKey !== perk.weaponKey;
      const perkTypeClass = perk.equipped
      ? styles.equipped
      : perk.persistent
        ? styles.persistent
        : "";

      return (
        <tr
          key={perk.key}
          className={`${perkTypeClass} ${
            startsOverkillGroup ? styles.overkillGroupStart : ""
          }`}
        >
          <td className={styles.perkName}>{perk.name ?? perk.key}</td>
          <td>{renderAssociation(perk)}</td>
          <td className={styles.description}>{perk.description ?? "—"}</td>
        </tr>
      );
    });
  }

  const hasWeaponTypeFilter = selectedWeaponTypes.length > 0;
  const hasWeaponPerkFilter =
    hasWeaponTypeFilter || availabilityFilter !== "all";

  return (
    <div className={styles.wrapper}>
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Weapon Perks</h3>
            <div className={styles.sectionMeta}>
              {weaponRows.length} / {weaponPerks.length}
            </div>
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Availability</span>
              <div className={styles.filterTags}>
                {[
                  ["all", "All"],
                  ["standard", "Selectable"],
                  ["iconic", "Iconic only"],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className={`${styles.filterTag} ${
                      availabilityFilter === key ? styles.filterTagActive : ""
                    }`}
                    onClick={() => setAvailabilityFilter(key)}
                    aria-pressed={availabilityFilter === key}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <span className={styles.filterLabel}>Filter by weapon type</span>
              <div className={styles.filterTags}>
                <button
                  type="button"
                  className={`${styles.filterTag} ${
                    !hasWeaponTypeFilter ? styles.filterTagActive : ""
                  }`}
                  onClick={() => setSelectedWeaponTypes([])}
                  aria-pressed={!hasWeaponTypeFilter}
                >
                  All
                </button>

                {weaponTypeOptions.map((type) => {
                  const isActive = selectedWeaponTypes.includes(type);

                  return (
                    <button
                      key={type}
                      type="button"
                      className={`${styles.filterTag} ${
                        isActive ? styles.filterTagActive : ""
                      }`}
                      onClick={() => toggleWeaponType(type)}
                      aria-pressed={isActive}
                    >
                      {formatWeaponTypeLabel(type)}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <colgroup>
              <col className={styles.colPerk} />
              <col className={styles.colAssociation} />
              <col className={styles.colDescription} />
            </colgroup>

            {renderTableHeader({ sortable: true })}

            <tbody>{renderRows(weaponRows)}</tbody>
          </table>
        </div>
      </section>

      {!hasWeaponPerkFilter && overkillRows.length > 0 && (
        <section className={`${styles.section} ${styles.overkillSection}`}>
          <div className={styles.sectionHeader}>
            <div>
              <h3 className={styles.sectionTitle}>Overkill Weapon Perks</h3>
              <div className={styles.sectionMeta}>{overkillRows.length}</div>
            </div>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.colPerk} />
                <col className={styles.colAssociation} />
                <col className={styles.colDescription} />
              </colgroup>

              {renderTableHeader()}

              <tbody>{renderRows(overkillRows, { overkill: true })}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
