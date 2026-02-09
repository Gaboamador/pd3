import { useRef } from "react";
import SkillSprite from "./SkillSprite";
import styles from "./SkillCard.module.scss";

export default function SkillCard({
  skill,
  state,
  isLocked,
  isMobile,
  canCycleUp,
  canCycleDown,
  cycleUpDisabledReason,
  cycleDownDisabledReason,
  onCycleUp,
  onCycleDown,
  onSelectForDetails,
  onOpenInfo,
}) {
  /* =========================
     STATE DERIVATION
     ========================= */
  const isAced = !!state?.aced;
  const isBase = !!state?.base && !isAced;

  // placeholder hasta cablear reglas reales
  // const isLocked = false;

  let visualState = "none";
  if (isLocked) visualState = "locked";
  else if (isAced) visualState = "aced";
  else if (isBase) visualState = "base";

  let nextCost = null;
  if (!isLocked && !isAced) {
    if (!isBase) nextCost = skill.req_points?.base ?? null;
    else nextCost = skill.req_points?.aced ?? null;
  }

  /* =========================
     MOBILE: TAP / HOLD
     ========================= */
  const holdTimerRef = useRef(null);
  const holdTriggeredRef = useRef(false);
  const startPosRef = useRef({ x: 0, y: 0 });
  const didMoveRef = useRef(false);

  function handlePointerDown(e) {
    if (!isMobile || e.pointerType !== "touch") return;

    holdTriggeredRef.current = false;
    didMoveRef.current = false;

    startPosRef.current = { x: e.clientX, y: e.clientY };

    holdTimerRef.current = setTimeout(() => {
      if (didMoveRef.current) return;
      if (!canCycleDown) return;
      holdTriggeredRef.current = true;
      onCycleDown?.();
    }, 450);
  }

  function handlePointerMove(e) {
    if (!isMobile || e.pointerType !== "touch") return;

    const dx = Math.abs(e.clientX - startPosRef.current.x);
    const dy = Math.abs(e.clientY - startPosRef.current.y);

    if (dx > 6 || dy > 6) {
      didMoveRef.current = true;
      clearTimeout(holdTimerRef.current);
    }
  }

  function handlePointerUp(e) {
    if (!isMobile || e.pointerType !== "touch") return;

    clearTimeout(holdTimerRef.current);
    if (didMoveRef.current) return;

    if (!holdTriggeredRef.current && canCycleUp) {
      onCycleUp?.();
    }
  }

  function handlePointerLeave() {
    clearTimeout(holdTimerRef.current);
  }

  /* =========================
     DESKTOP
     ========================= */
  function handleClick() {
    if (isMobile) return;
    if (canCycleUp) onCycleUp?.();
  }

  function handleContextMenu(e) {
    if (isMobile) return;
    e.preventDefault();
    if (canCycleDown) {
      onCycleDown?.();
    }
  }

  /* =========================
     RENDER
     ========================= */
  const aceIconSrc = isAced ? "/icons/acegreen.svg" : "/icons/ace.svg";

  return (
    <div
      className={styles.node}
      data-state={visualState}
    >
      <div
        className={styles.slot}
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        title={
          cycleUpDisabledReason ||
          cycleDownDisabledReason ||
          ""
        }
      >

        <div className={styles.sprite}>
          <SkillSprite spritePos={skill.sprite} />
        </div>

        {/* ACED BORDER (SVG) */}
        {isAced && (
          <img
            src="/icons/aceborder.svg"
            alt=""
            className={styles.aceBorder}
            aria-hidden="true"
          />
        )}

        {/* LOCK */}
        {isLocked && (
          <>
            <div className={styles.lockOverlay} />
            <img
              src="/icons/padlock.png"
              alt="Locked"
              className={styles.lockIcon}
            />
          </>
        )}

        {/* INFO BUTTON (keep behavior) */}
        <button
          type="button"
          className={styles.infoButton}
          onClick={(e) => {
            e.stopPropagation();
            if (isMobile) onOpenInfo?.();
            else onSelectForDetails?.();
          }}
          aria-label="Info"
          title="Info"
        >
          ℹ️
        </button>

        {/* LABEL INSIDE SLOT */}
        {isAced && <div className={styles.stateLabel} data-kind="aced">// ACED</div>}
        {isLocked && <div className={styles.stateLabel} data-kind="locked">// LOCKED</div>}

        {/* BOTTOM RIGHT: ace icon + cost (or ace only if aced) */}
        <div className={styles.bottomRight}>
          {(isBase || isAced) && (
            <img
              src={aceIconSrc}
              alt={isAced ? "Aced" : "Ace available"}
              className={styles.aceIcon}
            />
          )}

          {nextCost != null && <span className={`${styles.cost} ${isBase ? styles.base : ""}`}>{nextCost}</span>}
        </div>
      </div>

      <div className={styles.name}>{skill.name?.toUpperCase()}</div>
    </div>
  );
}
