import { normalize } from "./normalize";

/**
 * Crea un lookup rápido:
 * weaponTypeByKey.primary[weaponKey] = normalizedType
 * weaponTypeByKey.secondary[weaponKey] = normalizedType
 *
 * Y lista de tipos disponibles por slot (para sugerir Weapon Type chips).
 */
export function buildWeaponTypeIndex(loadoutData) {
  const weaponTypeByKey = {
    primary: {},
    secondary: {},
  };

  const typesBySlot = {
    primary: new Set(),
    secondary: new Set(),
  };

  ["primary", "secondary"].forEach((slot) => {
    const items = Object.values(loadoutData?.[slot] ?? {});
    items.forEach((w) => {
      const t = normalize(w.type);
      if (!w.key || !t) return;

      weaponTypeByKey[slot][w.key] = t;
      typesBySlot[slot].add(t);
    });
  });

  return {
    weaponTypeByKey,
    typesBySlot: {
      primary: Array.from(typesBySlot.primary),
      secondary: Array.from(typesBySlot.secondary),
    },
  };
}
