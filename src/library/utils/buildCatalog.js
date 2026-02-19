// import { normalize } from "./normalize";

// export function buildCatalog({
//   skillsData,
//   loadoutData,
//   armorPlatesData,
// }) {
//   const catalog = [];

//   // 🔹 SKILLS
//   Object.values(skillsData).forEach(skill => {
//     const searchText = normalize(
//       [
//         skill.key,
//         skill.name,
//         skill.base_description,
//         skill.aced_description,
//       ]
//         .filter(Boolean)
//         .join(" ")
//     );

//     catalog.push({
//       kind: "skill",
//       key: skill.key,
//       label: skill.name,
//       searchText,
//     });
//   });

//   // 🔹 LOADOUT CATEGORIES
//   const categories = [
//     "primary",
//     "secondary",
//     "overkill",
//     "throwable",
//     "deployable",
//     "tool",
//     "armor",
//   ];

//   categories.forEach(cat => {
//     Object.values(loadoutData?.[cat] ?? {}).forEach(item => {
//       const searchText = normalize(
//         [item.key, item.name].filter(Boolean).join(" ")
//       );

//       catalog.push({
//         kind: cat,
//         key: item.key,
//         label: item.name,
//         searchText,
//       });
//     });
//   });

//   // 🔹 ARMOR PLATES
//   Object.values(armorPlatesData ?? {}).forEach(plate => {
//     const searchText = normalize(
//       [plate.key, plate.name].filter(Boolean).join(" ")
//     );

//     catalog.push({
//       kind: "plate",
//       key: plate.key,
//       label: plate.name,
//       searchText,
//     });
//   });

//   // 🔹 Weapon type filters (por slot)
//     ["primary", "secondary"].forEach(slot => {
//     const weapons = Object.values(loadoutData?.[slot] ?? {});

//     const types = new Set(
//         weapons
//         .map(w => w.weapon_type || w.type)
//         .filter(Boolean)
//     );

//     types.forEach(type => {
//         catalog.push({
//         kind: "weaponType",
//         slot,
//         weaponType: type,
//         label: `${type} (${slot})`,
//         searchText: normalize(`${type} ${slot}`),
//         });
//     });
//     });

//   return catalog;
// }
import { normalize } from "./normalize";

/**
 * Catalog = lista de entidades "elegibles" desde el typeahead.
 * Incluye:
 * - Skills (name + key + base/aced descriptions)
 * - Items (name + key)
 * - Armor plates
 * - Weapon Type por slot (primary/secondary) usando item.type del json
 */
export function buildCatalog({
  skillsData,
  loadoutData,
  armorPlatesData,
  weaponTypesBySlot, // { primary: ["shotgun", ...], secondary: ["pistol", ...] }
}) {
  const catalog = [];

  // 🔹 SKILLS (incluye descripciones)
  Object.values(skillsData).forEach((skill) => {
    const baseSearch = normalize(
      [skill.key, skill.name, skill.base_description, skill.aced_description]
        .filter(Boolean)
        .join(" ")
    );
    const searchText = `${baseSearch} ${baseSearch.replace(/\s+/g, "")}`;

    catalog.push({
      kind: "skill",
      key: skill.key,
      label: skill.name,
      searchText,
    });
  });

  // 🔹 WEAPON TYPE (primero en sugerencias cuando matchea)
  // NOTE: guardamos weaponType NORMALIZADO (ej "shotgun", "pistol")
  if (weaponTypesBySlot) {
    (weaponTypesBySlot.primary ?? []).forEach((t) => {

    const baseSearch = normalize(`${t} weapon type primary`);
    const searchText = `${baseSearch} ${baseSearch.replace(/\s+/g, "")}`;

      catalog.push({
        kind: "weaponType",
        key: `primary:${t}`,
        slot: "primary",
        weaponType: t,
        label: `Weapon Type: ${titleCase(t)} (Primary)`,
        // searchText: normalize(`${t} weapon type primary`),
        searchText
      });
    });

    (weaponTypesBySlot.secondary ?? []).forEach((t) => {

    const baseSearch = normalize(`${t} weapon type secondary`);
    const searchText = `${baseSearch} ${baseSearch.replace(/\s+/g, "")}`;

      catalog.push({
        kind: "weaponType",
        key: `secondary:${t}`,
        slot: "secondary",
        weaponType: t,
        label: `Weapon Type: ${titleCase(t)} (Secondary)`,
        // searchText: normalize(`${t} weapon type secondary`),
        searchText,
      });
    });
  }

  // 🔹 LOADOUT ITEMS
  const categories = [
    "primary",
    "secondary",
    "overkill",
    "throwable",
    "deployable",
    "tool",
    "armor",
  ];

  categories.forEach((cat) => {
    Object.values(loadoutData?.[cat] ?? {}).forEach((item) => {
      const typeText = item.type ? normalize(item.type) : "";

      // Para weapons, agregamos su type al searchText para que "pistol" sugiera armas también
      // (pero Weapon Type chips se rankean primero en getSuggestions)
      const baseSearch = normalize(
        [item.key, item.name, typeText, cat].filter(Boolean).join(" ")
      );
      const searchText = `${baseSearch} ${baseSearch.replace(/\s+/g, "")}`;

      catalog.push({
        kind: cat,
        key: item.key,
        label: item.name,
        weaponType: item.type ? normalize(item.type) : undefined,
        searchText,
      });
    });
  });

  // 🔹 ARMOR PLATES
  Object.values(armorPlatesData ?? {}).forEach((plate) => {
    const baseSearch = normalize([plate.key, plate.name].filter(Boolean).join(" "));
    const searchText = `${baseSearch} ${baseSearch.replace(/\s+/g, "")}`;

    catalog.push({
      kind: "plate",
      key: plate.key,
      label: plate.name,
      searchText,
    });
  });

  return catalog;
}

function titleCase(s) {
  if (!s) return "";
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}
