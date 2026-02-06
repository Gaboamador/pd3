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
}) {
  const spritePos = itemDef
    ? itemDef.sprite_pos
    : LOADOUT_PLACEHOLDERS[slot];

  const name = itemDef
    ? itemDef.name ?? itemDef.key
    : "Select item";

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
  <div className={styles.card} onClick={onClick}>
  {/* HEADER */}
  <div className={styles.header}>
    <div className={styles.headerTitle}>
      <span>//</span>
      <span className={styles.category}>{slot.toUpperCase()} {slot==="overkill" && 'WEAPON'}</span>
    </div>

    <div className={styles.headerRight}>
      {headerExtra}

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
  <div className={styles.body}>
    <SpriteComponent spritePos={spritePos} height={spriteHeight} />
  </div>

  {/* FOOTER */}
  <div className={styles.footer}>
    <div className={styles.name}>{name}</div>
  </div>
</div>

);

  // return (
  //   <div className={styles.card} onClick={onClick}>
  //     <SpriteComponent spritePos={spritePos} height={48} />

  //     <div className={styles.name}>{name}</div>

  //     {canEdit && (
  //       <button
  //         type="button"
  //         className={styles.editBtn}
  //         onClick={e => {
  //           e.stopPropagation();
  //           onEdit();
  //         }}
  //         aria-label="Edit"
  //       >
  //         ⚙
  //       </button>
  //     )}

  //     {itemDef && extraContent && (
  //       <div className={styles.extra}>
  //         {extraContent}
  //       </div>
  //     )}
  //   </div>
  // );
}
