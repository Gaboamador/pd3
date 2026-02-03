/**
 * Helpers de Armor + plates (PD3)
 * Modelo:
 * - armor.stats.plates define cantidad de slots
 * - plates es un array de largo fijo
 * - cada slot puede ser null o una plate key válida
 */

export function getArmorByKey(loadoutData, armorKey) {
  if (!armorKey) return null;

  const items = flattenItems(loadoutData);
  return items.find(i => i?.key === armorKey) ?? null;
}

export function getArmorMaxPlates(armorDef) {
  if (!armorDef) return 0;

  const n = armorDef?.stats?.plates ?? 0;
  const parsed = Number(n);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

/**
 * Crea slots vacíos según el frame
 * ej: maxPlates = 3 → [null, null, null]
 */
export function buildEmptyPlateSlots(maxPlates) {
  return Array.from({ length: maxPlates }, () => null);
}

/**
 * Ajusta un array de plates al tamaño exacto requerido:
 * - si falta, rellena con null
 * - si sobra, corta
 */
export function normalizePlateSlots(plates, maxPlates) {
  const base = Array.isArray(plates) ? plates.slice(0, maxPlates) : [];
  while (base.length < maxPlates) base.push(null);
  return base;
}

export function validateArmorPlatesOrder(armorState, loadoutData, platesData) {
  const issues = [];

  const armorKey = armorState?.key;
  if (!armorKey) return issues;

  const armorDef = getArmorByKey(loadoutData, armorKey);
  if (!armorDef) {
    issues.push({
      code: "ARMOR_NOT_FOUND",
      message: `Armor ${armorKey} no encontrada`,
      meta: { armorKey },
    });
    return issues;
  }

  const maxPlates = getArmorMaxPlates(armorDef);
  const plates = armorState?.plates ?? [];

  if (plates.length !== maxPlates) {
    issues.push({
      code: "ARMOR_PLATES_SLOT_MISMATCH",
      message: `Armor ${armorKey} requiere ${maxPlates} slots (${plates.length})`,
      meta: { maxPlates, actual: plates.length },
    });
  }

  plates.forEach((p, i) => {
    if (p == null) return; // slot vacío es válido
    if (!platesData?.[p]) {
      issues.push({
        code: "PLATE_UNKNOWN",
        message: `Plate desconocida en slot ${i + 1}: ${p}`,
        meta: { plateKey: p, slot: i },
      });
    }
  });

  return issues;
}

/* internal */
function flattenItems(loadoutData) {
  if (!loadoutData) return [];
  if (Array.isArray(loadoutData)) return loadoutData;

  if (typeof loadoutData === "object") {
    const out = [];
    for (const v of Object.values(loadoutData)) {
      if (Array.isArray(v)) out.push(...v);
      else if (v && typeof v === "object") out.push(...Object.values(v));
    }
    if (Array.isArray(loadoutData.items)) out.push(...loadoutData.items);
    return out.filter(Boolean);
  }

  return [];
}
