/**
 * @typedef {Object} SkillState
 * @property {boolean} base
 * @property {boolean} aced
 */

/**
 * @typedef {Object} WeaponSlotState
 * @property {string|null} weaponKey
 * @property {Record<string, number|null>} mods  // mod slots -> mod id
 */

/**
 * @typedef {Object} ArmorState
 * @property {string|null} key
 * @property {string[]} plates  // ordered plate keys
 */

/**
 * @typedef {Object} LoadoutState
 * @property {WeaponSlotState} primary
 * @property {WeaponSlotState} secondary
 * @property {string|null} overkill
 * @property {string|null} throwable
 * @property {string|null} deployable
 * @property {string|null} tool
 * @property {ArmorState} armor
 */

/**
 * @typedef {Object} Build
 * @property {number} version
 * @property {LoadoutState} loadout
 * @property {Record<string, SkillState>} skills
 */

// Archivo de documentación viva; no exporta runtime por defecto.
export {};
