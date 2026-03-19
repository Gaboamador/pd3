import { useTranslation } from "react-i18next";
import styles from "./LoadoutItemCard.module.scss";
import { LOADOUT_PLACEHOLDERS } from "../../utils/sprites/placeholders";
import useIsMobile from "../../../hooks/useIsMobile";
import { BREAKPOINTS } from "../../../constants/breakpoints";

export default function LoadoutItemCard({
  slot,
  itemDef,
  SpriteComponent,
  onClick,
  onEdit,
  headerExtra,
  mode,
  spriteOverlay,
  isSpinning = false,
  spinningLabel = "randomizer.label.randomizing",
  use,
  isHeist,
}) {
  const { t } = useTranslation();
  const spritePos = itemDef
    ? itemDef.sprite_pos
    : LOADOUT_PLACEHOLDERS[slot];

  const name = (() => {
    if (itemDef) {
      if (slot === "tree") {
        return `${itemDef.categoryName?.toUpperCase()} | ${itemDef.name}`;
      }
      return itemDef.name ?? itemDef.key;
    }

    if (use === "randomizer") {
      if (slot === "overkill") return t('randomizer.label.overkill');
      if (slot === "heist") return t('randomizer.label.heist');
      if (slot === "tree") return t('randomizer.label.tree');
      return t('randomizer.label.item');
    }

    if (slot === "overkill") return t('build.loadout.label.select-overkill');
    if (slot === "heist") return t('build.loadout.select-heist');

    return t('build.loadout.select-item');
  })();


  const isItemPicker = mode === "item-picker";
  const isLoadoutEditor = !isItemPicker; // default

  const canEdit = Boolean(itemDef && onEdit);

  const isMobile = useIsMobile(BREAKPOINTS.mobile);

  const isMobileSmall = useIsMobile(BREAKPOINTS.mobileSmall);

  const spriteHeight = isMobileSmall ? 70 : isMobile ? 80 : 110;


  return (
  <div className={`${styles.card} ${isSpinning ? styles.spinning : ""} ${isHeist ? styles.heist : ""}`} onClick={onClick}>
  {/* HEADER */}
  <div className={styles.header}>
    <div className={styles.headerTitle}>
      <span>//</span>
      <span className={styles.category}>
        {isItemPicker ? name : `${slot.toUpperCase()} ${slot==="overkill" ? t('build.loadout.weapon') : ""}`}
      </span>
    </div>

    <div className={styles.headerRight}>
      
      {!isSpinning && headerExtra}

      <button
        type="button"
        className={`${styles.editBtn} ${!canEdit ? styles.hidden : ""}`}
        onClick={e => {
          e.stopPropagation();
          if (!canEdit) return;
          onEdit();
        }}
        aria-label={t('aria-label.item-edit')}
        tabIndex={canEdit ? 0 : -1}
      >
        ⚙
      </button>

    </div>
  </div>

  {/* BODY */}
  <div className={`
  ${styles.body}
  ${isItemPicker ? styles.itemPicker : ""}
  ${styles.spriteWrapper}
  ${slot === "heist" ? styles.heist : ""}
  ${slot === "tree" ? styles.tree : ""}`}>

    <div className={styles.spriteContainer}>
      {isSpinning
        ? spriteOverlay
        : <SpriteComponent itemDef={itemDef} spritePos={spritePos} height={spriteHeight} />
      }
    </div>

    {isSpinning && <div className={styles.reelMask} />}

  </div>

  {/* FOOTER */}
    {isLoadoutEditor && (
    <div className={`${styles.footer} ${slot === "tree" && !isMobile ? styles.treeFooter : ""}`}>
      <div className={styles.name}>
        {isSpinning ? t(spinningLabel) : name}
      </div>
    </div>
    )}


</div>

);
}
