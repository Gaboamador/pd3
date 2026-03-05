import { TAG_META } from "./semanticTags";

/**
 * Derives archetypes and strengths from semantic profile scores.
 */

export function analyzeBuildArchetype(profile) {
  if (!profile || !profile.scoreByTag) {
    return {
      archetypes: [],
      strengths: []
    };
  }

  const entries = Object.entries(profile.scoreByTag);

  if (!entries.length) {
    return {
      archetypes: [],
      strengths: []
    };
  }

  // sort tags by score
  const sorted = entries.sort((a, b) => b[1] - a[1]);

  // strongest tags
  const topTags = sorted.slice(0, 3).map(([tag]) => tag);

  // convert to readable labels
  const strengths = topTags.map(tag => {
    const meta = TAG_META[tag];
    return meta ? meta.label : tag;
  });

  // archetype detection based on strongest tags
  const archetypes = [];

  for (const tag of topTags) {

    if (tag.startsWith("AR_")) {
      if (!archetypes.includes("Assault Rifle")) archetypes.push("Assault Rifle");
    }

    if (tag.startsWith("PISTOL_")) {
      if (!archetypes.includes("Pistol")) archetypes.push("Pistol");
    }

    if (tag.startsWith("SHOTGUN_")) {
      if (!archetypes.includes("Shotgun")) archetypes.push("Shotgun");
    }

    if (tag.startsWith("FLASHBANG")) {
      if (!archetypes.includes("Flashbang Control")) archetypes.push("Flashbang Control");
    }

    if (tag.startsWith("SHOCK")) {
      if (!archetypes.includes("Shock Crowd Control")) archetypes.push("Shock Crowd Control");
    }

    if (tag.startsWith("FRAG")) {
      if (!archetypes.includes("Grenadier")) archetypes.push("Grenadier");
    }

    if (tag.includes("ARMOR") || tag === "DAMAGE_REDUCTION") {
      if (!archetypes.includes("Tank")) archetypes.push("Tank");
    }

    if (tag === "HACKING" || tag === "CAMERA_LOOP" || tag === "STEALTH_UNMASKED") {
      if (!archetypes.includes("Stealth")) archetypes.push("Stealth");
    }

    if (tag === "MEDIC_BAG" || tag === "AMMO_BAG" || tag === "ARMOR_BAG") {
      if (!archetypes.includes("Support")) archetypes.push("Support");
    }

    if (tag.startsWith("TURRET")) {
      if (!archetypes.includes("Turret")) archetypes.push("Turret");
    }
  }

  return {
    archetypes: archetypes.slice(0, 2),
    strengths
  };
}