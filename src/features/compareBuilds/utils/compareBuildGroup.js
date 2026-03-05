import { buildSkillSemanticIndex } from "./semantic/buildSkillSemanticIndex";
import { computeBuildSemanticProfile } from "./semantic/computeBuildSemanticProfile";
import { generateSemanticInsights } from "./semantic/generateSemanticInsights";
import { detectBuildArchetype } from "./semantic/detectBuildArchetype";
import { analyzeBuildArchetype } from "./semantic/analyzeBuildArchetype";

/**
 * Compare 2–4 builds (your real schema).
 *
 * Build shape (example):
 * {
 *   id, name, slot, version,
 *   skills: { SkillKey: { base: boolean, aced: boolean }, ... }
 *   loadout: {
 *     primary: { weaponKey, mods: { ... }, preset },
 *     secondary: { weaponKey, mods: { ... }, preset },
 *     overkill: "ThePunch",
 *     throwable: "Flashbang",
 *     deployable: "DoctorBag",
 *     tool: "ECMJammer",
 *     armor: { key: "Suit", plates: ["impact"] }
 *   }
 * }
 */

const MAX_BUILDS = 4;

const LOADOUT_SIMPLE_SLOTS = ["tool", "deployable", "throwable", "overkill"];
const WEAPON_SLOTS = ["primary", "secondary"]; // you can add "overkill" if it ever becomes weapon-like
const ARMOR_SLOT = "armor";

function uniq(arr) {
  return [...new Set(arr)];
}
function isNil(v) {
  return v === null || v === undefined;
}
function stableStringify(obj) {
  if (!obj || typeof obj !== "object") return String(obj);
  const keys = Object.keys(obj).sort();
  const normalized = {};
  for (const k of keys) normalized[k] = obj[k];
  return JSON.stringify(normalized);
}

function getBuildId(build, idx) {
  // For UI, showing slot is convenient; keep id stable but readable.
  // If you prefer "slot 4" labels, you can adjust in UI.
  return build?.id || build?.name || `Build ${idx + 1}`;
}

function getBuildLabel(build, idx) {
  const slot = !isNil(build?.slot) ? `${build.slot} · ` : null;
  const name = build?.name || getBuildId(build, idx);
  return slot ? `${slot} ${name}` : name;
}

function normalizeBuild(raw, idx) {
  const id = getBuildId(raw, idx);
  const label = getBuildLabel(raw, idx);

  const skills = normalizeSkills(raw?.skills || {});
  const loadout = normalizeLoadout(raw?.loadout || {});

  return { id, label, raw, skills, loadout };
}

function normalizeSkills(skillsRaw) {
  // Input: { SkillKey: { base: bool, aced: bool } }
  // Output: { SkillKey: "base" | "aced" }
  const out = {};
  if (!skillsRaw || typeof skillsRaw !== "object") return out;

  for (const [skillKey, state] of Object.entries(skillsRaw)) {
    if (!skillKey) continue;

    // handle weird shapes safely
    if (state === true) {
      out[skillKey] = "base";
      continue;
    }

    if (state && typeof state === "object") {
      const base = !!state.base;
      const aced = !!state.aced;
      if (aced) out[skillKey] = "aced";
      else if (base) out[skillKey] = "base";
    }
  }

  return out;
}

function normalizeLoadout(loadoutRaw) {
  const out = {
    primary: normalizeWeapon(loadoutRaw.primary),
    secondary: normalizeWeapon(loadoutRaw.secondary),
    tool: loadoutRaw.tool ?? null,
    deployable: loadoutRaw.deployable ?? null,
    throwable: loadoutRaw.throwable ?? null,
    overkill: loadoutRaw.overkill ?? null,
    armor: normalizeArmor(loadoutRaw.armor)
  };
  return out;
}

function normalizeWeapon(w) {
  if (!w) return null;
  return {
    weaponKey: w.weaponKey ?? null,
    preset: isNil(w.preset) ? null : w.preset,
    mods: w.mods && typeof w.mods === "object" ? w.mods : {}
  };
}

function normalizeArmor(a) {
  if (!a) return null;
  return {
    key: a.key ?? null,
    plates: Array.isArray(a.plates) ? a.plates.slice() : []
  };
}

function buildSkillNameResolver(skillsData) {
  // skillsData json usually: { SkillKey: { name, key, ... } }
  const map = new Map();
  if (skillsData && typeof skillsData === "object") {
    for (const [k, s] of Object.entries(skillsData)) {
      if (s?.name) map.set(k, s.name);
      if (s?.key && s?.name) map.set(s.key, s.name);
    }
  }
  return (skillKey) => map.get(skillKey) || skillKey;
}

function buildLoadoutNameResolver(loadoutData) {
  // loadoutData is grouped by categories, each item has {key, name}
  const map = new Map();
  if (loadoutData && typeof loadoutData === "object") {
    for (const category of Object.values(loadoutData)) {
      if (!category || typeof category !== "object") continue;
      for (const item of Object.values(category)) {
        if (!item?.key) continue;
        map.set(item.key, item.name || item.key);
      }
    }
  }
  return (key) => (key ? (map.get(key) || key) : null);
}

// ------------------------
// Core diff computations
// ------------------------

function computeSkillDiffs(builds) {
  const buildIds = builds.map(b => b.id);
  const buildCount = builds.length;

  // skillKey -> { owners: [], levels: { [id]: "base"|"aced" } }
  const matrix = {};

  for (const b of builds) {
    for (const [skillKey, level] of Object.entries(b.skills)) {
      if (!matrix[skillKey]) matrix[skillKey] = { owners: [], levels: {} };
      matrix[skillKey].owners.push(b.id);
      matrix[skillKey].levels[b.id] = level;
    }
  }

  const presenceDiff = {};
  const levelDiff = {};

  for (const [skillKey, info] of Object.entries(matrix)) {
    if (info.owners.length !== buildCount) {
      presenceDiff[skillKey] = info;
      continue;
    }
    const levels = buildIds.map(id => info.levels[id] || null).filter(Boolean);
    const distinct = uniq(levels);
    if (distinct.length > 1) levelDiff[skillKey] = info;
  }

  // Unique per build (skills that appear only in one build)
  const uniquePerBuild = {};
  for (const b of builds) uniquePerBuild[b.id] = [];

  for (const [skillKey, info] of Object.entries(presenceDiff)) {
    if (info.owners.length === 1) uniquePerBuild[info.owners[0]].push(skillKey);
  }
  for (const id of Object.keys(uniquePerBuild)) uniquePerBuild[id].sort();

  return { matrix, presenceDiff, levelDiff, uniquePerBuild };
}

function computeSimpleSlotDiffs(builds) {
  // For tool/deployable/throwable/overkill: group by value
  const buildCount = builds.length;
  const perSlot = {};

  for (const slot of LOADOUT_SIMPLE_SLOTS) {
    const grouping = {}; // value -> owners
    for (const b of builds) {
      const value = b.loadout?.[slot] ?? null;
      const key = value || "__NONE__";
      if (!grouping[key]) grouping[key] = [];
      grouping[key].push(b.id);
    }
    const keys = Object.keys(grouping);
    const isUniform = keys.length === 1 && grouping[keys[0]].length === buildCount;
    const isAllNone = keys.length === 1 && keys[0] === "__NONE__";
    if (!isUniform && !isAllNone) perSlot[slot] = grouping;
  }

  return perSlot;
}

function computeArmorDiffs(builds) {
  const buildCount = builds.length;
  const armorGrouping = {}; // armorKey -> owners
  const platesGrouping = {}; // signature -> owners
  let hasAnyArmor = false;
  let hasAnyPlates = false;

  for (const b of builds) {
    const armor = b.loadout?.armor;
    if (armor?.key) hasAnyArmor = true;

    const armorKey = armor?.key || "__NONE__";
    if (!armorGrouping[armorKey]) armorGrouping[armorKey] = [];
    armorGrouping[armorKey].push(b.id);

    const plates = armor?.plates || [];
    if (plates.length) hasAnyPlates = true;
    const sig = plates.length ? plates.join("|") : "__NONE__";
    if (!platesGrouping[sig]) platesGrouping[sig] = [];
    platesGrouping[sig].push(b.id);
  }

  const armorKeys = Object.keys(armorGrouping);
  const armorUniform = armorKeys.length === 1 && armorGrouping[armorKeys[0]].length === buildCount;

  const platesKeys = Object.keys(platesGrouping);
  const platesUniform = platesKeys.length === 1 && platesGrouping[platesKeys[0]].length === buildCount;

  return {
    armor: hasAnyArmor && !armorUniform ? armorGrouping : null,
    plates: hasAnyPlates && !platesUniform ? platesGrouping : null
  };
}

function computeWeaponDiffs(builds) {
  const buildCount = builds.length;
  const result = {};

  for (const slot of WEAPON_SLOTS) {
    const byWeaponKey = {};
    const byPreset = {};
    const byModsSig = {};

    let hasAny = false;

    for (const b of builds) {
      const w = b.loadout?.[slot];
      if (w?.weaponKey) hasAny = true;

      const weaponKey = w?.weaponKey || "__NONE__";
      if (!byWeaponKey[weaponKey]) byWeaponKey[weaponKey] = [];
      byWeaponKey[weaponKey].push(b.id);

      const presetKey = !isNil(w?.preset) ? String(w.preset) : "__NONE__";
      if (!byPreset[presetKey]) byPreset[presetKey] = [];
      byPreset[presetKey].push(b.id);

      const modsSig = w?.mods ? stableStringify(w.mods) : "__NONE__";
      if (!byModsSig[modsSig]) byModsSig[modsSig] = [];
      byModsSig[modsSig].push(b.id);
    }

    if (!hasAny) continue;

    const weaponKeys = Object.keys(byWeaponKey);
    const weaponUniform = weaponKeys.length === 1 && byWeaponKey[weaponKeys[0]].length === buildCount;

    const presetKeys = Object.keys(byPreset);
    const presetUniform = presetKeys.length === 1 && byPreset[presetKeys[0]].length === buildCount;

    const modsKeys = Object.keys(byModsSig);
    const modsUniform = modsKeys.length === 1 && byModsSig[modsKeys[0]].length === buildCount;

    // Only include diffs
    const slotDiff = {};
    if (!weaponUniform) slotDiff.weaponKey = byWeaponKey;
    if (!presetUniform) slotDiff.preset = byPreset;
    if (!modsUniform) slotDiff.mods = byModsSig;

    if (Object.keys(slotDiff).length) result[slot] = slotDiff;
  }

  return result;
}

// ------------------------
// UI rows builders
// ------------------------

function buildSkillRows(skillDiffs, buildIds, resolveSkillName) {
  const rows = [];

  // Presence diffs
  for (const [skillKey, info] of Object.entries(skillDiffs.presenceDiff)) {
    const cells = {};
    for (const id of buildIds) {
      const level = info.levels?.[id] ?? null;
      cells[id] = { present: !!level, level };
    }
    rows.push({
      type: "skill",
      key: skillKey,
      label: resolveSkillName(skillKey),
      kind: "presence",
      cells
    });
  }

  // Level diffs (everyone has it, base/aced differs)
  for (const [skillKey, info] of Object.entries(skillDiffs.levelDiff)) {
    const cells = {};
    for (const id of buildIds) {
      const level = info.levels?.[id] ?? null;
      cells[id] = { present: !!level, level };
    }
    rows.push({
      type: "skill",
      key: skillKey,
      label: resolveSkillName(skillKey),
      kind: "level",
      cells
    });
  }

  rows.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "presence" ? -1 : 1;
    return a.label.localeCompare(b.label);
  });

  return rows;
}

function buildGroupedRowsFromSlotGrouping({ type, slot, grouping, buildIds, labelResolver }) {
  const rows = [];
  for (const [valueKey, owners] of Object.entries(grouping)) {
    const cells = {};
    for (const id of buildIds) cells[id] = { present: owners.includes(id) };

    const rawValue = valueKey === "__NONE__" ? null : valueKey;
    rows.push({
      type,
      slot,
      value: rawValue,
      label: rawValue ? labelResolver(rawValue) : "None",
      owners,
      cells
    });
  }
  rows.sort((a, b) => a.label.localeCompare(b.label));
  return rows;
}

function buildWeaponRows(weaponDiffs, buildIds, resolveItemName) {
  // Return sections for UI:
  // - per slot: weaponKey rows, preset rows, mods signature rows (optional)
  const sections = [];

  for (const [slot, diff] of Object.entries(weaponDiffs)) {
    if (diff.weaponKey) {
      sections.push({
        sectionKey: `${slot}:weaponKey`,
        title: `${slot} weaponKey`,
        rows: buildGroupedRowsFromSlotGrouping({
          type: "weapon",
          slot,
          grouping: diff.weaponKey,
          buildIds,
          labelResolver: resolveItemName
        })
      });
    }

    if (diff.preset) {
      sections.push({
        sectionKey: `${slot}:preset`,
        title: `${slot} preset`,
        rows: buildGroupedRowsFromSlotGrouping({
          type: "weaponPreset",
          slot,
          grouping: diff.preset,
          buildIds,
          labelResolver: (v) => (v === null ? "None" : `Preset ${v}`)
        })
      });
    }

    if (diff.mods) {
      sections.push({
        sectionKey: `${slot}:mods`,
        title: `${slot} mods`,
        rows: buildGroupedRowsFromSlotGrouping({
          type: "weaponMods",
          slot,
          grouping: diff.mods,
          buildIds,
          labelResolver: (sig) => (sig === null ? "None" : sig)
        })
      });
    }
  }

  return sections;
}

// ------------------------
// Public API
// ------------------------

export function compareBuildGroup(rawBuilds, ctx = {}) {
  if (!Array.isArray(rawBuilds) || rawBuilds.length < 2) {
    throw new Error("compareBuildGroup: provide at least 2 builds.");
  }
  if (rawBuilds.length > MAX_BUILDS) {
    throw new Error(`compareBuildGroup: max ${MAX_BUILDS} builds supported.`);
  }

  const builds = rawBuilds.map((b, idx) => normalizeBuild(b, idx));
  const buildIds = builds.map(b => b.id);
    const buildLabels = builds.reduce((acc, b) => {
    acc[b.id] = b.label || "Unnamed build";
    return acc;
    }, {});

  const resolveSkillName = buildSkillNameResolver(ctx.skillsData);
  const resolveItemName = buildLoadoutNameResolver(ctx.loadoutData);
  const resolveArmorName = resolveItemName; // armor keys also live in loadoutData in many setups

  // Diffs
  const skillDiffs = computeSkillDiffs(builds);
  const simpleSlotDiffs = computeSimpleSlotDiffs(builds);
  const armorDiffs = computeArmorDiffs(builds);
  const weaponDiffs = computeWeaponDiffs(builds);
  
  const semanticIndex = buildSkillSemanticIndex(ctx.skillsData);

  const profiles = {};
  for (const b of builds) {
    profiles[b.id] = computeBuildSemanticProfile(b.raw, semanticIndex);
  }

  const semanticInsights = generateSemanticInsights({
    builds,
    buildLabels,
    semanticIndex,
    profiles,
    skillsData: ctx.skillsData
  });

  // UI rows
  const skillRows = buildSkillRows(skillDiffs, buildIds, resolveSkillName);

  const simpleLoadoutSections = Object.entries(simpleSlotDiffs).map(([slot, grouping]) => ({
    sectionKey: `loadout:${slot}`,
    title: slot,
    rows: buildGroupedRowsFromSlotGrouping({
      type: "loadout",
      slot,
      grouping,
      buildIds,
      labelResolver: resolveItemName
    })
  }));

  const armorSections = [];
  if (armorDiffs.armor) {
    armorSections.push({
      sectionKey: `armor:key`,
      title: "armor key",
      rows: buildGroupedRowsFromSlotGrouping({
        type: "armor",
        slot: "armor",
        grouping: armorDiffs.armor,
        buildIds,
        labelResolver: resolveArmorName
      })
    });
  }
  if (armorDiffs.plates) {
    armorSections.push({
      sectionKey: `armor:plates`,
      title: "armor plates",
      rows: buildGroupedRowsFromSlotGrouping({
        type: "plates",
        slot: "armor.plates",
        grouping: armorDiffs.plates,
        buildIds,
        labelResolver: (sig) => (sig === "__NONE__" ? "None" : sig.replaceAll("|", " • "))
      })
    });
  }

  const weaponSections = buildWeaponRows(weaponDiffs, buildIds, resolveItemName);

  // Highlights per build (unique skills + tags)
  const highlights = {};

    for (const id of buildIds) {
    const profile = profiles[id];

    highlights[id] = {
        uniqueSkills: (skillDiffs.uniquePerBuild[id] || []).map(k => ({
        key: k,
        label: resolveSkillName(k),
        level: builds.find(b => b.id === id)?.skills?.[k] ?? null
        })),

        // tags now come from semanticProfiles
        tags: profile
        ? Object.keys(profile.scoreByTag).sort((a, b) =>
            profile.scoreByTag[b] - profile.scoreByTag[a]
            )
        : []
    };
    }

    // Archetypes per build
    const archetypes = {};

    for (const id of buildIds) {
    archetypes[id] = detectBuildArchetype(profiles[id]);
    }

    // Archetypes analysis
    const archetypeAnalysis = {};

    for (const id of buildIds) {
    archetypeAnalysis[id] = analyzeBuildArchetype(profiles[id]);
    }

    // RETURN

  return {
    builds: buildIds,
    buildLabels,
    semanticInsights,
    archetypes,

    // For custom UI
    raw: {
      skillDiffs,
      simpleSlotDiffs,
      armorDiffs,
      weaponDiffs,
      semanticIndex,
      semanticProfiles: profiles
    },

    // Ready-to-render
    sections: [
      { title: "Skills", kind: "skills", rows: skillRows },
    //   ...weaponSections.map(s => ({ title: s.title, kind: "weapons", rows: s.rows })),
    //   ...simpleLoadoutSections.map(s => ({ title: s.title, kind: "loadout", rows: s.rows })),
    //   ...armorSections.map(s => ({ title: s.title, kind: "armor", rows: s.rows }))
    ],

    highlights,

    archetypes: Object.fromEntries(
    Object.entries(archetypeAnalysis).map(([id, a]) => [id, a.archetypes])
    ),

    strengths: Object.fromEntries(
    Object.entries(archetypeAnalysis).map(([id, a]) => [id, a.strengths])
    ),
    
  };
}