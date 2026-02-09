import { useState, useEffect } from "react";
import WeaponSprite from "./WeaponSprite";
import WeaponModsModal from "./WeaponModsModal";
import { WEAPON_PLACEHOLDERS } from "../../utils/sprites/placeholders";
import WeaponModSlotsRow from "./WeaponModSlotsRow";
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
}) {
  const [openMods, setOpenMods] = useState(false);

  // 🔒 derivaciones SEGURAS
  const spritePos = weaponDef
    ? weaponDef.sprite_pos
    : WEAPON_PLACEHOLDERS[slot];

  const name = weaponDef ? weaponDef.name : "Select weapon";

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

  function useIsMobile(breakpoint = 560) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" && window.innerWidth <= breakpoint
  );

  useEffect(() => {
    const onResize = () =>
      setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [breakpoint]);

  return isMobile;
}
const isMobile = useIsMobile();

const spriteHeight = isMobile ? 80 : 110;


return (
  <>
    <div className={styles.card} onClick={onClick}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <span>//</span>
          <span className={styles.category}>{slot.toUpperCase()} WEAPON</span>
        </div>
        <button
          className={`${styles.modsBtn} ${!canEdit ? styles.hidden : ""}`}
          onClick={e => {
            e.stopPropagation();
            if (!canEdit) return;
            handleEditClick();
          }}
          aria-label="Edit mods"
          tabIndex={canEdit ? 0 : -1}
        >
          ⚙
        </button>
      </div>

      {/* BODY */}
      <div className={styles.body}>
        <WeaponSprite spritePos={spritePos} height={spriteHeight} />
      </div>
      <div>
        {weaponDef && (
          <WeaponModSlotsRow
            weaponDef={weaponDef}
            modsState={modsState}
            height={spriteHeight/5}
          />
        )}
      </div>

      {/* FOOTER */}
      <div className={styles.footer}>
        <div className={styles.name}>{name}</div>
      </div>
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
