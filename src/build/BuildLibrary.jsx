import { useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./BuildLibrary.module.scss";
import { buildPreviewParts } from "../utils/buildPreview";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

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
  const { t } = useTranslation();
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
      <option value="">{t('build.slot.unassigned')}</option>

      <optgroup label={t('build.slot.main')}>
        {Array.from({ length: 10 }).map((_, i) => (
          <option key={i} value={i}>
            {t('build.slot.loadout')} {i}
          </option>
        ))}
      </optgroup>

      <optgroup label={t('build.slot.alternative')}>
        {Array.from({ length: 20 }).map((_, i) => (
          <option key={i + 10} value={i + 10}>
            {t('build.slot.altLoadout')} {i + 10}
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
  const { t } = useTranslation();
  const [expandedId, setExpandedId] = useState(null);

  if (!builds.length) {
    return <div className={styles.empty}>{t('build.library.msg.no-saved')}</div>;
  }

  return (
    <div className={styles.library}>
      <h3 className={styles.title}>{t('build.library.title.saved')}</h3>

      <ul className={styles.list}>
        {builds.map((build) => {
          const isActive = build.id === currentBuildId;
          const isExpanded = expandedId === build.id;
          const previewParts = buildPreviewParts(build);
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
                      {build.name || t('build.library.label.fallbackName')}
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
                      {t('build.library.label.active')}
                    </span>
                  ) : (
                    <button
                      className={styles.activateBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        onLoadBuild(build);
                      }}
                    >
                      {t('build.library.actions.set-active')}
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
                    {t('build.library.actions.delete-build')}
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
