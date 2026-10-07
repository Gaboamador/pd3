// ===============================
// Capitalización
// ===============================

export function capitalizeKind(k) {
  if (!k) return "";
  return k[0].toUpperCase() + k.slice(1);
}

export function capitalizeFirst(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ===============================
// Weapon formatting
// ===============================

export function formatWeaponSlotLabel(slot) {
  if (!slot) return "";

  const map = {
    primary: "Primary",
    secondary: "Secondary",
    overkill: "Overkill",
  };

  return map[slot] ?? capitalizeFirst(slot);
}

export function formatWeaponTypeLabel(type) {
  if (!type) return "";

  const map = {
    assaultrifle: "Assault Rifle",
    smg: "SMG",
    lmg: "LMG",
    shotgun: "Shotgun",
    handgun: "Handgun",
    pistol: "Pistol",
    revolver: "Revolver",
    marksman: "Marksman Rifle",
    marksmanrifle: "Marksman Rifle",
    sniper: "Sniper Rifle",
    overkill: "Overkill",
  };

  if (map[type]) return map[type];

  return type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/^./, (s) => s.toUpperCase());
}

export function formatWeaponTypeWithSlot(slot, type) {
  const typeLabel = formatWeaponTypeLabel(type);
  const slotLabel = formatWeaponSlotLabel(slot);

  if (!slotLabel) return typeLabel;

  return `${typeLabel} (${slotLabel})`;
}

// ===============================
// Chip helpers
// ===============================

export function getChipLabel(chip, NAME_BY_KEY) {
  if (!chip) return "";

  if (chip.kind === "weaponType") {
    return formatWeaponTypeWithSlot(chip.slot, chip.weaponType);
  }

  if (chip.kind === "weaponSlot") {
    return `All ${formatWeaponSlotLabel(chip.slot)} Weapons`;
  }

  if (chip.kind === "buildName") {
    return chip.label;
  }

  return NAME_BY_KEY?.[chip.key] ?? chip.key;
}

export function getChipKindLabel(chip) {
  if (!chip) return "";

  switch (chip.kind) {
    case "skill":
      return "Skill";
    case "weaponSlot":
      return "Weapon Slot";
    case "weaponType":
      return "Weapon Type";
    case "buildName":
      return "Build";
    case "perk":
      return "Perk";
    case "overkillAmmo":
      return "Overkill Ammo";
    default:
      return capitalizeKind(chip.kind);
  }
}

export function getChipKindColor(kind) {
  switch (kind) {
    case "skill":
      return "var(--color-skill)";
    case "weaponSlot":
    case "weaponType":
    case "perk":
    case "overkillAmmo":
    case "primary":
    case "secondary":
    case "overkill":
      return "var(--color-weapon)";
    case "armor":
    case "plate":
      return "var(--color-armor)";
    case "throwable":
      return "var(--color-throwable)";
    case "deployable":
      return "var(--color-deployable)";
    case "tool":
      return "var(--color-tool)";
    case "buildName":
      return "var(--color-build)";
    default:
      return "rgba(255,255,255,0.08)";
  }
}

// ===============================
// Suggestions UI
// ===============================

export function formatKindLabel(kind) {
  const map = {
    skillDescriptionSearch: "Skill Text Search",
    buildName: "Builds",
    skill: "Skills",
    weapons: "Weapons",
    weaponSlot: "Weapons",
    weaponType: "Weapons",
    overkill: "Overkill Weapon",
    armor: "Armor",
    plate: "Plates",
    perk: "Perks",
    overkillAmmo: "Overkill Ammo",
    throwable: "Throwables",
    deployable: "Deployables",
    tool: "Tools",
  };

  return map[kind] ?? capitalizeKind(kind);
}

export function buildSuggestionsWithDividers(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const result = [];
  let lastKind = null;

  for (const item of list) {
    const groupKind =
      item.kind === "weaponSlot" || item.kind === "weaponType"
        ? "weapons"
        : item.kind;

    if (groupKind !== lastKind) {
      result.push({
        __type: "divider",
        kind: groupKind,
      });
      lastKind = groupKind;
    }

    result.push({
      __type: "item",
      ...item,
    });
  }

  return result;
}
