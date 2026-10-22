// Challenge Mode: las reglas son autoimpuestas; la aplicación no comprueba su cumplimiento.
// Cada ID representa siempre un único título y una única regla (sin variantes aleatorias).
// Los conflictos y solapamientos se gestionan en challengeCompatibility.js.

export const CHALLENGES = Object.freeze([
  // Weapons & Combat
  { id: 'no-primary-damage', title: 'No Primary Damage', description: 'Do not deal damage with your Primary Weapon.', category: 'combat' },
  { id: 'no-secondary-damage', title: 'No Secondary Damage', description: 'Do not deal damage with your Secondary Weapon.', category: 'combat' },
  { id: 'hipfire-hero', title: 'Hipfire Hero', description: 'Fire your weapons without using ADS.', category: 'combat' },
  { id: 'eyes-on-target', title: 'Eyes on Target', description: 'Only fire your weapons while aiming down sights (ADS).', category: 'combat' },
  { id: 'trigger-discipline', title: 'Trigger Discipline', description: 'Reload only when your magazine is empty.', category: 'combat' },
  { id: 'no-close-combat', title: 'No Close Combat', description: 'Do not use melee attacks.', category: 'combat' },
  { id: 'melee-only', title: 'Melee Only', description: 'Deal damage exclusively with melee attacks.', category: 'combat' },
  { id: 'head-hunter', title: 'Head Hunter', description: 'Every firearm kill against a human enemy must be a headshot.', category: 'combat' },
  { id: 'center-mass', title: 'Center Mass', description: 'Do not kill enemies with headshots.', category: 'combat' },
  { id: 'switch-hitter', title: 'Switch Hitter', description: 'Empty the magazine of your current Primary or Secondary Weapon before switching to the other, and keep alternating.', category: 'combat' },
  { id: 'slow-and-steady', title: 'Slow and Steady', description: 'Do not sprint.', category: 'combat' },
  { id: 'stand-tall', title: 'Stand Tall', description: 'Do not crouch.', category: 'combat' },
  { id: 'no-human-shield', title: 'No Human Shield', description: 'Do not use enemies as human shields.', category: 'combat' },
  { id: 'no-spotting', title: 'No Spotting', description: 'Do not mark enemies.', category: 'combat' },

  // Equipment & Resources
  { id: 'no-heavy-backup', title: 'No Heavy Backup', description: 'Do not use Overkill Weapons.', category: 'equipment' },
  { id: 'empty-pockets', title: 'Empty Pockets', description: 'Do not use Throwables.', category: 'equipment' },
  { id: 'no-safety-net', title: 'No Safety Net', description: 'Do not equip an Armor Bag.', category: 'equipment' },
  { id: 'field-medicine', title: 'Field Medicine', description: 'Do not equip a Medic Bag.', category: 'equipment' },
  { id: 'ammo-discipline', title: 'Ammo Discipline', description: 'Do not equip an Ammo Bag.', category: 'equipment' },
  { id: 'no-turrets', title: 'No Turrets', description: 'Do not equip a Sentry Turret.', category: 'equipment' },
  { id: 'no-recon', title: 'No Recon', description: 'Do not use Tools.', category: 'equipment' },
  { id: 'bare-steel', title: 'Bare Steel', description: 'Use your Primary and Secondary Weapons without attachment modifications.', category: 'equipment' },
  { id: 'knife-time', title: 'Knife Time', description: 'Get at least one kill with a Throwing Knife.', category: 'equipment' },
  { id: 'frag-out', title: 'Frag Out', description: 'Get at least one kill with a Frag Grenade.', category: 'equipment' },
  { id: 'turret-operator', title: 'Turret Operator', description: 'Get at least one kill with your Sentry Turret.', category: 'equipment' },
  { id: 'no-resupply', title: 'No Resupply', description: 'Do not replenish ammunition from Ammo Bags, including those placed by teammates.', category: 'equipment' },
  { id: 'armor-purist', title: 'Armor Purist', description: 'Equip only Resistant Plates.', category: 'equipment' },
  { id: 'adaptive-only', title: 'Adaptive Only', description: 'Equip only Adaptive Plates.', category: 'equipment' },
  { id: 'impact-only', title: 'Impact Only', description: 'Equip only Impact Plates.', category: 'equipment' },
  { id: 'patchwork-armor', title: 'Patchwork Armor', description: 'Equip an Armor Frame with at least two different types of Armor Plates.', category: 'equipment' },
  { id: 'full-plating', title: 'Full Plating', description: 'Equip at least one Resistant Plate, one Impact Plate, and one Adaptive Plate in the same Armor Frame.', category: 'equipment' },

  // Skills & Builds
  // PIN: revisar Minimalist (30 puntos) y Ace Collector (18 Aced) tras probar en el juego.
  { id: 'minimalist', title: 'Minimalist', description: 'Use no more than 30 Skill Points.', category: 'skills' },
  { id: 'no-aces', title: 'No Aces', description: 'Do not equip any Aced skills.', category: 'skills' },
  { id: 'no-top-tier', title: 'No Top Tier', description: 'Do not equip any Tier 4 skills.', category: 'skills' },
  { id: 'jack-of-all-trades', title: 'Jack of All Trades', description: 'Equip at least three skills from each of four different Skill Groups.', category: 'skills' },
  { id: 'full-spectrum', title: 'Full Spectrum', description: 'Equip at least two skills from each of the six Skill Groups.', category: 'skills' },
  { id: 'ace-collector', title: 'Ace Collector', description: 'Equip at least 18 Aced skills.', category: 'skills' },
  { id: 'even-spread', title: 'Even Spread', description: 'Spend no more than 10 Skill Points in any single Skill Group.', category: 'skills' },
  { id: 'burden-free', title: 'Burden Free', description: 'Do not equip Beast of Burden.', category: 'skills' },
  { id: 'top-shelf', title: 'Top Shelf', description: 'Equip at least three different Tier 4 skills.', category: 'skills' },
  { id: 'no-crutches', title: 'No Crutches', description: 'Do not equip Beast of Burden, Flow State, or Dodge This.', category: 'skills' },
  { id: 'concentrated-power', title: 'Concentrated Power', description: 'Do not equip more than 30 skills.', category: 'skills' },
  { id: 'triple-threat', title: 'Triple Threat', description: 'Equip at least three Tier 4 skills, each from a different Skill Group.', category: 'skills' },
  { id: 'ace-across-the-board', title: 'Ace Across the Board', description: 'Equip Aced skills from at least four different Skill Groups.', category: 'skills' },
]);

export const CHALLENGE_BY_ID = Object.freeze(Object.fromEntries(CHALLENGES.map((challenge) => [challenge.id, challenge])));
export const CHALLENGE_COUNT_OPTIONS = Object.freeze([1, 2, 3]);
