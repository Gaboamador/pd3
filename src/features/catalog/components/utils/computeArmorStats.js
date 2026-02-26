export function computeArmorStats(armorDef, plateDef, plateCount) {
  if (!armorDef) return null;

  const baseStats = armorDef.stats ?? {};
  const plateStats = plateDef?.stats ?? {};

  const basePlates = baseStats.plates ?? 0;
  const baseDowns = baseStats.MaxDownCount ?? 0;

  let finalDowns = baseDowns;

  if (plateStats.MaxDowns >= 0) {
    finalDowns = plateStats.MaxDowns;
  }

  return {
    plates: plateCount ?? basePlates,
    maxDowns: finalDowns,
    speedPenalty: baseStats.SpeedPenalty ?? null,
    ammoCapacity: baseStats.AmmoCapacityScale ?? null,
    consumableSlots: baseStats.ConsumableCount ?? null,
  };
}