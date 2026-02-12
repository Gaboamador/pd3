import { useEffect, useState } from "react";
import styles from "./BuildLibrary.module.scss";
import { IoIosRadioButtonOff, IoIosCheckmarkCircle } from "react-icons/io";



function SlotBadge({ slot }) {
  if (slot == null) {
    return <span className={styles.slotEmpty}>—</span>;
  }

  return (
    <span className={styles.slotBadge}>
      {slot <= 9 ? `Loadout ${slot}` : `Alt ${slot}`}
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

      <optgroup label="Titulares (0–9)">
        {Array.from({ length: 10 }).map((_, i) => (
          <option key={i} value={i}>
            Loadout {i}
          </option>
        ))}
      </optgroup>

      <optgroup label="Suplentes (10+)">
        {Array.from({ length: 20 }).map((_, i) => (
          <option key={i + 10} value={i + 10}>
            Alt {i + 10}
          </option>
        ))}
      </optgroup>
    </select>
  );
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

          return (
            <li
              key={build.id}
              className={`${styles.item} ${
                isActive ? styles.active : ""
              }`}
            >
              <div className={styles.header}>
                <div
                  className={styles.headerMain}
                  onClick={() =>
                    setExpandedId(
                      isExpanded ? null : build.id
                    )
                  }
                >
                  <div className={styles.headerLeft}>
                    <strong className={styles.name}>
                      {build.name || "Unnamed build"}
                    </strong>
                  </div>

                  <div className={styles.headerRight}>
                    <SlotBadge slot={build.slot} />
                    <span className={styles.chevron}>
                      {isExpanded ? "▾" : "▸"}
                    </span>
                  </div>
                </div>

                {/* BOTÓN ACTIVO DIRECTO */}
                {!isActive ? (
                  <button
                    className={styles.activateBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      onLoadBuild(build);
                    }}
                  >
                    {/* Set Active */}
                    <IoIosRadioButtonOff />
                  </button>
                ) : (
                    <IoIosCheckmarkCircle/>
                )}
              </div>

              {/* CONTROLES (ON DEMAND) */}
              {isExpanded && (
                <div className={styles.controls}>
                  <SlotSelect
                    slot={build.slot}
                    onChange={(slot) =>
                      onAssignSlot(build.id, slot)
                    }
                  />
                  <button
                    className="danger"
                    onClick={() =>
                      onDeleteBuild(build.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              )}

              {isActive && (
                <div className={styles.activeHint}>
                  Active
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
