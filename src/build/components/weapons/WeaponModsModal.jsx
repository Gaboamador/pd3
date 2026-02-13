import Modal from "../common/Modal";
import { useState, useEffect } from "react";
import { useAuth } from "../../../auth/useAuth";
import Spinner from "../../../components/Spinner";
import { WeaponPresetService } from "../../../services/weaponPresetService";
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
  
  // estados
  const { uid } = useAuth();

  const [checkingPreset, setCheckingPreset] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [existingPreset, setExistingPreset] = useState(null);

  if (!weaponDef) {
  return (
    <div className={styles.emptyCard} onClick={onClick}>
      Select weapon
    </div>
  );
}

  const modSlots = getWeaponModSlots(weaponDef);

  // useEffect para verificar preset
  useEffect(() => {
    if (!open || !weaponDef || !uid) return;

    let mounted = true;

    async function checkPreset() {
      try {
        setCheckingPreset(true);
        const preset = await WeaponPresetService.get(uid, weaponDef.key);
        if (mounted) {
          setExistingPreset(preset);
        }
      } catch (err) {
        console.error("Error checking weapon preset:", err);
      } finally {
        if (mounted) {
          setCheckingPreset(false);
        }
      }
    }

    checkPreset();

    return () => {
      mounted = false;
    };
  }, [open, weaponDef, uid]);

  // helpers y flags
  const isPreset = weaponDef?.preset === 1;
  const isGamePresetWeapon = weaponDef?.preset === 1;
  const hasPersonalPreset = Boolean(existingPreset);

  // funciones
  function setMod(slot, opt) {
    const nextValue = opt?.isDefault ? null : opt?.id ?? null;
    onChangeMods({
      ...modsState,
      [slot]: nextValue,
    });
  }

  async function handleLoadPreset() {
    if (!existingPreset || isGamePresetWeapon) return;

    setPresetLoading(true);

    try {
      onChangeMods(existingPreset.mods ?? {});
    } finally {
      setPresetLoading(false);
    }
  }

  async function handleSavePreset() {
    if (!uid || isGamePresetWeapon) return;

    try {
      setPresetLoading(true);

      if (existingPreset) {
        const confirmReplace = window.confirm(
          "A personal preset already exists for this weapon.\n\nReplace it?"
        );
        if (!confirmReplace) {
          setPresetLoading(false);
          return;
        }
      }

      const saved = await WeaponPresetService.save(
        uid,
        weaponDef.key,
        modsState ?? {}
      );

      setExistingPreset(saved);
    } catch (err) {
      console.error("Error saving weapon preset:", err);
    } finally {
      setPresetLoading(false);
    }
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

      {!isGamePresetWeapon && (
        <div className={`${styles.personalPresetActions} ${checkingPreset ? styles.checkingPresetSpinner : ''}`}>
          {checkingPreset ? (
            <Spinner label="Checking presets…"/>
          ) : (
            <>
            <div className={styles.presetTitle}>
              <span>PERSONAL PRESET</span>
            </div>
            <div className={styles.presetBtnWrapper}>
              <button
                className={styles.presetBtn}
                onClick={handleLoadPreset}
                disabled={!hasPersonalPreset || presetLoading}
              >
                LOAD
              </button>

              <button
                className={styles.presetBtn}
                onClick={handleSavePreset}
                disabled={presetLoading}
              >
                SAVE
              </button>
            </div>
            </>
          )}
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
