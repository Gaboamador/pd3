// import { normalize } from "./normalize";

// /* ======================================================
//    1️⃣ CREACIÓN DE MAPAS DINÁMICOS DESDE JSON
// ====================================================== */

// export function createSearchMaps({
//   skillsData,
//   loadoutData,
//   armorPlatesData,
// }) {
//   const skillMap = {};
//   const itemMap = {};

//   // 🔹 Skills
//   Object.values(skillsData).forEach(skill => {
//     const key = skill.key;
//     skillMap[normalize(key)] = { type: "skill", key };
//     skillMap[normalize(skill.name)] = { type: "skill", key };
//   });

//   // 🔹 Weapons (primary + secondary)
//   ["primary", "secondary"].forEach(slot => {
//     const byType = loadoutData?.[slot] ?? {};
//     Object.values(byType).forEach(item => {
//       itemMap[normalize(item.key)] = { type: slot, key: item.key };
//       itemMap[normalize(item.name)] = { type: slot, key: item.key };
//     });
//   });

//   // 🔹 Overkill
//   Object.values(loadoutData?.overkill ?? {}).forEach(item => {
//     itemMap[normalize(item.key)] = { type: "overkill", key: item.key };
//     itemMap[normalize(item.name)] = { type: "overkill", key: item.key };
//   });

//   // 🔹 Throwables
//   Object.values(loadoutData?.throwable ?? {}).forEach(item => {
//     itemMap[normalize(item.key)] = { type: "throwable", key: item.key };
//     itemMap[normalize(item.name)] = { type: "throwable", key: item.key };
//   });

//   // 🔹 Deployables
//   Object.values(loadoutData?.deployable ?? {}).forEach(item => {
//     itemMap[normalize(item.key)] = { type: "deployable", key: item.key };
//     itemMap[normalize(item.name)] = { type: "deployable", key: item.key };
//   });

//   // 🔹 Tools
//   Object.values(loadoutData?.tool ?? {}).forEach(item => {
//     itemMap[normalize(item.key)] = { type: "tool", key: item.key };
//     itemMap[normalize(item.name)] = { type: "tool", key: item.key };
//   });

//   // 🔹 Armor
//   Object.values(loadoutData?.armor ?? {}).forEach(item => {
//     itemMap[normalize(item.key)] = { type: "armor", key: item.key };
//     itemMap[normalize(item.name)] = { type: "armor", key: item.key };
//   });

//   // 🔹 Armor Plates
//   Object.values(armorPlatesData ?? {}).forEach(plate => {
//     itemMap[normalize(plate.key)] = { type: "plate", key: plate.key };
//     itemMap[normalize(plate.name)] = { type: "plate", key: plate.key };
//   });

//   return { skillMap, itemMap };
// }

// /* ======================================================
//    2️⃣ PARSER INTELIGENTE DE TEXTO
// ====================================================== */

// export function parseSearchText(text, maps) {
//   const normalizedText = normalize(text);
//   const tokens = normalizedText.split(/\s+/).filter(Boolean);

//   const filterGroups = [];

//   let i = 0;

//   while (i < tokens.length) {
//     const token = tokens[i];
//     const next = tokens[i + 1];

//     const group = [];

//     const isAceModifier = next === "ace" || next === "aced";
//     const isBaseModifier = next === "base";

//     // 🔹 skills
//     Object.entries(maps.skillMap).forEach(([phrase, data]) => {
//       if (phrase.includes(token)) {
//         group.push({
//           type: "skill",
//           key: data.key,
//           state: isAceModifier
//           ? "aced"
//           : isBaseModifier
//             ? "baseOnly"
//             : "base",
//         });
//       }
//     });

//     // 🔹 items
//     Object.entries(maps.itemMap).forEach(([phrase, data]) => {
//       if (phrase.includes(token)) {
//         group.push(data);
//       }
//     });

//     if (group.length) {
//       filterGroups.push(group);
//       i += (isAceModifier || isBaseModifier) ? 2 : 1;
//       continue;
//     }

//     // fallback name
//     filterGroups.push([{ type: "name", value: token }]);
//     i++;
//   }

//   return filterGroups;
// }


// /* ======================================================
//    3️⃣ EVALUADOR DE FILTROS
// ====================================================== */

// function matchesFilter(build, filter) {
//   const idx = build.__searchIndex;
//   if (!idx) return false;

//   switch (filter.type) {
//     case "skill":
//       if (filter.state === "aced") {
//         return idx.skills.aced.has(filter.key);
//       }

//       // base ahora significa baseOnly
//       return (
//         idx.skills.base.has(filter.key) &&
//         !idx.skills.aced.has(filter.key)
//       );

//     case "primary":
//       return idx.loadout.primary === filter.key;

//     case "secondary":
//       return idx.loadout.secondary === filter.key;

//     case "overkill":
//       return idx.loadout.overkill === filter.key;

//     case "throwable":
//       return idx.loadout.throwable === filter.key;

//     case "deployable":
//       return idx.loadout.deployable === filter.key;

//     case "tool":
//       return idx.loadout.tool === filter.key;

//     case "armor":
//       return idx.armor.key === filter.key;

//     case "plate":
//       return idx.armor.plates.includes(filter.key);

//     case "name":
//       return idx.nameTokens.includes(filter.value);

//     case "weaponType": {
//       const weaponKey = idx.loadout[filter.slot];
//       if (!weaponKey) return false;

//       const weapon =
//         loadoutData?.[filter.slot]?.[
//           Object.keys(loadoutData[filter.slot]).find(
//             id => loadoutData[filter.slot][id].key === weaponKey
//           )
//         ];

//       if (!weapon) return false;

//       const type = weapon.weapon_type || weapon.type;

//       return type === filter.weaponType;
//     }

//     default:
//       return false;
//   }
// }

// /* ======================================================
//    4️⃣ FUNCIÓN PRINCIPAL
// ====================================================== */

// export function filterBuilds(builds, filters) {
//   if (!filters?.length) return builds;

//   return builds.filter(build =>
//     filters.every(filterGroup => {
//       // Si el filtro es un array → OR interno
//       if (Array.isArray(filterGroup)) {
//         return filterGroup.some(filter =>
//           matchesFilter(build, filter)
//         );
//       }

//       // Filtro simple
//       return matchesFilter(build, filterGroup);
//     })
//   );
// }

import { normalize } from "./normalize";

function matchesFilter(build, filter, ctx) {
  const idx = build.__searchIndex;
  if (!idx) return false;

  switch (filter.type) {
    case "skill": {
      if (filter.state === "aced") {
        return idx.skills.aced.has(filter.key);
      }

      // base = baseOnly
      return idx.skills.base.has(filter.key) && !idx.skills.aced.has(filter.key);
    }

    case "primary":
      return idx.loadout.primary === filter.key;

    case "secondary":
      return idx.loadout.secondary === filter.key;

    case "overkill":
      return idx.loadout.overkill === filter.key;

    case "throwable":
      return idx.loadout.throwable === filter.key;

    case "deployable":
      return idx.loadout.deployable === filter.key;

    case "tool":
      return idx.loadout.tool === filter.key;

    case "armor":
      return idx.armor.key === filter.key;

    case "plate":
      return idx.armor.plates.includes(filter.key);

    case "weaponType": {
      const slot = filter.slot; // "primary" | "secondary"
      const weaponKey = idx.loadout?.[slot];
      if (!weaponKey) return false;

      const weaponTypeByKey = ctx?.weaponTypeByKey;
      const actual = weaponTypeByKey?.[slot]?.[weaponKey];
      if (!actual) return false;

      return actual === filter.weaponType; // ambos normalizados (lowercase)
    }

    case "name":
      return idx.nameTokens.includes(filter.value);

    case "buildName":
      return normalize(build.name).includes(filter.value);

    default:
      return false;
  }
}

export function filterBuilds(builds, filters, ctx) {
  if (!filters?.length) return builds;

  return builds.filter((build) => {
    return filters.every((filterGroup) => {
      if (Array.isArray(filterGroup)) {
        return filterGroup.some((f) => matchesFilter(build, f, ctx));
      }
      return matchesFilter(build, filterGroup, ctx);
    });
  });
}
