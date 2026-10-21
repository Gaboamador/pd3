import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../auth/useAuth";
import { useToast } from "../../../context/ToastContext";
import Modal from "../common/Modal";
import Spinner from "../../../components/Spinner";
import { WeaponPresetService } from "../../../services/weaponPresetService";
import {
  getEffectiveOverkillConfig,
  getOverkillConfigGroups,
} from "../../utils/perks.utils";
import styles from "./OverkillConfigModal.module.scss";
import PerkDescriptionText from "../../../components/PerkDescriptionText.jsx";

// El servicio de presets guarda la configuración en el campo `mods`, igual que
// para Primary/Secondary. Cada slot de OVERKILL contiene la key de una opción.
// Al cargar (o guardar) descartamos opciones de otro arma/slot y restauramos
// los valores por defecto, sin permitir que un preset antiguo invalide la build.
function normalizeOverkillPreset(groups, savedConfig) {
  const source = savedConfig && typeof savedConfig === "object" && !Array.isArray(savedConfig)
    ? savedConfig
    : {};

  return Object.fromEntries(groups.map((group) => {
    const selectedKey = source[group.slotKey];
    const isValid = group.options.some((option) => option.key === selectedKey);
    const defaultKey = group.options.find((option) => option.isDefault)?.key ?? null;

    return [
      group.slotKey,
      isValid ? selectedKey : defaultKey,
    ];
  }));
}

export default function OverkillConfigModal({
  open,
  onClose,
  weaponDef,
  config,
  perksData,
  onChange,
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

  const weaponKey = weaponDef?.key;
  const groups = getOverkillConfigGroups(perksData, weaponKey);
  const effectiveConfig = getEffectiveOverkillConfig(config, perksData, weaponKey);

  useEffect(() => {
    if (!open || !weaponKey || !uid) return;

    let mounted = true;

    async function checkPreset() {
      try {
        setCheckingPreset(true);
        setExistingPreset(null);
        const preset = await WeaponPresetService.get(uid, weaponKey);
        if (mounted) {
          // Vincular el resultado al usuario y al arma evita usar el preset
          // anterior si la selección cambia mientras se consulta Firestore.
          setExistingPreset({ uid, weaponKey, data: preset });
        }
      } catch (err) {
        console.error("Error checking OVERKILL preset:", err);
      } finally {
        if (mounted) setCheckingPreset(false);
      }
    }

    checkPreset();

    return () => {
      mounted = false;
    };
  }, [open, weaponKey, uid]);

  if (!weaponDef) return null;

  const currentPreset = existingPreset?.uid === uid && existingPreset?.weaponKey === weaponKey
    ? existingPreset.data
    : null;
  const hasPersonalPreset = Boolean(currentPreset);

  function handleClose() {
    setAuthRequired(false);
    setConfirmReplaceOpen(false);
    onClose?.();
  }

  function setOption(slotKey, optionKey) {
    onChange?.({
      ...effectiveConfig,
      [slotKey]: optionKey,
    });
  }

  function handleLoadPreset() {
    if (!hasPersonalPreset || !onChange || presetLoading || checkingPreset) return;
    onChange(normalizeOverkillPreset(groups, currentPreset.mods));
  }

  async function performSavePreset() {
    if (!uid || !weaponKey || presetLoading) return;

    try {
      setPresetLoading(true);
      const presetConfig = normalizeOverkillPreset(groups, effectiveConfig);
      const saved = await WeaponPresetService.save(uid, weaponKey, presetConfig);
      setExistingPreset({ uid, weaponKey, data: saved });
      showToast({
        type: "success",
        message: t("toast.msg.preset.saved"),
      });
    } catch (err) {
      console.error("Error saving OVERKILL preset:", err);
      showToast({
        type: "error",
        message: t("toast.msg.preset.failed-to-save"),
      });
    } finally {
      setPresetLoading(false);
    }
  }

  async function handleSavePreset() {
    if (presetLoading || checkingPreset) return;

    if (!uid) {
      setAuthRequired(true);
      return;
    }

    if (hasPersonalPreset) {
      setConfirmReplaceOpen(true);
      return;
    }

    await performSavePreset();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`${t("build.loadout.edit-overkill")} – ${weaponDef.name}`}
      width="680px"
    >
      {authRequired && (
        <div className={styles.authPrompt}>
          <span>{t("auth.msg.login-required.presets")}</span>
          <button
            type="button"
            className={styles.authLoginBtn}
            onClick={() => navigate("/auth")}
          >
            {t("auth.actions.login")}
          </button>
        </div>
      )}

      <div className={`${styles.personalPresetActions} ${
        checkingPreset || presetLoading ? styles.checkingPresetSpinner : ""
      }`}>
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
                type="button"
                className={styles.presetBtn}
                onClick={handleLoadPreset}
                disabled={!hasPersonalPreset}
              >
                {t("build.actions.load")}
              </button>
              <button
                type="button"
                className={styles.presetBtn}
                onClick={handleSavePreset}
              >
                {t("build.actions.save")}
              </button>
            </div>
          </>
        )}
      </div>

      <div className={styles.wrapper}>
        {groups.map((group) => {
          const activeKey = effectiveConfig?.[group.slotKey] ?? null;
          const isAmmo = group.optionType === "ammo";

          return (
            <div key={group.slotKey} className={styles.group}>
              <div className={styles.groupHeader}>
                <div className={styles.groupTitle}>{group.slotLabel}</div>

                {!isAmmo && activeKey && (
                  <button
                    type="button"
                    className={styles.clearButton}
                    onClick={() => setOption(group.slotKey, null)}
                    aria-label={`Clear ${group.slotLabel}`}
                    title={`Clear ${group.slotLabel}`}
                  >
                    <span aria-hidden="true">×</span>
                    <span>Clear</span>
                  </button>
                )}
              </div>

              <div className={styles.options}>
                {group.options.map((option) => {
                  const active = activeKey === option.key;

                  return (
                    <button
                      type="button"
                      key={option.key}
                      className={`${styles.option} ${
                        active ? styles.active : ""
                      }`}
                      onClick={() => setOption(group.slotKey, option.key)}
                      aria-pressed={active}
                    >
                      <span className={styles.optionMarker} />

                      <span className={styles.optionContent}>
                        <span className={styles.optionName}>
                          {option.name}
                        </span>

                        {option.description && (
                          <span className={styles.optionDescription}>
                            <PerkDescriptionText description={option.description} />
                          </span>
                        )}
                      </span>
                    </button>
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
            type="button"
            className={styles.confirmSecondary}
            onClick={() => setConfirmReplaceOpen(false)}
            disabled={presetLoading}
          >
            {t("modal.actions.cancel")}
          </button>
          <button
            type="button"
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
