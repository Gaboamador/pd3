import styles from "./LoadoutItemCard.module.scss";
import { LOADOUT_PLACEHOLDERS } from "../../utils/sprites/placeholders";
import useIsMobile from "../../../hooks/useIsMobile";

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
  spinningLabel = "RANDOMIZING...",
  use,
  isHeist,
}) {
  const spritePos = itemDef
    ? itemDef.sprite_pos
    : LOADOUT_PLACEHOLDERS[slot];

  const name = (() => {
    if (itemDef) {
      return itemDef.name ?? itemDef.key;
    }

    if (use === "randomizer") {
      if (slot === "overkill") return "Randomize overkill weapon";
      if (slot === "heist") return "Randomize heist";
      return "Randomize item";
    }

    if (slot === "overkill") return "Select overkill weapon";
    if (slot === "heist") return "Select heist";

    return "Select item";
  })();


      const isItemPicker = mode === "item-picker";
const isLoadoutEditor = !isItemPicker; // default

  const canEdit = Boolean(itemDef && onEdit);

  const isMobile = useIsMobile();
  
  const spriteHeight = isMobile ? 80 : 110;


  return (
  <div className={`${styles.card} ${isSpinning ? styles.spinning : ""} ${isHeist ? styles.heist : ""}`} onClick={onClick}>
  {/* HEADER */}
  <div className={styles.header}>
    <div className={styles.headerTitle}>
      <span>//</span>
      <span className={styles.category}>
        {isItemPicker ? name : `${slot.toUpperCase()} ${slot==="overkill" ? 'WEAPON' : ""}`}
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
        aria-label="Edit"
        tabIndex={canEdit ? 0 : -1}
      >
        ⚙
      </button>

    </div>
  </div>

  {/* BODY */}
  <div className={`${styles.body} ${isItemPicker ? styles.itemPicker : ""} ${styles.spriteWrapper} ${slot === "heist" ? styles.heist : ""}`}>

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
    <div className={styles.footer}>
      <div className={styles.name}>
        {isSpinning ? spinningLabel : name}
      </div>
    </div>
    )}


</div>

);
}
