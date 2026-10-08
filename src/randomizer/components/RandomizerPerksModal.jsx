import Modal from "../../build/components/common/Modal";
import {
  getEffectiveOverkillConfig,
  getOverkillConfigGroups,
  getPerkByKey,
} from "../../build/utils/perks.utils";
import styles from "./RandomizerPerksModal.module.scss";

export default function RandomizerPerksModal({
  open,
  onClose,
  slot,
  weaponDef,
  perkKey,
  config,
  perksData,
}) {
  if (!open || !weaponDef) return null;

  const selected = slot === "overkill"
    ? (() => {
        const effectiveConfig = getEffectiveOverkillConfig(config, perksData, weaponDef.key);
        return getOverkillConfigGroups(perksData, weaponDef.key)
          .map((group) => ({
            slotKey: group.slotKey,
            slotLabel: group.slotLabel,
            perk: group.options.find((option) => option.key === effectiveConfig[group.slotKey]),
          }))
          .filter((entry) => entry.perk);
      })()
    : [{ slotKey: slot, slotLabel: null, perk: getPerkByKey(perksData, perkKey) }]
        .filter((entry) => entry.perk);

  return (
    <Modal open={open} onClose={onClose} title={`PERK DETAILS – ${weaponDef.name}`} width="480px">
      <div className={styles.list}>
        {selected.map(({ slotKey, slotLabel, perk }) => (
          <section className={styles.perk} key={slotKey}>
            {slotLabel && <div className={styles.slot}>{slotLabel}</div>}
            <div className={styles.name}>{perk.name}</div>
            {perk.description && <div className={styles.description}>{perk.description}</div>}
          </section>
        ))}
      </div>
    </Modal>
  );
}
