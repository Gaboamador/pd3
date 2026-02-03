import styles from "./BuildLibrary.module.scss";

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

/**
 * Selector de slot
 */
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
  if (!builds.length) {
    return <div>No saved builds</div>;
  }

 return (
    <div className={styles.library}>
      <h3 className={styles.title}>Saved Builds</h3>

      <ul className={styles.list}>
        {builds.map((build) => {
          const isActive = build.id === currentBuildId;

          return (
            <li
              key={build.id}
              className={`${styles.item} ${
                isActive ? styles.active : ""
              }`}
            >
              {/* Header */}
              <div className={styles.header}>
                <strong className={styles.name}>
                  {build.name || "Unnamed build"}
                </strong>

                <SlotBadge slot={build.slot} />
              </div>

              {/* Controls */}
              <div className={styles.controls}>
                <SlotSelect
                  slot={build.slot}
                  onChange={(slot) =>
                    onAssignSlot(build.id, slot)
                  }
                />

                <button
                  className={styles.btn}
                  onClick={() => onLoadBuild(build)}
                >
                  Load
                </button>

                <button
                  className={styles.btnDanger}
                  onClick={() => onDeleteBuild(build.id)}
                >
                  Delete
                </button>
              </div>

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