import { useState } from "react";
import styles from "./BuildLibrary.module.scss";
import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";


const loadoutIndex = Object.values(loadoutData)
  .flatMap(category => Object.values(category))
  .reduce((acc, item) => {
    if (item?.key) {
      acc[item.key] = item;
    }
    return acc;
  }, {});

function normalizeItemName(name) {
  if (!name) return name;

  // Eliminar " Frame" al final
  return name.replace(/\s+Frame$/, "");
}

function getItemNameByKey(key) {
  if (!key) return null;

  const name = loadoutIndex[key]?.name ?? null;
  return normalizeItemName(name);
}

function SlotBadge({ slot }) {
  if (slot == null) {
    return <span className={styles.slotEmpty}>—</span>;
  }

  return (
    <span className={styles.slotBadge}>
      {slot <= 9 ? `${slot}` : `Alt ${slot}`}
    </span>
  );
}

function SlotSelect({ slot, onChange }) {
  return (
    <select
      className={styles.slotSelect}
      value={slot ?? ""}
      onChange={(e) =>
        onChange(
          e.target.value === "" ? null : Number(e.target.value)
        )
      }
    >
      <option value="">Unassigned</option>

      <optgroup label="Main builds (0–9)">
        {Array.from({ length: 10 }).map((_, i) => (
          <option key={i} value={i}>
            Loadout {i}
          </option>
        ))}
      </optgroup>

      <optgroup label="Alternative builds (10+)">
        {Array.from({ length: 20 }).map((_, i) => (
          <option key={i + 10} value={i + 10}>
            Alt {i + 10}
          </option>
        ))}
      </optgroup>
    </select>
  );
}

function formatPlates(plates) {
  if (!Array.isArray(plates) || plates.length === 0) {
    return null;
  }

  const counts = {};

  plates.forEach((plateKey) => {
    counts[plateKey] = (counts[plateKey] || 0) + 1;
  });

  const parts = Object.entries(counts).map(
    ([plateKey, count]) => {
      const plateName =
        platesData[plateKey]?.name ?? plateKey;

      return count > 1
        ? `${plateName} x${count}`
        : plateName;
    }
  );

  return parts.join(" + ");
}

export default function BuildLibrary({
  builds,
  currentBuildId,
  onLoadBuild,
  onDeleteBuild,
  onAssignSlot,
}) {
  const [expandedId, setExpandedId] = useState(null);

  if (!builds.length) {
    return <div className={styles.empty}>No saved builds</div>;
  }

  return (
    <div className={styles.library}>
      <h3 className={styles.title}>Saved Builds</h3>

      <ul className={styles.list}>
        {builds.map((build) => {
          const isActive = build.id === currentBuildId;
          const isExpanded = expandedId === build.id;

const loadout = build.loadout ?? {};

const primaryName = getItemNameByKey(
  loadout.primary?.weaponKey ?? loadout.primary
);

const secondaryName = getItemNameByKey(
  loadout.secondary?.weaponKey ?? loadout.secondary
);

const overkillName = getItemNameByKey(
  loadout.overkill?.weaponKey ?? loadout.overkill
);

const armorName = getItemNameByKey(
  loadout.armor?.key ?? loadout.armor
);

const plateText = formatPlates(
  loadout.armor?.plates
);

let armorFull = null;

if (armorName && plateText) {
  armorFull = `${armorName} (${plateText})`;
} else if (armorName) {
  armorFull = armorName;
}

const throwableName = getItemNameByKey(
  loadout.throwable?.weaponKey ?? loadout.throwable
);

const deployableName = getItemNameByKey(
  loadout.deployable?.key ?? loadout.deployable
);

const toolName = getItemNameByKey(
  loadout.tool?.key ?? loadout.tool
);

const previewParts = [
  primaryName,
  secondaryName,
  overkillName,
  armorFull,
  throwableName,
  deployableName,
  toolName,
].filter(Boolean);
          return (
            <li
              key={build.id}
              className={`${styles.item} ${
                isActive ? styles.active : ""
              }`}
            >
              <div
                className={styles.row}
                onClick={() =>
                  setExpandedId(isExpanded ? null : build.id)
                }
              >
                <div className={styles.left}>
                  <SlotBadge slot={build.slot} />
                  <div className={styles.meta}>
                    <div className={styles.name}>
                      {build.name || "Unnamed build"}
                    </div>

                    {previewParts.length > 0 && (
                      <div className={styles.preview}>
                        {previewParts.join(" • ")}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.right}>
                  {isActive ? (
                    <span className={styles.activeLabel}>
                      ACTIVE
                    </span>
                  ) : (
                    <button
                      className={styles.activateBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadBuild(build);
                      }}
                    >
                      Set Active
                    </button>
                  )}

                  <span className={styles.chevron}>
                    {isExpanded ?
                    <FaChevronUp />
                    :
                    <FaChevronDown />
                    }
                  </span>
                </div>
              </div>

              {isExpanded && (
                <div className={styles.controls}>
                  <SlotSelect
                    slot={build.slot}
                    onChange={(slot) =>
                      onAssignSlot(build.id, slot)
                    }
                  />

                  <button
                    className={styles.deleteBtn}
                    onClick={() =>
                      onDeleteBuild(build.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
