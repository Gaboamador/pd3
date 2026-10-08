import { useTranslation } from "react-i18next";
import Modal from "../common/Modal";
import {
  getEffectiveOverkillConfig,
  getOverkillConfigGroups,
} from "../../utils/perks.utils";
import styles from "./OverkillConfigModal.module.scss";

export default function OverkillConfigModal({
  open,
  onClose,
  weaponDef,
  config,
  perksData,
  onChange,
}) {
  const { t } = useTranslation();

  if (!weaponDef) return null;

  const groups = getOverkillConfigGroups(perksData, weaponDef.key);
  const effectiveConfig = getEffectiveOverkillConfig(
    config,
    perksData,
    weaponDef.key
  );

  function setOption(slotKey, optionKey) {
    onChange?.({
      ...effectiveConfig,
      [slotKey]: optionKey,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`${t("build.loadout.edit-overkill")} – ${weaponDef.name}`}
      width="680px"
    >
      <div className={styles.wrapper}>
        {groups.map((group) => {
          const activeKey = effectiveConfig?.[group.slotKey] ?? null;
          const isAmmo = group.optionType === "ammo";

          return (
            <div key={group.slotKey} className={styles.group}>
              
              <div className={styles.groupHeader}>
                <div className={styles.groupTitle}>{group.slotLabel}</div>

                {!isAmmo && activeKey && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setOption(group.slotKey, null)}
                    aria-label={`Clear ${group.slotLabel}`}
                    title={`Clear ${group.slotLabel}`}
                  >
                    <span aria-hidden="true">×</span>
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className={styles.options}>
                {group.options.map((option) => {
                  const active = activeKey === option.key;

                  return (
                    <button
                      type="button"
                      key={option.key}
                      className={`${styles.option} ${
                        active ? styles.active : ""
                      }`}
                      onClick={() => setOption(group.slotKey, option.key)}
                      aria-pressed={active}
                    >
                      <span className={styles.optionMarker} />

                      <span className={styles.optionContent}>
                        <span className={styles.optionName}>
                          {option.name}
                        </span>

                        {option.description && (
                          <span className={styles.optionDescription}>
                            {option.description}
                          </span>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
