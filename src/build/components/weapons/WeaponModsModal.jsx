import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useToast } from "../../../context/ToastContext";
import Modal from "../common/Modal";
import Spinner from "../../../components/Spinner";
import { WeaponPresetService } from "../../../services/weaponPresetService";
import { getWeaponModSlots } from "../../utils/loadout.utils";
import {
  getEffectiveWeaponPerkKey,
  getPerkByKey,
  getWeaponPerks,
  isIconicWeapon,
} from "../../utils/perks.utils";
import styles from "./WeaponModsModal.module.scss";

const SLOT_LABEL_OVERRIDES = {
  Mag: "Magazine",
};

function formatModSlotName(slot) {
  if (!slot) return "";

  if (SLOT_LABEL_OVERRIDES[slot]) {
    return SLOT_LABEL_OVERRIDES[slot];
  }

  const withSpaces = slot
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/_/g, " ");

  return withSpaces
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function WeaponModsModal({
  open,
  onClose,
  weaponDef,
  modsState,
  onChangeMods,
  perkState,
  onChangePerk,
  perksData,
}) {
  const { t } = useTranslation();
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [authRequired, setAuthRequired] = useState(false);
  const [checkingPreset, setCheckingPreset] = useState(false);
  const [presetLoading, setPresetLoading] = useState(false);
  const [existingPreset, setExistingPreset] = useState(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);

  const isIconic = isIconicWeapon(weaponDef);
  const modSlots = getWeaponModSlots(weaponDef);
  const compatiblePerks = getWeaponPerks(perksData, weaponDef?.type);
  const activePerkKey = getEffectiveWeaponPerkKey(
    { perk: perkState },
    weaponDef
  );
  const activePerk = getPerkByKey(perksData, activePerkKey);

  const selectablePerks = isIconic
    ? activePerk
      ? [activePerk]
      : []
    : compatiblePerks;

  useEffect(() => {
    if (!open || !weaponDef || !uid || isIconic) return;

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
  }, [open, weaponDef, uid, isIconic]);

  if (!weaponDef) return null;

  const hasPersonalPreset = Boolean(existingPreset);

  function setMod(slot, opt) {
    if (!onChangeMods) return;

    const nextValue = opt?.isDefault ? null : opt?.id ?? null;
    onChangeMods({
      ...modsState,
      [slot]: nextValue,
    });
  }

  function setPerk(perkKey) {
    if (isIconic || !onChangePerk) return;
    onChangePerk(perkKey || null);
  }

  async function handleLoadPreset() {
    if (!existingPreset || isIconic || !onChangeMods) return;

    setPresetLoading(true);

    try {
      // Personal presets intentionally contain mods only. The weapon perk belongs
      // to the build and is not changed when loading a mod preset.
      onChangeMods(existingPreset.mods ?? {});
    } finally {
      setPresetLoading(false);
    }
  }

  async function performSavePreset() {
    if (!uid || isIconic) return;

    try {
      setPresetLoading(true);

      // Keep the existing personal-preset contract: mods only.
      const saved = await WeaponPresetService.save(
        uid,
        weaponDef.key,
        modsState ?? {}
      );

      setExistingPreset(saved);

      showToast({
        type: "success",
        message: t("toast.msg.preset.saved"),
      });
    } catch (err) {
      console.error("Error saving weapon preset:", err);
      showToast({
        type: "error",
        message: t("toast.msg.preset.failed-to-save"),
      });
    } finally {
      setPresetLoading(false);
    }
  }

  async function handleSavePreset() {
    if (isIconic) return;

    if (!uid) {
      setAuthRequired(true);
      return;
    }

    if (existingPreset) {
      setConfirmReplaceOpen(true);
      return;
    }

    await performSavePreset();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Edit weapon – ${weaponDef.name}`}
      width="720px"
    >
      {isIconic && (
        <div className={styles.presetNotice}>
          {t("modal.msg.iconic-fixed")}
        </div>
      )}

      <div className={styles.perkSection}>
        <div className={styles.slotTitle}>{t("build.loadout.weapon.perk")}</div>

        <div className={styles.optionsGrid}>
          {!isIconic && (
            <div
              className={`${styles.option} ${!activePerkKey ? styles.active : ""}`}
              onClick={() => setPerk(null)}
            >
              {t("select.option.none")}
            </div>
          )}

          {selectablePerks.map((perk) => (
            <div
              key={perk.key}
              className={`${styles.option} ${
                activePerkKey === perk.key ? styles.active : ""
              } ${isIconic ? styles.locked : ""}`}
              onClick={() => setPerk(perk.key)}
              title={perk.description}
            >
              {perk.name}
            </div>
          ))}
        </div>

        {activePerk?.description && (
          <div className={`${styles.perkDescription} ${activePerk.equipped ? styles.equipped : ""} ${activePerk.persistent ? styles.persistent : ""}`}>
            {activePerk.description}
          </div>
        )}
      </div>

      {!isIconic && (
        <>
          {authRequired && (
            <div className={styles.authPrompt}>
              <span>{t("auth.msg.login-required.presets")}</span>
              <button
                className={styles.authLoginBtn}
                onClick={() => navigate("/auth")}
              >
                {t("auth.actions.login")}
              </button>
            </div>
          )}

          <div
            className={`${styles.personalPresetActions} ${
              checkingPreset || presetLoading
                ? styles.checkingPresetSpinner
                : ""
            }`}
          >
            {checkingPreset ? (
              <Spinner size="sm" label={t("spinner.presets.checking")} />
            ) : presetLoading ? (
              <Spinner size="sm" label={t("spinner.presets.saving")} />
            ) : (
              <>
                <div className={styles.presetTitle}>
                  <span>{t("modal.title.personal-preset")}</span>
                </div>

                <div className={styles.presetBtnWrapper}>
                  <button
                    className={styles.presetBtn}
                    onClick={handleLoadPreset}
                    disabled={!hasPersonalPreset}
                  >
                    {t("build.actions.load")}
                  </button>

                  <button
                    className={styles.presetBtn}
                    onClick={handleSavePreset}
                  >
                    {t("build.actions.save")}
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {!modSlots.length && (
        <div className={styles.empty}>
          {t("build.loadout.msg.no-mods-available")}
        </div>
      )}

      <div className={styles.slots}>
        {modSlots.map((ms) => {
          const activeId = modsState?.[ms.slot] ?? null;

          return (
            <div key={ms.slot} className={styles.slotBlock}>
              <div className={styles.slotTitle}>{formatModSlotName(ms.slot)}</div>

              <div className={styles.optionsGrid}>
                {ms.options.map((opt) => {
                  const isActive = opt.isDefault
                    ? activeId == null
                    : activeId === opt.id;

                  return (
                    <div
                      key={String(opt.id)}
                      className={`${styles.option} ${
                        isActive ? styles.active : ""
                      } ${isIconic ? styles.locked : ""}`}
                      onClick={() => {
                        if (isIconic) return;
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

      <Modal
        open={confirmReplaceOpen}
        onClose={() => setConfirmReplaceOpen(false)}
        title={t("modal.title.replace-preset")}
        width="520px"
      >
        <div className={styles.confirmBody}>
          {t("modal.msg.replace-preset")}
        </div>

        <div className={styles.confirmActions}>
          <button
            className={styles.confirmSecondary}
            onClick={() => setConfirmReplaceOpen(false)}
            disabled={presetLoading}
          >
            {t("modal.actions.cancel")}
          </button>

          <button
            className={styles.confirmPrimary}
            onClick={async () => {
              setConfirmReplaceOpen(false);
              await performSavePreset();
            }}
            disabled={presetLoading}
          >
            {t("modal.actions.replace")}
          </button>
        </div>
      </Modal>
    </Modal>
  );
}
