import perksData from "../../../data/payday3_perks.json";
import { getOverkillConfigGroups } from "../../../build/utils/perks.utils";
import styles from "./OverkillStatsSection.module.scss";

function toRoman(num) {
  const map = {
    1: "I",
    2: "II",
    3: "III",
    4: "IV",
    5: "V",
  };
  return map[num] ?? num;
}

export default function OverkillStatsSection({ weapon }) {
  if (!weapon) return null;

  const groups = getOverkillConfigGroups(perksData, weapon.key);
  const baseEffect = weapon.base_effect?.trim() || weapon.description?.trim();

  if (groups.length > 0) {
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
                      {option.description}
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

  // Defensive fallback for data that has not yet been migrated to the perk model.
  const hasAbilities = Array.isArray(weapon?.abilities);
  const baseAbility = hasAbilities
    ? weapon.abilities.find((ability) => ability.tier === 0)
    : null;
  const tierAbilities = hasAbilities
    ? weapon.abilities.filter((ability) => ability.tier > 0)
    : [];

  return (
    <div className={styles.wrapper}>
      {baseAbility && (
        <div className={styles.baseBlock}>
          <div className={styles.baseTitle}>OVERSKILL</div>
          <div className={styles.baseDescription}>{weapon.description}</div>
        </div>
      )}

      {tierAbilities.length > 0 && (
        <div className={styles.tiers}>
          {tierAbilities.map((ability) => (
            <div key={ability.tier} className={styles.tierCard}>
              <div className={styles.tierHeader}>
                <span className={styles.tierLabel}>
                  Tier {toRoman(ability.tier)}
                </span>

                {ability.exp > 0 && (
                  <span className={styles.exp}>
                    {ability.exp.toLocaleString()} EXP
                  </span>
                )}
              </div>

              <div className={styles.tierName}>{ability.name}</div>
              <div className={styles.tierDescription}>{ability.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
