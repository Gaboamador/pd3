/**
 * Mapping de weapon types internos de PD3 → label UI
 * Centralizado para reutilizar en filtros, stats, etc.
 */

export const WEAPON_TYPE_LABELS = {
  assaultrifle: "Assault Rifle",
  shotgun: "Shotgun",
  smg: "SMG",
  marksmanrifle: "Marksman Rifle",
  sniperrifle: "Sniper Rifle",
  lmg: "LMG",

  pistol: "Pistol",
  revolver: "Revolver",
  machinepistol: "Machine Pistol",
  shotgun_secondary: "Shotgun",
};

/**
 * Devuelve label legible para UI.
 * Fallback: capitaliza el type crudo.
 */
export function getWeaponTypeLabel(type) {
  if (!type) return "";
  return (
    WEAPON_TYPE_LABELS[type] ??
    type
      .replace(/_/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
  );
}

/**
 * Orden recomendado para mostrar en UI
 */
export const WEAPON_TYPE_ORDER = [
  "assaultrifle",
  "smg",
  "shotgun",
  "marksmanrifle",
  "sniperrifle",
  "lmg",

  "pistol",
  "revolver",
  "machinepistol",
  "shotgun_secondary",
];
