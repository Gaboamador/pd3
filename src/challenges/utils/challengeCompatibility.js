import { CHALLENGES } from '../data/challenges.js';

// Incompatibilidades: reglas contradictorias O redundantes (una subsume a la otra).
// Las parejas son simétricas; basta con declararlas una sola vez.
// Nunca confundimos "no equipar" con "no utilizar" si las reglas agregan restricciones diferentes.
export const INCOMPATIBLE_PAIRS = Object.freeze([
  ['no-primary-damage', 'switch-hitter'],
  ['no-secondary-damage', 'switch-hitter'],
  ['no-primary-damage', 'melee-only'],
  ['no-secondary-damage', 'melee-only'],
  ['hipfire-hero', 'eyes-on-target'],
  ['hipfire-hero', 'melee-only'],
  ['eyes-on-target', 'melee-only'],
  ['trigger-discipline', 'melee-only'],
  ['switch-hitter', 'melee-only'],
  ['no-close-combat', 'melee-only'],
  ['head-hunter', 'center-mass'],
  ['head-hunter', 'melee-only'],
  ['center-mass', 'melee-only'],
  ['bare-steel', 'melee-only'],
  ['no-heavy-backup', 'melee-only'],

  ['empty-pockets', 'knife-time'],
  ['empty-pockets', 'frag-out'],
  ['melee-only', 'knife-time'],
  ['melee-only', 'frag-out'],
  ['melee-only', 'turret-operator'],
  ['no-turrets', 'turret-operator'],

  // Dos prohibiciones de equipar Deployables generan una combinación poco variada.
  ['no-safety-net', 'field-medicine'],
  ['no-safety-net', 'ammo-discipline'],
  ['no-safety-net', 'no-turrets'],
  ['field-medicine', 'ammo-discipline'],
  ['field-medicine', 'no-turrets'],
  ['ammo-discipline', 'no-turrets'],

  ['armor-purist', 'adaptive-only'],
  ['armor-purist', 'impact-only'],
  ['adaptive-only', 'impact-only'],
  ['armor-purist', 'patchwork-armor'],
  ['adaptive-only', 'patchwork-armor'],
  ['impact-only', 'patchwork-armor'],
  ['armor-purist', 'full-plating'],
  ['adaptive-only', 'full-plating'],
  ['impact-only', 'full-plating'],
  ['patchwork-armor', 'full-plating'],

  ['minimalist', 'ace-collector'], // 18 Aced requieren al menos 36 Skill Points.
  ['no-aces', 'ace-collector'],
  ['no-aces', 'ace-across-the-board'],
  ['no-top-tier', 'top-shelf'],
  ['no-top-tier', 'triple-threat'],
  ['burden-free', 'no-crutches'],
  ['top-shelf', 'triple-threat'],
  ['concentrated-power', 'ace-collector'], // 18 Aced son 36 skills contadas Base + Aced.
]);

// Para futuras reglas: restricciones que solo aparecen al combinar 3 challenges.
// El motor verifica estas ternas además de todas las parejas.
export const INCOMPATIBLE_TRIPLES = Object.freeze([
  // 3 Tier 4 en grupos distintos requieren al menos 30 puntos (10 por grupo).
  // Cualquier cuarto grupo con skills, o un Aced de un cuarto grupo, supera Minimalist.
  ['minimalist', 'triple-threat', 'jack-of-all-trades'],
  ['minimalist', 'triple-threat', 'full-spectrum'],
  ['minimalist', 'triple-threat', 'ace-across-the-board'],
  // 3 Tier 4 en grupos distintos ocupan al menos 27 skills contadas;
  // Full Spectrum requiere otras 6 selecciones en los otros 3 grupos.
  ['concentrated-power', 'triple-threat', 'full-spectrum'],
]);

const pairKey = (a, b) => [a, b].sort().join('|');
const PAIR_KEYS = new Set(INCOMPATIBLE_PAIRS.map(([a, b]) => pairKey(a, b)));

export function areChallengesCompatible(ids, catalog = null) {
  // Restricción de variedad: nunca más de un challenge de Skills & Builds.
  // El catálogo opcional permite validar también las pruebas con catálogos reducidos.
  const categories = new Map((catalog ?? CHALLENGES).map(({ id, category }) => [id, category]));
  if (ids.filter((id) => categories.get(id) === 'skills').length > 1) return false;
  if (new Set(ids).size !== ids.length) return false;
  for (let i = 0; i < ids.length; i += 1) {
    for (let j = i + 1; j < ids.length; j += 1) {
      if (PAIR_KEYS.has(pairKey(ids[i], ids[j]))) return false;
    }
  }
  return !INCOMPATIBLE_TRIPLES.some((triple) => triple.every((id) => ids.includes(id)));
}
