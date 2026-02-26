export function computeWeaponStats(weaponDef, modsState = {}) {
  if (!weaponDef?.stats) return null;

  const s = weaponDef.stats;

  // ---------------------------------
  // Resolve mod objects from ids
  // ---------------------------------
  const resolvedMods = resolveModsFromIds(weaponDef, modsState);

  // ---------------------------------
  // Separate default vs selected
  // ---------------------------------
  const defaultMods = [];
  const selectedMods = [];

  for (const [slot, modObj] of Object.entries(resolvedMods)) {
    if (!modObj) continue;
    if (modObj.type === "default") {
      defaultMods.push(modObj);
    } else {
      selectedMods.push(modObj);
    }
  }

  // ---------------------------------
  // ACC TEMPLATE
  // ---------------------------------
  function makeAcc() {
    return {
      // playrate %
      OverallSwapSpeed: 0,
      SprintExitPlayRate: 0,
      OverallReloadPlayRate: 0,
      TargetingTransitionTime: 0,

      // overrides
      AmmoLoaded: null,
      AmmoLoadedMax: null,
      AmmoInventory: null,
      AmmoInventoryMax: null,
      AmmoPerReload: null,

      AmmoPickupMin: null,
      AmmoPickupMax: null,

      OverallGunkick: 0,
      HorizontalGunkick: 0,
      VerticalGunkick: 0,
      OverallRecoil: 0,
      HorizontalRecoil: 0,
      VerticalRecoil: 0,
      InitialRecoil: 0,
    };
  }

  function applyModStats(acc, mod) {
    if (!mod?.stats) return;

    for (const [k, v] of Object.entries(mod.stats)) {
      if (k === "AmmoPickup" && typeof v === "object") {
        if (typeof v.Min === "number") acc.AmmoPickupMin = v.Min;
        if (typeof v.Max === "number") acc.AmmoPickupMax = v.Max;
        continue;
      }

      if (
        k === "AmmoLoaded" ||
        k === "AmmoLoadedMax" ||
        k === "AmmoInventory" ||
        k === "AmmoInventoryMax" ||
        k === "AmmoPerReload"
      ) {
        if (typeof v === "number") acc[k] = v;
        continue;
      }

      if (
        k === "OverallSwapSpeed" ||
        k === "SprintExitPlayRate" ||
        k === "OverallReloadPlayRate" ||
        k === "TargetingTransitionTime"
      ) {
        if (typeof v === "number") acc[k] += v;
        continue;
      }

      if (k in acc && typeof v === "number") {
        acc[k] += v;
      }
    }
  }

  // ---------------------------------
  // PASS 1 — BASELINE (weapon + defaults)
  // ---------------------------------
  const accBase = makeAcc();
  defaultMods.forEach(mod => applyModStats(accBase, mod));

  const baseMagSize =
    accBase.AmmoLoaded ??
    accBase.AmmoLoadedMax ??
    s.Magazine?.AmmoLoaded ??
    null;

  const baseMaxReserve =
    accBase.AmmoInventoryMax ??
    s.Magazine?.AmmoInventoryMax ??
    null;

  const baseStartingReserve =
    accBase.AmmoInventory ??
    s.Magazine?.AmmoInventory ??
    null;

  const basePickupMin =
    accBase.AmmoPickupMin ??
    s.Magazine?.AmmoPickupMin ??
    null;

  const basePickupMax =
    accBase.AmmoPickupMax ??
    s.Magazine?.AmmoPickupMax ??
    null;

  const baseTacReload =
    applyPctToTime(
      s.ReloadTime?.tactical ?? null,
      accBase.OverallReloadPlayRate
    );

  const baseEmptyReload =
    applyPctToTime(
      s.ReloadTime?.empty ?? null,
      accBase.OverallReloadPlayRate
    );

  const baseDraw =
    applyPctToTime(
      s.SwapSpeed?.EquipPlayRate ?? null,
      accBase.OverallSwapSpeed
    );

  const baseHolster =
    applyPctToTime(
      s.SwapSpeed?.UnequipPlayRate ?? null,
      accBase.OverallSwapSpeed
    );

  const baseADS =
    applyPctMultiply(
      s.ADS?.TargetingTransitionTime ?? null,
      accBase.TargetingTransitionTime
    );

  const baseSprintExit =
    applyPctToTime(
      s.SprintExitPlayRate ?? null,
      accBase.SprintExitPlayRate
    );

  const baseGunkickH =
    accBase.OverallGunkick + accBase.HorizontalGunkick;

  const baseGunkickV =
    accBase.OverallGunkick + accBase.VerticalGunkick;

  const baseRecoilH =
    accBase.OverallRecoil + accBase.HorizontalRecoil;

  const baseRecoilV =
    accBase.OverallRecoil + accBase.VerticalRecoil;

  const baseRecoilI =
    accBase.InitialRecoil ?? 0;

  // ---------------------------------
  // PASS 2 — APPLY SELECTED MODS
  // ---------------------------------
  const accFinal = makeAcc();
  selectedMods.forEach(mod => applyModStats(accFinal, mod));

  const finalMagSize =
    accFinal.AmmoLoaded ??
    accFinal.AmmoLoadedMax ??
    baseMagSize;

  const finalMaxReserve =
    accFinal.AmmoInventoryMax ??
    baseMaxReserve;

  const finalStartingReserve =
    accFinal.AmmoInventory ??
    baseStartingReserve;

  const finalPickupMin =
    accFinal.AmmoPickupMin ??
    basePickupMin;

  const finalPickupMax =
    accFinal.AmmoPickupMax ??
    basePickupMax;

  const finalTacReload =
    applyPctToTime(baseTacReload, accFinal.OverallReloadPlayRate);

  const finalEmptyReload =
    applyPctToTime(baseEmptyReload, accFinal.OverallReloadPlayRate);

  const finalDraw =
    applyPctToTime(baseDraw, accFinal.OverallSwapSpeed);

  const finalHolster =
    applyPctToTime(baseHolster, accFinal.OverallSwapSpeed);

  const finalADS =
    applyPctMultiply(baseADS, accFinal.TargetingTransitionTime);

  const finalSprintExit =
    applyPctToTime(baseSprintExit, accFinal.SprintExitPlayRate);

  const finalGunkickH =
    baseGunkickH + accFinal.OverallGunkick + accFinal.HorizontalGunkick;

  const finalGunkickV =
    baseGunkickV + accFinal.OverallGunkick + accFinal.VerticalGunkick;

  const finalRecoilH =
    baseRecoilH + accFinal.OverallRecoil + accFinal.HorizontalRecoil;

  const finalRecoilV =
    baseRecoilV + accFinal.OverallRecoil + accFinal.VerticalRecoil;

  const finalRecoilI =
    baseRecoilI + accFinal.InitialRecoil;

  // ---------------------------------
  // BUILD ROWS
  // ---------------------------------
  return {
    "Damage": rowNominal(s.damage ?? null),
    "Armor Penetration": rowNominal(s.ArmorPenetration ?? null),
    "RPM": rowNominal(s.RoundsPerMinute ?? null),

    "Mag: Size": rowNominalWithDelta(baseMagSize, finalMagSize),
    "Mag: Starting Reserve": rowNominalWithDelta(baseStartingReserve, finalStartingReserve),
    "Mag: Max Reserve": rowNominalWithDelta(baseMaxReserve, finalMaxReserve),
    "Mag: Ammo Pickup": rowText(formatRange(finalPickupMin, finalPickupMax)),

    "Reload: Tactical": rowSecondsWithDelta(baseTacReload, finalTacReload),
    "Reload: Empty": rowSecondsWithDelta(baseEmptyReload, finalEmptyReload),

    "Swap: Draw": rowSecondsWithDelta(baseDraw, finalDraw),
    "Swap: Holster": rowSecondsWithDelta(baseHolster, finalHolster),

    "ADS: Targeting Speed": rowSecondsWithDelta(baseADS, finalADS),
    "ADS: Magnification": rowNominal(s.ADS?.TargetingMagnification ?? null),

    "Sprint Exit": rowSecondsWithDelta(baseSprintExit, finalSprintExit),

    "Gunkick: Horizontal": rowNominalWithDelta(baseGunkickH, finalGunkickH),
    "Gunkick: Vertical": rowNominalWithDelta(baseGunkickV, finalGunkickV),

    "Recoil: Horizontal": rowNominalWithDelta(baseRecoilH, finalRecoilH),
    "Recoil: Vertical": rowNominalWithDelta(baseRecoilV, finalRecoilV),
    "Recoil: Initial": rowNominalWithDelta(baseRecoilI, finalRecoilI),
  };
}

function resolveModsFromIds(weaponDef, modsState) {
  const resolved = {};

  for (const [slot, id] of Object.entries(modsState || {})) {
    if (!id) continue;

    const slotMods = weaponDef.mods?.[slot];
    if (!slotMods) continue;

    const modObj = Object.values(slotMods).find(m => m.id === id);
    if (modObj) resolved[slot] = modObj;
  }

  return resolved;
}

function applyPctToTime(baseTime, pct) {
  if (typeof baseTime !== "number") return baseTime;
  const denom = 1 + pct / 100;
  if (denom === 0) return baseTime;
  return round(baseTime / denom, 3);
}

function applyPctMultiply(baseTime, pct) {
  if (typeof baseTime !== "number") return baseTime;
  return round(baseTime * (1 + pct / 100), 3);
}

function rowNominal(v) {
  return { base: fmt(v), delta: 0, final: fmt(v) };
}

function rowNominalWithDelta(base, final) {
  const b = typeof base === "number" ? base : null;
  const f = typeof final === "number" ? final : null;

  const delta =
    typeof b === "number" && typeof f === "number"
      ? round(f - b, 3)
      : 0;

  return {
    base: fmt(b),
    delta: delta !== 0 ? formatSigned(delta) : 0,
    final: fmt(f),
  };
}

function rowSecondsWithDelta(base, final) {
  const b = typeof base === "number" ? base : null;
  const f = typeof final === "number" ? final : null;

  const delta =
    typeof b === "number" && typeof f === "number"
      ? round(f - b, 3)
      : 0;

  return {
    base: typeof b === "number" ? `${round(b, 3)}s` : "-",
    delta: delta !== 0 ? formatSigned(delta) : 0,
    final: typeof f === "number" ? `${round(f, 3)}s` : "-",
  };
}

function rowText(text) {
  return { base: text, delta: 0, final: text };
}

function formatRange(min, max) {
  if (typeof min !== "number" && typeof max !== "number") return "-";
  if (typeof min === "number" && typeof max === "number") return `${min} - ${max}`;
  if (typeof min === "number") return `${min}+`;
  return `0 - ${max}`;
}

function formatSigned(n) {
  return n > 0 ? `+${n}` : `${n}`;
}

function fmt(v) {
  if (v == null) return "-";
  if (typeof v === "number") return round(v, 3);
  return String(v);
}

function round(n, d = 2) {
  const m = Math.pow(10, d);
  return Math.round(n * m) / m;
}