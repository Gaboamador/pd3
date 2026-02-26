import loadoutData from "../../../../data/payday3_loadout_items.json";
import skillsData from "../../../../data/payday3_skills.json";
import platesData from "../../../../data/payday3_armor_plates.json";

export function resolveCatalogItem(item) {
  if (!item) return { def: null, kind: null };

  const { kind, key } = item;

  switch (kind) {
    case "skill":
      return { def: skillsData[key], kind };

    case "plate":
      return { def: platesData[key], kind };

    case "primary":
    case "secondary":
    case "overkill":
      return { def: findWeapon(key), kind };

    default:
      return { def: findIn(loadoutData[kind], key), kind };
  }
}

function findIn(section, key) {
  if (!section) return null;
  return Object.values(section).find(
    (x) => x.key === key || String(x.id) === String(key)
  );
}

function findWeapon(key) {
  for (const section of Object.values(loadoutData)) {
    const found = Object.values(section || {}).find(
      (x) => x.key === key
    );
    if (found) return found;
  }
  return null;
}