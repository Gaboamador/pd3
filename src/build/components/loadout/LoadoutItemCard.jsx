import { useState, useEffect } from "react";
import styles from "./LoadoutItemCard.module.scss";
import { LOADOUT_PLACEHOLDERS } from "../../utils/sprites/placeholders";

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
}) {
  const spritePos = itemDef
    ? itemDef.sprite_pos
    : LOADOUT_PLACEHOLDERS[slot];

  const name = itemDef
    ? itemDef.name ?? itemDef.key
    : "Select item";

      const isItemPicker = mode === "item-picker";
const isLoadoutEditor = !isItemPicker; // default

  const canEdit = Boolean(itemDef && onEdit);


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
  <div className={`${styles.card} ${isSpinning ? styles.spinning : ""}`} onClick={onClick}>
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

  
      {/* {headerExtra} */}

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
  <div className={`${styles.body} ${isItemPicker ? styles.itemPicker : ""} ${styles.spriteWrapper}`}>
    {/* <SpriteComponent spritePos={spritePos} height={spriteHeight} /> */}

    {/* {SpriteComponent ? (
      <SpriteComponent spritePos={spritePos} height={48} />
    ) : (
      <div className={styles.noSprite}>
        {name}
      </div>
    )} */}

    {!isSpinning && (
      SpriteComponent ? (
        <SpriteComponent spritePos={spritePos} height={spriteHeight} />
      ) : (
        <div className={styles.noSprite}>
          {name}
        </div>
      )
    )}

    {spriteOverlay && (
      <div className={styles.spriteOverlay}>
        {spriteOverlay}
      </div>
    )}

    {isSpinning && <div className={styles.reelMask} />}

  </div>

  {/* FOOTER */}
    {isLoadoutEditor && (
    <div className={styles.footer}>
      {/* <div className={styles.name}>{name}</div> */}
      <div className={styles.name}>
        {isSpinning ? spinningLabel : name}
      </div>
    </div>
    )}


</div>

);
}
