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

  const hasAbilities = Array.isArray(weapon?.abilities);

  // separar tier 0 del resto
  const baseAbility = hasAbilities
    ? weapon.abilities.find(a => a.tier === 0)
    : null;

  const tierAbilities = hasAbilities
    ? weapon.abilities.filter(a => a.tier > 0)
    : [];

  return (
    <div className={styles.wrapper}>
      
      {/* ---------- OVERSKILL BASE ---------- */}
      {baseAbility && (
        <div className={styles.baseBlock}>
          <div className={styles.baseTitle}>
            OVERSKILL
          </div>

          <div className={styles.baseDescription}>
            {weapon.description}
          </div>
        </div>
      )}

      {/* ---------- TIERS I–V ---------- */}
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

              <div className={styles.tierName}>
                {ability.name}
              </div>

              <div className={styles.tierDescription}>
                {ability.description}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}