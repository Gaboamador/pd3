// ---------- GENERIC ----------

export function formatPercentFromRate(value) {
  return `${Math.round(value * 100)}%`;
}

export function formatSeconds(value) {
  return `${value}s`;
}

export function formatMeters(value) {
  return `${value}m`;
}

export function formatDegrees(value) {
  return `${value}°`;
}

// ---------- ARMOR ----------

export function formatArmorStat(key, value) {
  if (key === "damageReduction") {
    return formatPercentFromRate(value);
  }

  if (key === "ammoCapacity") {
    const pct = Math.round((value - 1) * 100);
    return pct === 0 ? "0%" : pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  return value;
}

// ---------- PLATES ----------

export function formatPlateStat(key, value) {
  if (key === "DamageReduction") {
    return formatPercentFromRate(value);
  }

  if (key === "RegenTime") {
    return formatSeconds(value);
  }

  return value;
}

// ---------- DEPLOYABLE ----------

export function formatDeployableStat(key, value) {
  if (
    typeof value === "number" &&
    value <= 1 &&
    (key.includes("Chance") || key.includes("Penetration"))
  ) {
    return formatPercentFromRate(value);
  }

  if (
    typeof value === "number" &&
    (key.includes("Cooldown") || key.includes("Time"))
  ) {
    return formatSeconds(value);
  }

  if (key.includes("Rotation")) {
    return formatDegrees(value);
  }

  if (key.includes("Distance") || key.includes("Range")) {
    return formatMeters(value);
  }

  return value;
}