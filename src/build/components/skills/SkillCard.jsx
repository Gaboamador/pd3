import { useRef } from "react";

export default function SkillCard({
  skill,
  state, // { base, aced } | undefined
  isMobile,
  canCycleUp,
  cycleUpDisabledReason,
  onCycleUp,
  onCycleDown,
  onSelectForDetails,
  onOpenInfo,
}) {
  const level = state?.aced ? "aced" : state?.base ? "base" : "none";

  /* =========================
     MOBILE: TAP / HOLD
     ========================= */
  const holdTimerRef = useRef(null);
  const holdTriggeredRef = useRef(false);

  function handlePointerDown(e) {
    if (!isMobile) return;
    if (e.pointerType !== "touch") return;

    holdTriggeredRef.current = false;

    holdTimerRef.current = setTimeout(() => {
      holdTriggeredRef.current = true;
      onCycleDown?.(); // bajar
    }, 450);
  }

  function handlePointerUp(e) {
    if (!isMobile) return;
    if (e.pointerType !== "touch") return;

    clearTimeout(holdTimerRef.current);

    // tap corto → subir
    if (!holdTriggeredRef.current) {
      if (canCycleUp) onCycleUp?.();
    }
  }

  function handlePointerLeave() {
    clearTimeout(holdTimerRef.current);
  }

  /* =========================
     DESKTOP: LEFT / RIGHT
     ========================= */
  function handleClick() {
    if (isMobile) return;
    if (canCycleUp) onCycleUp?.();
  }

  function handleContextMenu(e) {
    if (isMobile) return;
    e.preventDefault();
    onCycleDown?.();
  }

  const border =
    level === "none"
      ? "rgba(255,255,255,0.12)"
      : level === "base"
      ? "rgba(80,180,255,0.55)"
      : "rgba(255,200,80,0.65)";

  const bg =
    level === "none"
      ? "rgba(255,255,255,0.03)"
      : level === "base"
      ? "rgba(80,180,255,0.12)"
      : "rgba(255,200,80,0.14)";

  return (
    <div
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      title={cycleUpDisabledReason || ""}
      style={{
        position: "relative",
        userSelect: "none",
        cursor: "pointer",
        padding: 10,
        borderRadius: 12,
        border: `1px solid ${border}`,
        background: bg,
        minHeight: 64,
        display: "grid",
        gap: 6,
        alignContent: "start",
        touchAction: "manipulation",
      }}
    >
      <div style={{ display: "flex", alignItems: "start", gap: 8 }}>
        {/* Nombre SIN handlers: toda la card responde al click */}
        <div style={{ fontWeight: 800, lineHeight: 1.1, flex: 1 }}>
          {skill.name}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isMobile) onOpenInfo?.();
            else onSelectForDetails?.();
          }}
          style={{
            border: "none",
            background: "transparent",
            cursor: "pointer",
            opacity: 0.95,
            fontSize: 14,
            lineHeight: 1,
            padding: 2,
          }}
          aria-label="Info"
          title="Info"
        >
          ℹ️
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, fontSize: 12, opacity: 0.85 }}>
        <span style={{ fontWeight: 700, textTransform: "uppercase" }}>
          {level}
        </span>
        <span>
          Cost {skill?.req_points?.base ?? 0}/{skill?.req_points?.aced ?? 0}
        </span>
        <span>Tier {skill.tier}</span>
      </div>

      {!canCycleUp && cycleUpDisabledReason && (
        <div style={{ fontSize: 11, opacity: 0.75 }}>
          {cycleUpDisabledReason}
        </div>
      )}
    </div>
  );
}
