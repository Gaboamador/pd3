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
  PISTOL_AMMO: "PISTOL_AMMO",

  MARKSMAN_DAMAGE: "MARKSMAN_DAMAGE",
  MARKSMAN_UTILITY: "MARKSMAN_UTILITY",
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

  THROWING_KNIFE: "THROWING_KNIFE",
  THROWING_KNIFE_DAMAGE: "THROWING_KNIFE_DAMAGE",

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

  ARMOR_PENETRATION: "ARMOR_PENETRATION",

  BLEED: "BLEED",
  GAS_DAMAGE: "GAS_DAMAGE",

  SURVIVABILITY: "SURVIVABILITY",
  MOBILITY: "MOBILITY",
  OBJECTIVE_INTERACTION: "OBJECTIVE_INTERACTION"
};

export const TAG_META = {
  [TAGS.AR_DAMAGE]: { labelKey: "compare.tags.ar-damage" },
  [TAGS.AR_ACCURACY]: { labelKey: "compare.tags.ar-accuracy" },
  [TAGS.AR_STABILITY]: { labelKey: "compare.tags.ar-stability" },
  [TAGS.AR_AMMO]: { labelKey: "compare.tags.ar-ammo" },

  [TAGS.SMG_DAMAGE]: { labelKey: "compare.tags.smg-damage" },
  [TAGS.SMG_ACCURACY]: { labelKey: "compare.tags.smg-accuracy" },
  [TAGS.SMG_STABILITY]: { labelKey: "compare.tags.smg-stability" },
  [TAGS.SMG_AMMO]: { labelKey: "compare.tags.smg-ammo" },

  [TAGS.SHOTGUN_DAMAGE]: { labelKey: "compare.tags.shotgun-damage" },
  [TAGS.SHOTGUN_RELOAD]: { labelKey: "compare.tags.shotgun-reload" },
  [TAGS.SHOTGUN_SURVIVABILITY]: { labelKey: "compare.tags.shotgun-survivability" },

  [TAGS.PISTOL_DAMAGE]: { labelKey: "compare.tags.handgun-damage" },
  [TAGS.PISTOL_ACCURACY]: { labelKey: "compare.tags.handgun-accuracy" },
  [TAGS.PISTOL_UTILITY]: { labelKey: "compare.tags.handgun-utility" },
  [TAGS.PISTOL_SURVIVABILITY]: { labelKey: "compare.tags.handgun-survivability" },
  [TAGS.PISTOL_AMMO]: {labelKey: "compare.tags.handgun-ammo"},

  [TAGS.MARKSMAN_DAMAGE]: { labelKey: "compare.tags.marksman-damage" },
  [TAGS.MARKSMAN_UTILITY]: { labelKey: "compare.tags.marksman-utility" },
  [TAGS.MARKSMAN_AMMO]: { labelKey: "compare.tags.marksman-ammo" },

  [TAGS.DAMAGE_REDUCTION]: { labelKey: "compare.tags.damage-reduction" },
  [TAGS.ARMOR_REGEN]: { labelKey: "compare.tags.armor-regen" },
  [TAGS.HEALTH_MAX]: { labelKey: "compare.tags.max-health" },
  [TAGS.HEALING]: { labelKey: "compare.tags.healing" },
  [TAGS.DODGE]: { labelKey: "compare.tags.dodge" },
  [TAGS.ARMOR_REPAIR]: { labelKey: "compare.tags.armor-repair" },

  [TAGS.FLASHBANG]: { labelKey: "compare.tags.flash-mechanic" },
  [TAGS.FLASHBANG_STUN]: { labelKey: "compare.tags.flash-stun" },
  [TAGS.FLASHBANG_VULN]: { labelKey: "compare.tags.flash-damage-vulnerability" },

  [TAGS.SHOCK_GRENADE]: { labelKey: "compare.tags.shock-mechanic" },
  [TAGS.SHOCK_STUN]: { labelKey: "compare.tags.shock-stun" },
  [TAGS.SHOCK_VULN]: { labelKey: "compare.tags.shock-damage-vulnerability" },

  [TAGS.FRAG_GRENADE]: { labelKey: "compare.tags.frag-mechanic" },
  [TAGS.FRAG_VULN]: { labelKey: "compare.tags.frag-damage-vulnerability" },

  [TAGS.SMOKE_GRENADE]: { labelKey: "compare.tags.smoke-mechanic" },
  [TAGS.SMOKE_VULN]: { labelKey: "compare.tags.smoke-damage-vulnerability" },

  [TAGS.THROWING_KNIFE]: { labelKey: "compare.tags.throwing-knife-mechanic" },
  [TAGS.THROWING_KNIFE_DAMAGE]: { labelKey: "compare.tags.throwing-knife-damage" },

  [TAGS.MARKING]: { labelKey: "compare.tags.marking" },
  [TAGS.HACKING]: { labelKey: "compare.tags.hacking" },
  [TAGS.CAMERA_LOOP]: { labelKey: "compare.tags.hacking-camera" },
  [TAGS.STEALTH_UNMASKED]: { labelKey: "compare.tags.stealth" },

  [TAGS.AMMO_BAG]: { labelKey: "compare.tags.ammo-bag" },
  [TAGS.ARMOR_BAG]: { labelKey: "compare.tags.armor-bag" },
  [TAGS.MEDIC_BAG]: { labelKey: "compare.tags.medic-bag" },

  [TAGS.TURRET]: { labelKey: "compare.tags.sentry-value" },
  [TAGS.TURRET_DAMAGE]: { labelKey: "compare.tags.sentry-damage" },
  [TAGS.TURRET_HEAT]: { labelKey: "compare.tags.sentry-sustain" },

  [TAGS.HOSTAGES]: { labelKey: "compare.tags.hostages" },
  [TAGS.CARRY]: { labelKey: "compare.tags.carry" },

  [TAGS.TOOL_RESTORE]: { labelKey: "compare.tags.tool-restore" },
  [TAGS.THROWABLE_RESTORE]: { labelKey: "compare.tags.throwable-restore" },
  [TAGS.AMMO_ECON]: { labelKey: "compare.tags.ammo-economy" },

  [TAGS.ADRENALINE]: { labelKey: "compare.tags.adrenaline" },

  [TAGS.ARMOR_PENETRATION]: { labelKey: "compare.tags.armor-penetration" },

  [TAGS.BLEED]: { labelKey: "compare.tags.bleeding" },
  [TAGS.GAS_DAMAGE]: { labelKey: "compare.tags.poison" },

  [TAGS.SURVIVABILITY]: { labelKey: "compare.tags.survivability" },
  [TAGS.MOBILITY]: { labelKey: "compare.tags.mobility" },
  [TAGS.OBJECTIVE_INTERACTION]: { labelKey: "compare.tags.interaction-speed" }
};