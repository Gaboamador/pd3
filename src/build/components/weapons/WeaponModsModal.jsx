import Modal from "../common/Modal";
import { getWeaponModSlots } from "../../utils/loadout.utils";
import styles from "./WeaponModsModal.module.scss";

const SLOT_LABEL_OVERRIDES = {
  Mag: "Magazine",
};

function formatModSlotName(slot) {
  if (!slot) return "";

    // Si tiene override manual → usarlo
  if (SLOT_LABEL_OVERRIDES[slot]) {
    return SLOT_LABEL_OVERRIDES[slot];
  }

  // 1. separar camelCase
  const withSpaces = slot
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

  // 2. capitalizar cada palabra
  return withSpaces
    .split(" ")
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WeaponModsModal({
  open,
  onClose,
  weaponDef,
  modsState,
  onChangeMods,
}) {
  
  if (!weaponDef) {
  return (
    <div className={styles.emptyCard} onClick={onClick}>
      Select weapon
    </div>
  );
}

  const modSlots = getWeaponModSlots(weaponDef);

  const isPreset = weaponDef?.preset === 1;

  function setMod(slot, opt) {
  const nextValue = opt?.isDefault ? null : opt?.id ?? null;

  onChangeMods({
    ...modsState,
    [slot]: nextValue,
  });
}

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit mods – ${weaponDef.name}`}
      width="720px"
    >
      {isPreset && (
  <div className={styles.presetNotice}>
    This weapon has preset modifications.
  </div>
)}

      {!modSlots.length && (
        <div className={styles.empty}>No mods available</div>
      )}

      <div className={styles.slots}>
        {modSlots.map(ms => {
          const activeId = modsState?.[ms.slot] ?? null;

          return (
            <div key={ms.slot} className={styles.slotBlock}>
              <div className={styles.slotTitle}>{formatModSlotName(ms.slot)}</div>

              <div className={styles.optionsGrid}>
                {ms.options.map(opt => {
                  const isActive = opt.isDefault
                    ? activeId == null
                    : activeId === opt.id;

                  return (
                    <div
                      key={String(opt.id)}
                      className={`${styles.option} ${
                        isActive ? styles.active : ""
                      } ${isPreset ? styles.locked : ""}`}
                      onClick={() => {
                        if (isPreset) return;
                        setMod(ms.slot, opt);
                      }}
                    >
                      {opt.name}
                    </div>
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
