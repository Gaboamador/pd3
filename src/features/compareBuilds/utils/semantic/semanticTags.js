// src/features/compareBuilds/utils/semantic/semanticTags.js

export const TAGS = {
  // Weapons
  AR_DAMAGE: "AR_DAMAGE",
  AR_ACCURACY: "AR_ACCURACY",
  AR_STABILITY: "AR_STABILITY",
  AR_AMMO: "AR_AMMO",

  SMG_DAMAGE: "SMG_DAMAGE",
  SMG_ACCURACY: "SMG_ACCURACY",
  SMG_STABILITY: "SMG_STABILITY",
  SMG_AMMO: "SMG_AMMO",

  SHOTGUN_DAMAGE: "SHOTGUN_DAMAGE",
  SHOTGUN_RELOAD: "SHOTGUN_RELOAD",
  SHOTGUN_SURVIVABILITY: "SHOTGUN_SURVIVABILITY",

  PISTOL_DAMAGE: "PISTOL_DAMAGE",
  PISTOL_ACCURACY: "PISTOL_ACCURACY",
  PISTOL_UTILITY: "PISTOL_UTILITY",
  PISTOL_SURVIVABILITY: "PISTOL_SURVIVABILITY",

  MARKSMAN_AMMO: "MARKSMAN_AMMO",

  // Defense / sustain
  DAMAGE_REDUCTION: "DAMAGE_REDUCTION",
  ARMOR_REGEN: "ARMOR_REGEN",
  HEALTH_MAX: "HEALTH_MAX",
  HEALING: "HEALING",
  DODGE: "DODGE",
  // DOWNS: "DOWNS",
  ARMOR_REPAIR: "ARMOR_REPAIR",

  // Crowd control / throwables
  FLASHBANG: "FLASHBANG",
  FLASHBANG_STUN: "FLASHBANG_STUN",
  FLASHBANG_VULN: "FLASHBANG_VULN",

  SHOCK_GRENADE: "SHOCK_GRENADE",
  SHOCK_STUN: "SHOCK_STUN",
  SHOCK_VULN: "SHOCK_VULN",

  FRAG_GRENADE: "FRAG_GRENADE",
  FRAG_VULN: "FRAG_VULN",

  SMOKE_GRENADE: "SMOKE_GRENADE",
  SMOKE_VULN: "SMOKE_VULN",

  // Stealth / hacking / marking
  MARKING: "MARKING",
  HACKING: "HACKING",
  CAMERA_LOOP: "CAMERA_LOOP",
  STEALTH_UNMASKED: "STEALTH_UNMASKED",

  // Deployables / gadgets
  AMMO_BAG: "AMMO_BAG",
  ARMOR_BAG: "ARMOR_BAG",
  MEDIC_BAG: "MEDIC_BAG",

  TURRET: "TURRET",
  TURRET_DAMAGE: "TURRET_DAMAGE",
  TURRET_HEAT: "TURRET_HEAT",

  // Hostages / carry
  HOSTAGES: "HOSTAGES",
  CARRY: "CARRY",

  // “Resource economy”
  TOOL_RESTORE: "TOOL_RESTORE",
  THROWABLE_RESTORE: "THROWABLE_RESTORE",
  AMMO_ECON: "AMMO_ECON",

  // Nuevos
  ADRENALINE: "ADRENALINE",

  THROWING_KNIFE: "THROWING_KNIFE",
  THROWING_KNIFE_DAMAGE: "THROWING_KNIFE_DAMAGE",

  MARKSMAN_DAMAGE: "MARKSMAN_DAMAGE",
  MARKSMAN_UTILITY: "MARKSMAN_UTILITY",

  ARMOR_PENETRATION: "ARMOR_PENETRATION",

  BLEED: "BLEED",
  GAS_DAMAGE: "GAS_DAMAGE",

  SURVIVABILITY: "SURVIVABILITY",
  MOBILITY: "MOBILITY",
  OBJECTIVE_INTERACTION: "OBJECTIVE_INTERACTION"
};

export const TAG_META = {
  [TAGS.AR_DAMAGE]: { label: "Assault Rifle damage" },
  [TAGS.AR_ACCURACY]: { label: "Assault Rifle accuracy" },
  [TAGS.AR_STABILITY]: { label: "Assault Rifle stability" },
  [TAGS.AR_AMMO]: { label: "Assault Rifle ammo reserve" },

  [TAGS.SMG_DAMAGE]: { label: "SMG damage" },
  [TAGS.SMG_ACCURACY]: { label: "SMG accuracy" },
  [TAGS.SMG_STABILITY]: { label: "SMG stability" },
  [TAGS.SMG_AMMO]: { label: "SMG ammo reserve" },

  [TAGS.SHOTGUN_DAMAGE]: { label: "Shotgun damage" },
  [TAGS.SHOTGUN_RELOAD]: { label: "Shotgun reload" },
  [TAGS.SHOTGUN_SURVIVABILITY]: { label: "Shotgun survivability" },

  [TAGS.PISTOL_DAMAGE]: { label: "Pistol damage" },
  [TAGS.PISTOL_ACCURACY]: { label: "Pistol accuracy" },
  [TAGS.PISTOL_UTILITY]: { label: "Pistol utility" },
  [TAGS.PISTOL_SURVIVABILITY]: { label: "Pistol survivability" },

  [TAGS.MARKSMAN_AMMO]: { label: "Marksman ammo reserve" },

  [TAGS.DAMAGE_REDUCTION]: { label: "Damage reduction" },
  [TAGS.ARMOR_REGEN]: { label: "Armor regeneration" },
  [TAGS.HEALTH_MAX]: { label: "Max health" },
  [TAGS.HEALING]: { label: "Healing" },
  [TAGS.DODGE]: { label: "Dodge" },
  // [TAGS.DOWNS]: { label: "Downs" },
  [TAGS.ARMOR_REPAIR]: { label: "Armor repair" },

  [TAGS.FLASHBANG]: { label: "Flashbang mechanics" },
  [TAGS.FLASHBANG_STUN]: { label: "Flashbang stun duration" },
  [TAGS.FLASHBANG_VULN]: { label: "Flashbang damage vulnerability" },

  [TAGS.SHOCK_GRENADE]: { label: "Shock Grenade mechanics" },
  [TAGS.SHOCK_STUN]: { label: "Shock stun duration" },
  [TAGS.SHOCK_VULN]: { label: "Shock damage vulnerability" },

  [TAGS.FRAG_GRENADE]: { label: "Frag Grenade mechanics" },
  [TAGS.FRAG_VULN]: { label: "Frag damage vulnerability" },

  [TAGS.SMOKE_GRENADE]: { label: "Smoke Grenade mechanics" },
  [TAGS.SMOKE_VULN]: { label: "Smoke damage vulnerability" },

  [TAGS.MARKING]: { label: "Marking" },
  [TAGS.HACKING]: { label: "Hacking / Runtime" },
  [TAGS.CAMERA_LOOP]: { label: "Camera looping" },
  [TAGS.STEALTH_UNMASKED]: { label: "Unmasked stealth" },

  [TAGS.AMMO_BAG]: { label: "Ammo Bag value" },
  [TAGS.ARMOR_BAG]: { label: "Armor Bag value" },
  [TAGS.MEDIC_BAG]: { label: "Medic Bag value" },

  [TAGS.TURRET]: { label: "Sentry Turret value" },
  [TAGS.TURRET_DAMAGE]: { label: "Sentry Turret damage" },
  [TAGS.TURRET_HEAT]: { label: "Sentry Turret heat/overheat control" },

  [TAGS.HOSTAGES]: { label: "Hostages / trading" },
  [TAGS.CARRY]: { label: "Carry / bags" },

  [TAGS.TOOL_RESTORE]: { label: "Tool restore" },
  [TAGS.THROWABLE_RESTORE]: { label: "Throwable restore" },
  [TAGS.AMMO_ECON]: { label: "Ammo economy" },


  [TAGS.ADRENALINE]: { label: "Adrenaline" },

  [TAGS.THROWING_KNIFE]: { label: "Throwing knives" },
  [TAGS.THROWING_KNIFE_DAMAGE]: { label: "Throwing knife damage" },

  [TAGS.MARKSMAN_DAMAGE]: { label: "Marksman rifle damage" },
  [TAGS.MARKSMAN_UTILITY]: { label: "Marksman rifle utility" },

  [TAGS.ARMOR_PENETRATION]: { label: "Armor penetration" },

  [TAGS.BLEED]: { label: "Bleeding" },
  [TAGS.GAS_DAMAGE]: { label: "Gas damage" },

  [TAGS.SURVIVABILITY]: { label: "Survivability" },
  [TAGS.MOBILITY]: { label: "Mobility" },
  [TAGS.OBJECTIVE_INTERACTION]: { label: "Objective interaction speed" }
};