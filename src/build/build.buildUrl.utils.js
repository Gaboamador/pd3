// import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
// import { DEFAULT_BUILD } from "./build.constants";

// export function encodeBuildToUrl(build) {
//   try {
//     const json = JSON.stringify(build);
//     return compressToEncodedURIComponent(json);
//   } catch (err) {
//     console.warn("Failed to encode build", err);
//     return null;
//   }
// }

// export function decodeBuildFromUrl(encoded) {
//   try {
//     const json = decompressFromEncodedURIComponent(encoded);
//     if (!json) return null;

//     const parsed = JSON.parse(json);

//     // validación mínima
//     if (!parsed || parsed.version !== DEFAULT_BUILD.version) {
//       return null;
//     }

//     return parsed;
//   } catch (err) {
//     console.warn("Failed to decode build", err);
//     return null;
//   }
// }




// import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
// import { createSkillIndexMap } from "./build.shareSkillMap";
// import skillsData from "../data/payday3_skills.json";
// import { DEFAULT_BUILD } from "./build.constants";
// const { keyToIndex } = createSkillIndexMap(skillsData);

// export function encodeBuildToUrl(build) {
//   try {
//     // ---- Skills compactas ----
//     const compactSkills = [];

//     for (const [key, value] of Object.entries(build.skills)) {
//       const index = keyToIndex[key];
//       if (index === undefined) continue;

//       const level = value.aced ? 2 : 1;
//       compactSkills.push([index, level]);
//     }

//     // ---- Loadout compactado ----
//     const l = build.loadout;

//     const compact = {
//       v: build.version,

//       // nombre
//       n: build.name || "",

//       // loadout
//       l: [
//         // primary
//         l.primary
//           ? [
//               l.primary.weaponKey,
//               Object.values(l.primary.mods || {}),
//               l.primary.preset ?? 0,
//             ]
//           : null,

//         // secondary
//         l.secondary
//           ? [
//               l.secondary.weaponKey,
//               Object.values(l.secondary.mods || {}),
//               l.secondary.preset ?? 0,
//             ]
//           : null,

//         l.deployable,
//         l.throwable,
//         l.tool,
//         l.overkill,
//         [l.armor.key, l.armor.plates],
//       ],

//       // skills
//       s: compactSkills,
//     };

//     const json = JSON.stringify(compact);
//     return compressToEncodedURIComponent(json);
//   } catch (err) {
//     console.warn("Failed to encode build", err);
//     return null;
//   }
// }

// const { indexToKey } = createSkillIndexMap(skillsData);

// export function decodeBuildFromUrl(encoded) {
//   try {
//     const json = decompressFromEncodedURIComponent(encoded);
//     if (!json) return null;

//     const parsed = JSON.parse(json);

//     if (!parsed || parsed.v !== DEFAULT_BUILD.version) {
//       return null;
//     }

//     // ---- reconstruir skills ----
//     const skills = {};
//     for (const [index, level] of parsed.s) {
//       const key = indexToKey[index];
//       if (!key) continue;

//       skills[key] = {
//         base: true,
//         aced: level === 2,
//       };
//     }

//     // ---- reconstruir loadout ----
//     const [
//       primary,
//       secondary,
//       deployable,
//       throwable,
//       tool,
//       overkill,
//       armor,
//     ] = parsed.l;

//     const build = {
//       ...DEFAULT_BUILD,
//       version: parsed.v,
//       name: parsed.n,
//       loadout: {
//         primary: primary
//           ? {
//               weaponKey: primary[0],
//               mods: reconstructMods(primary[1]),
//               preset: primary[2],
//             }
//           : null,
//         secondary: secondary
//           ? {
//               weaponKey: secondary[0],
//               mods: reconstructMods(secondary[1]),
//               preset: secondary[2],
//             }
//           : null,
//         deployable,
//         throwable,
//         tool,
//         overkill,
//         armor: {
//           key: armor[0],
//           plates: armor[1],
//         },
//       },
//       skills,
//     };

//     return build;
//   } catch (err) {
//     console.warn("Failed to decode build", err);
//     return null;
//   }
// }

// function reconstructMods(modArray) {
//   if (!Array.isArray(modArray)) return {};
//   const result = {};
//   modArray.forEach((id, i) => {
//     result[i] = id;
//   });
//   return result;
// }
import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from "lz-string";

import skillsData from "../data/payday3_skills.json";
import { DEFAULT_BUILD } from "./build.constants";
import { createSkillIndexMap } from "./build.shareSkillMap";

/* ===============================
   MAPA SKILLS (sí conviene índice)
================================ */

const { keyToIndex, indexToKey } = createSkillIndexMap(skillsData);

/* ===============================
   MODS (robusto y seguro)
================================ */

function compactMods(mods) {
  const result = [];

  for (const [slot, modId] of Object.entries(mods || {})) {
    result.push([slot, modId]);
  }

  // ordenar mejora compresión LZ
  result.sort((a, b) => a[0].localeCompare(b[0]));

  return result;
}

function reconstructMods(modArray) {
  const result = {};

  for (const [slot, modId] of modArray || []) {
    result[slot] = modId;
  }

  return result;
}

/* ===============================
   ENCODE
================================ */

export function encodeBuildToUrl(build) {
  try {
    /* ---------- Skills compactas ---------- */
    const compactSkills = [];

    for (const [key, value] of Object.entries(build.skills || {})) {
      const index = keyToIndex[key];
      if (index === undefined) continue;

      const level = value.aced ? 2 : 1;
      compactSkills.push([index, level]);
    }

    compactSkills.sort((a, b) => a[0] - b[0]);

    /* ---------- Loadout ---------- */

    const l = build.loadout;

    const compact = {
      i: build.id ?? null,
      v: build.version,
      n: build.name || "",

      l: [
        // PRIMARY
        l.primary
          ? [
              l.primary.weaponKey,
              compactMods(l.primary.mods),
              l.primary.preset ?? 0,
            ]
          : null,

        // SECONDARY
        l.secondary
          ? [
              l.secondary.weaponKey,
              compactMods(l.secondary.mods),
              l.secondary.preset ?? 0,
            ]
          : null,

        l.deployable,
        l.throwable,
        l.tool,
        l.overkill,
        [l.armor.key, l.armor.plates],
      ],

      s: compactSkills,
    };

    return compressToEncodedURIComponent(JSON.stringify(compact));
  } catch (err) {
    console.warn("Failed to encode build", err);
    return null;
  }
}

/* ===============================
   DECODE
================================ */

export function decodeBuildFromUrl(encoded) {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;

    const parsed = JSON.parse(json);

    if (!parsed || parsed.v !== DEFAULT_BUILD.version) {
      return null;
    }

    /* ---------- Skills ---------- */

    const skills = {};

    for (const [index, level] of parsed.s || []) {
      const key = indexToKey[index];
      if (!key) continue;

      skills[key] = {
        base: true,
        aced: level === 2,
      };
    }

    /* ---------- Loadout ---------- */

    const [
      primary,
      secondary,
      deployable,
      throwable,
      tool,
      overkill,
      armor,
    ] = parsed.l;

    return {
      ...DEFAULT_BUILD,
      id: parsed.i ?? null,
      version: parsed.v,
      name: parsed.n,

      loadout: {
        primary: primary
          ? {
              weaponKey: primary[0],
              mods: reconstructMods(primary[1]),
              preset: primary[2],
            }
          : null,

        secondary: secondary
          ? {
              weaponKey: secondary[0],
              mods: reconstructMods(secondary[1]),
              preset: secondary[2],
            }
          : null,

        deployable,
        throwable,
        tool,
        overkill,

        armor: {
          key: armor[0],
          plates: armor[1],
        },
      },

      skills,
    };
  } catch (err) {
    console.warn("Failed to decode build", err);
    return null;
  }
}