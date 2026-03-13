import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import WeaponSprite from "./WeaponSprite";
import WeaponModsModal from "./WeaponModsModal";
import { WEAPON_PLACEHOLDERS } from "../../utils/sprites/placeholders";
import WeaponModSlotsRow from "./WeaponModSlotsRow";
import useIsMobile from "../../../hooks/useIsMobile";
import styles from "./WeaponCard.module.scss";

export default function WeaponCard({
  slot,
  weaponDef,
  modsState,
  onChangeMods,
  onClick,
  onBeforeEdit,
  forceOpenMods,
  onModsOpened,
  showWeaponMods = false,
  mode,
  spriteOverlay,
  isSpinning = false,
  spinningLabel = "randomizer.label.randomizing",
  use,
}) {
  const { t } = useTranslation();
  const [openMods, setOpenMods] = useState(false);

  const isItemPicker = mode === "item-picker";
const isLoadoutEditor = !isItemPicker; // default

  // 🔒 derivaciones SEGURAS
  const spritePos = weaponDef
    ? weaponDef.sprite_pos
    : WEAPON_PLACEHOLDERS[slot];

  const name = weaponDef ? weaponDef.name : use === "randomizer" ? t('randomizer.label.randomize-weapon'): t('modal.actions.select-weapon');

  const canEdit = Boolean(weaponDef && (onBeforeEdit || onChangeMods));

  useEffect(() => {
    if (forceOpenMods && weaponDef) {
      setOpenMods(true);
      onModsOpened?.();
    }
  }, [forceOpenMods, weaponDef, onModsOpened]);

  function handleEditClick() {
  if (!weaponDef) return;
  onBeforeEdit?.(weaponDef);
  setOpenMods(true);
}

const isMobile = useIsMobile();

const spriteHeight = isMobile ? 80 : 110;


return (
  <>
    <div className={`${styles.card} ${isSpinning ? styles.spinning : ""}`} onClick={onClick}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span>//</span>
          <span className={styles.category}>
            {isItemPicker ? name : `${slot.toUpperCase()} ${t('build.loadout.weapon')}`}
          </span>
        </div>
        <button
          className={`${styles.modsBtn} ${!canEdit ? styles.hidden : ""}`}
          onClick={e => {
            e.stopPropagation();
            if (!canEdit) return;
            handleEditClick();
          }}
          aria-label={t('aria-label.weapon-mods-edit')}
          tabIndex={canEdit ? 0 : -1}
        >
          ⚙
        </button>
      </div>

      {/* BODY */}
      <div className={`${styles.body} ${isItemPicker ? styles.itemPicker : ""} ${styles.spriteWrapper}`}>

        {!isSpinning && (
          <WeaponSprite spritePos={spritePos} height={spriteHeight} />
        )}
        
        {spriteOverlay && (
          <div className={styles.spriteOverlay}>
            {spriteOverlay}
          </div>
        )}

        {isSpinning && <div className={styles.reelMask} />}
      </div>
      <div>
        {weaponDef && showWeaponMods && (
          <WeaponModSlotsRow
            weaponDef={weaponDef}
            modsState={modsState}
            height={spriteHeight/5}
          />
        )}
      </div>

      {/* FOOTER */}
      {isLoadoutEditor && (
      <div className={styles.footer}>
        <div className={styles.name}>
          {isSpinning ? t(spinningLabel) : name}
        </div>
      </div>
      )}

    </div>

    {weaponDef && onChangeMods && (
      <WeaponModsModal
        open={openMods}
        onClose={() => setOpenMods(false)}
        weaponDef={weaponDef}
        modsState={modsState}
        onChangeMods={onChangeMods}
      />
    )}
  </>
);
}
