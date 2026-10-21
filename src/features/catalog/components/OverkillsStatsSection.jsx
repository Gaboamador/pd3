import perksData from "../../../data/perksData.js";
import { getOverkillConfigGroups } from "../../../build/utils/perks.utils";
import styles from "./OverkillStatsSection.module.scss";
import PerkDescriptionText from "../../../components/PerkDescriptionText.jsx";

export default function OverkillStatsSection({ weapon }) {
  if (!weapon) return null;

  const groups = getOverkillConfigGroups(perksData, weapon.key);
  const baseEffect = weapon.base_effect?.trim();

  return (
      <div className={styles.wrapper}>
        {baseEffect && (
          <div className={styles.baseBlock}>
            <div className={styles.baseTitle}>BASE EFFECT</div>
            <div className={styles.baseDescription}>{baseEffect}</div>
          </div>
        )}

        <div className={styles.configGroups}>
          {groups.map((group) => (
            <div key={group.slotKey} className={styles.configGroup}>
              <div className={styles.configTitle}>{group.slotLabel}</div>

              <div className={styles.configOptions}>
                {group.options.map((option) => (
                  <div key={option.key} className={styles.tierCard}>
                    <div className={styles.tierName}>{option.name}</div>
                    <div className={styles.tierDescription}>
                      <PerkDescriptionText description={option.description} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
}
