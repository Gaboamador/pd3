import { normalize } from "../../../../library/utils/normalize";

export function getWeaponsByTypeSelection(loadoutData, s, { onlyWithStats = true } = {}) {
  if (!s) return [];

  const slot = s.slot;
  if (slot !== "primary" && slot !== "secondary") return [];

  // El tipo viene normalizado desde buildWeaponTypeIndex (por cómo lo construís),
  // pero lo normalizamos igual por seguridad.
  const selectedType = normalize(s.weaponType ?? s.key ?? "");
  if (!selectedType) return [];

  const weapons = Object.values(loadoutData?.[slot] ?? {}).filter((w) => {
    const t = normalize(w?.type);
    if (!w?.key || !t) return false;
    if (t !== selectedType) return false;

    const hasStats = w?.stats && typeof w.stats === "object";
    if (onlyWithStats && !hasStats) return false;

    return true;
  });

  // Orden estable y “lindo”
  weapons.sort((a, b) => (a.name ?? a.key).localeCompare(b.name ?? b.key));

  return weapons;
}
