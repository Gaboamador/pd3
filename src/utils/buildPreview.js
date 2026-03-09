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

  plates.forEach((plateKey) => {
    counts[plateKey] = (counts[plateKey] || 0) + 1;
  });

  const parts = Object.entries(counts).map(([plateKey, count]) => {
    const plateName = platesData[plateKey]?.name ?? plateKey;
    return count > 1 ? `${plateName} x${count}` : plateName;
  });

  return parts.join(" + ");
}

export function buildPreviewParts(build) {
  const loadout = build.loadout ?? {};

  const primaryName = getItemNameByKey(
    loadout.primary?.weaponKey ?? loadout.primary
  );

  const secondaryName = getItemNameByKey(
    loadout.secondary?.weaponKey ?? loadout.secondary
  );

  const overkillName = getItemNameByKey(
    loadout.overkill?.weaponKey ?? loadout.overkill
  );

  const armorName = getItemNameByKey(
    loadout.armor?.key ?? loadout.armor
  );

  const plateText = formatPlates(loadout.armor?.plates);

  let armorFull = null;

  if (armorName && plateText) {
    armorFull = `${armorName} (${plateText})`;
  } else if (armorName) {
    armorFull = armorName;
  }

  const throwableName = getItemNameByKey(
    loadout.throwable?.weaponKey ?? loadout.throwable
  );

  const deployableName = getItemNameByKey(
    loadout.deployable?.key ?? loadout.deployable
  );

  const toolName = getItemNameByKey(
    loadout.tool?.key ?? loadout.tool
  );

  return [
    primaryName,
    secondaryName,
    overkillName,
    armorFull,
    throwableName,
    deployableName,
    toolName,
  ].filter(Boolean);
}