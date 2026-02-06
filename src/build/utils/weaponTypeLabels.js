// utils/weaponTypeLabels.js
const OVERRIDES = {
  assaultrifle: "Assault Rifle",
  smg: "SMG",
  lmg: "LMG",
  marksman: "Marksman Rifle",
  sniperrifle: "Sniper Rifle",
  machinepistol: "Machine Pistol",
};

export function buildWeaponTypeLabels(types) {
  const map = {};

  for (const type of types) {
    map[type] =
      OVERRIDES[type] ??
      type
        .replace(/_/g, " ")
        .replace(/\b\w/g, c => c.toUpperCase());
  }

  return map;
}

export function getWeaponTypeLabel(type, labelsMap) {
  if (!type) return "";
  return labelsMap[type] ?? type;
}

export function orderWeaponTypes(types) {
  const preferred = [
    "assaultrifle",
    "smg",
    "shotgun",
    "marksman",
    "sniperrifle",
    "lmg",
    "pistol",
    "revolver",
    "machinepistol",
    "shotgun_secondary",
  ];

  return [
    ...preferred.filter(t => types.includes(t)),
    ...types.filter(t => !preferred.includes(t)),
  ];
}
