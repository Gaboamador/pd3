import Modal from "../common/Modal";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useToast } from "../../../context/ToastContext";
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
  const navigate = useNavigate();
  const [authRequired, setAuthRequired] = useState(false);
  const { showToast } = useToast();
  const [checkingPreset, setCheckingPreset] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [existingPreset, setExistingPreset] = useState(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

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

  async function performSavePreset() {
    if (!uid || isGamePresetWeapon) return;

    try {
      setPresetLoading(true);

      const saved = await WeaponPresetService.save(
        uid,
        weaponDef.key,
        modsState ?? {}
      );

      setExistingPreset(saved);

      // ✅ Toast SOLO si guardó realmente
      showToast({
        type: "success",
        message: "Personal preset saved",
      });
    } catch (err) {
      console.error("Error saving weapon preset:", err);
      showToast({
        type: "error",
        message: "Failed to save personal preset",
      });
    } finally {
      setPresetLoading(false);
    }
  }

  async function handleSavePreset() {
    // if (!uid || isGamePresetWeapon) return;
    if (isGamePresetWeapon) return;

    if (!uid) {
      setAuthRequired(true);
      return;
    }

    // Si ya existe → pedir confirm con modal (no guardar aún)
    if (existingPreset) {
      setConfirmReplaceOpen(true);
      return;
    }

    // No existe → guardar directo
    await performSavePreset();
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
        <>

          {authRequired && (
            <div className={styles.authPrompt}>
              <span>Log in to save personal weapon presets</span>
              <button
                className={styles.authLoginBtn}
                onClick={() => navigate("/auth")}
              >
                LOG IN
              </button>
            </div>
          )}

          <div className={`${styles.personalPresetActions} ${(checkingPreset || presetLoading) ? styles.checkingPresetSpinner : ""}`}>
            {checkingPreset ? (
              <Spinner size="sm" label="Checking presets…" />
            ) : presetLoading ? (
              <Spinner size="sm" label="Saving preset…" />
            ) : (
              <>
                <div className={styles.presetTitle}>
                  <span>PERSONAL PRESET</span>
                </div>

                <div className={styles.presetBtnWrapper}>
                  <button
                    className={styles.presetBtn}
                    onClick={handleLoadPreset}
                    disabled={!hasPersonalPreset}
                  >
                    LOAD
                  </button>

                  <button
                    className={styles.presetBtn}
                    onClick={handleSavePreset}
                  >
                    SAVE
                  </button>
                </div>
              </>
            )}
          </div>
        </>
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

        {/* MODAL QUE PREGUNTA SI SE QUIERE REEMPLAZAR PERSONAL PRESET O NO */}
        <Modal
          open={confirmReplaceOpen}
          onClose={() => setConfirmReplaceOpen(false)}
          title="Replace personal preset?"
          width="520px"
        >
          <div className={styles.confirmBody}>
            A personal preset already exists for this weapon. Replacing it will overwrite your current preset.
          </div>

          <div className={styles.confirmActions}>
            <button
              className={styles.confirmSecondary}
              onClick={() => setConfirmReplaceOpen(false)}
              disabled={presetLoading}
            >
              CANCEL
            </button>

            <button
              className={styles.confirmPrimary}
              onClick={async () => {
                setConfirmReplaceOpen(false);
                await performSavePreset();
              }}
              disabled={presetLoading}
            >
              REPLACE
            </button>
          </div>
        </Modal>

    </Modal>
  );
}
