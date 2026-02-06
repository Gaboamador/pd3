import Modal from "../common/Modal";
import { getWeaponModSlots } from "../../utils/loadout.utils";
import styles from "./WeaponModsModal.module.scss";

export default function WeaponModsModal({
  open,
  onClose,
  weaponDef,
  modsState,
  onChangeMods,
}) {
  // if (!weaponDef) return null;
  if (!weaponDef) {
  return (
    <div className={styles.emptyCard} onClick={onClick}>
      Select weapon
    </div>
  );
}


  const modSlots = getWeaponModSlots(weaponDef);

  function setMod(slot, id) {
    onChangeMods({
      ...modsState,
      [slot]: id,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit mods – ${weaponDef.name}`}
      width="720px"
    >
      {!modSlots.length && (
        <div className={styles.empty}>No mods available</div>
      )}

      <div className={styles.slots}>
        {modSlots.map(ms => {
          const activeId = modsState?.[ms.slot] ?? null;

          return (
            <div key={ms.slot} className={styles.slotBlock}>
              <div className={styles.slotTitle}>{ms.slot}</div>

              <div className={styles.optionsGrid}>
                {/* Default */}
                <div
                  className={`${styles.option} ${
                    activeId == null ? styles.active : ""
                  }`}
                  onClick={() => setMod(ms.slot, null)}
                >
                  Default
                </div>

                {ms.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`${styles.option} ${
                      activeId === opt.id ? styles.active : ""
                    }`}
                    onClick={() => setMod(ms.slot, opt.id)}
                  >
                    {opt.name}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
