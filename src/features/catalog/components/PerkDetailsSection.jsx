import loadoutData from "../../../data/payday3_loadout_items.json";
import { formatWeaponTypeLabel } from "../../../utils/searchPresentation.utils";
import styles from "./PerkDetailsSection.module.scss";

function getOverkillName(weaponKey) {
  if (!weaponKey) return null;
  const item = Object.values(loadoutData?.overkill ?? {}).find(
    (entry) => entry?.key === weaponKey
  );
  return item?.name ?? weaponKey;
}

export default function PerkDetailsSection({ perk }) {
  if (!perk) return null;

  const weaponTypes = Array.isArray(perk.weaponTypes)
    ? perk.weaponTypes
    : [];

  return (
    <div className={styles.wrapper}>
      <div className={styles.metaGrid}>
        {perk.scope === "weapon" && (
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Available for</span>
            <span className={styles.metaValue}>
              {weaponTypes.map(formatWeaponTypeLabel).join(", ") || "—"}
            </span>
          </div>
        )}

        {perk.scope === "overkill" && (
          <>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Overkill Weapon</span>
              <span className={styles.metaValue}>
                {getOverkillName(perk.weaponKey)}
              </span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Configuration slot</span>
              <span className={styles.metaValue}>{perk.slotLabel}</span>
            </div>
          </>
        )}
      </div>

      <div className={`${styles.description} ${perk.equipped ? styles.equipped : perk.persistent ? styles.persistent : ""}`}>{perk.description}</div>
    </div>
  );
}
