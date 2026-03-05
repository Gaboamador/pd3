/**
 * Detect build archetype from semantic tag scores.
 * Uses weighted tag groups.
 */

const ARCHETYPE_RULES = {
  assault_rifle: {
    label: "Assault Rifle",
    tags: ["AR_DAMAGE", "AR_ACCURACY", "AR_STABILITY", "AR_AMMO"]
  },

  pistol: {
    label: "Pistol",
    tags: ["PISTOL_DAMAGE", "PISTOL_ACCURACY", "PISTOL_UTILITY"]
  },

  shotgun: {
    label: "Shotgun",
    tags: ["SHOTGUN_DAMAGE", "SHOTGUN_RELOAD"]
  },

  tank: {
    label: "Tank",
    tags: ["DAMAGE_REDUCTION", "ARMOR_REGEN", "ARMOR_REPAIR"]
  },

  stealth: {
    label: "Stealth",
    tags: ["HACKING", "CAMERA_LOOP", "STEALTH_UNMASKED"]
  },

  flashbang: {
    label: "Flashbang Control",
    tags: ["FLASHBANG", "FLASHBANG_STUN", "FLASHBANG_VULN"]
  },

  shock: {
    label: "Shock Crowd Control",
    tags: ["SHOCK_GRENADE", "SHOCK_STUN"]
  },

  grenadier: {
    label: "Grenadier",
    tags: ["FRAG_GRENADE", "FRAG_VULN"]
  },

  support: {
    label: "Support",
    tags: ["MEDIC_BAG", "AMMO_BAG", "ARMOR_BAG"]
  },

  turret: {
    label: "Turret",
    tags: ["TURRET", "TURRET_DAMAGE"]
  }
};

export function detectBuildArchetype(profile) {
  if (!profile || !profile.scoreByTag) return [];

  const scores = [];

  for (const rule of Object.values(ARCHETYPE_RULES)) {
    let total = 0;

    for (const tag of rule.tags) {
      total += profile.scoreByTag[tag] || 0;
    }

    if (total > 0) {
      scores.push({
        label: rule.label,
        score: total
      });
    }
  }

  scores.sort((a, b) => b.score - a.score);

  // return top 2 archetypes
  return scores.slice(0, 2).map(x => x.label);
}