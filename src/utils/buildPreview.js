import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";

const loadoutIndex = Object.values(loadoutData)
  .flatMap(category => Object.values(category))
  .reduce((acc, item) => {
    if (item?.key) acc[item.key] = item;
    return acc;
  }, {});

function normalizeItemName(name) {
  if (!name) return name;
  return name.replace(/\s+Frame$/, "");
}

export function getItemNameByKey(key) {
  if (!key) return null;
  const name = loadoutIndex[key]?.name ?? null;
  return normalizeItemName(name);
}

export function formatPlates(plates) {
  if (!Array.isArray(plates) || plates.length === 0) return null;

  const counts = {};
  plates.filter(Boolean).forEach((plateKey) => {
    counts[plateKey] = (counts[plateKey] || 0) + 1;
  });

  const parts = Object.entries(counts).map(([plateKey, count]) => {
    const plateName = platesData[plateKey]?.name ?? plateKey;
    return count > 1 ? `${plateName} x${count}` : plateName;
  });

  return parts.length ? parts.join(" + ") : null;
}

/** Información estructurada para BuildLibrary; sin modificar el contrato de buildPreviewParts. */
export function getBuildLibraryDetails(build) {
  const loadout = build?.loadout ?? {};
  const item = (value) => getItemNameByKey(value) ?? null;
  const primary = item(loadout.primary?.weaponKey ?? loadout.primary);
  const secondary = item(loadout.secondary?.weaponKey ?? loadout.secondary);
  const overkill = item(loadout.overkill?.weaponKey ?? loadout.overkill);
  const armor = item(loadout.armor?.key ?? loadout.armor);
  const plates = formatPlates(loadout.armor?.plates);
  return {
    primary,
    secondary,
    overkill,
    armor,
    plates,
    throwable: item(loadout.throwable?.key ?? loadout.throwable),
    deployable: item(loadout.deployable?.key ?? loadout.deployable),
    tool: item(loadout.tool?.key ?? loadout.tool),
  };
}

/** Búsqueda sin distinguir tildes, mayúsculas ni separadores. */
export function normalizeBuildSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function matchesBuildLibrarySearch(build, query) {
  const words = normalizeBuildSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const details = getBuildLibraryDetails(build);
  const text = normalizeBuildSearch([build?.name, ...Object.values(details)].join(" "));
  return words.every(word => text.includes(word));
}

export function buildPreviewParts(build) {
  const { primary, secondary, overkill, armor, plates, throwable, deployable, tool } = getBuildLibraryDetails(build);
  const armorFull = armor && plates ? `${armor} (${plates})` : armor;
  return [primary, secondary, overkill, armorFull, throwable, deployable, tool].filter(Boolean);
}
