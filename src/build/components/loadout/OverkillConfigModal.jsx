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
      width="780px"
    >
      <div className={styles.wrapper}>
        {groups.map((group) => {
          const activeKey = effectiveConfig?.[group.slotKey] ?? null;
          const isAmmo = group.optionType === "ammo";

          return (
            <div key={group.slotKey} className={styles.group}>
              <div className={styles.groupTitle}>{group.slotLabel}</div>

              <div className={styles.options}>
                {!isAmmo && (
                  <button
                    type="button"
                    className={`${styles.option} ${styles.emptyOption} ${
                      !activeKey ? styles.active : ""
                    }`}
                    onClick={() => setOption(group.slotKey, null)}
                  >
                    <span className={styles.optionName}>
                      {t("select.option.none")}
                    </span>
                  </button>
                )}

                {group.options.map((option) => {
                  const active = activeKey === option.key;

                  return (
                    <button
                      type="button"
                      key={option.key}
                      className={`${styles.option} ${active ? styles.active : ""}`}
                      onClick={() => setOption(group.slotKey, option.key)}
                    >
                      <span className={styles.optionName}>{option.name}</span>
                      <span className={styles.optionDescription}>
                        {option.description}
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
