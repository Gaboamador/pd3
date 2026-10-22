import { CHALLENGES, CHALLENGE_COUNT_OPTIONS } from '../data/challenges.js';
import { areChallengesCompatible } from './challengeCompatibility.js';

// Preferimos un conjunto heterogéneo, pero permitimos dos reglas de combate o
// equipamiento cuando son independientes. La restricción de Skills & Builds
// (máximo una) y las incompatibilidades siempre se aplican, sin excepciones.
const DIVERSITY_PREFERENCE = 0.85;

function shuffled(items, random) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function distinctCategories(ids, categories) {
  return new Set(ids.map((id) => categories.get(id))).size;
}

// Backtracking sobre un catálogo pequeño, con prioridad (no cuota) por
// categorías distintas. Nunca sacrifica la validez para obtener variedad.
export function generateChallengeSet(count, { catalog = CHALLENGES, random = Math.random } = {}) {
  if (!CHALLENGE_COUNT_OPTIONS.includes(count)) throw new RangeError('Challenge count must be between 1 and 3.');
  const categories = new Map(catalog.map(({ id, category }) => [id, category]));
  const candidates = shuffled(catalog.map(({ id }) => id), random);
  const favorDiversity = random() < DIVERSITY_PREFERENCE;

  function visit(selected) {
    if (selected.length === count) return selected;
    const alreadySelected = new Set(selected);
    const usedCategories = new Set(selected.map((id) => categories.get(id)));
    const options = candidates.filter((id) => !alreadySelected.has(id));

    if (favorDiversity) {
      // El sort estable conserva el orden sorteado dentro de cada categoría.
      options.sort((a, b) => Number(usedCategories.has(categories.get(a))) - Number(usedCategories.has(categories.get(b))));
    }
    for (const id of options) {
      const next = [...selected, id];
      if (!areChallengesCompatible(next, catalog)) continue;
      const result = visit(next);
      if (result) return result;
    }
    return null;
  }
  return visit([]);
}

export function rerollChallengeAt(selectedIds, index, { catalog = CHALLENGES, random = Math.random } = {}) {
  if (!Array.isArray(selectedIds) || !Number.isInteger(index) || index < 0 || index >= selectedIds.length) return null;
  const categories = new Map(catalog.map(({ id, category }) => [id, category]));
  const current = selectedIds[index];
  let alternatives = catalog
    .map(({ id }) => id)
    .filter((id) => id !== current && !selectedIds.includes(id))
    .filter((id) => areChallengesCompatible(selectedIds.map((selected, i) => i === index ? id : selected), catalog));
  if (!alternatives.length) return null;

  if (random() < DIVERSITY_PREFERENCE) {
    const best = Math.max(...alternatives.map((id) => distinctCategories(selectedIds.map((selected, i) => i === index ? id : selected), categories)));
    alternatives = alternatives.filter((id) => distinctCategories(selectedIds.map((selected, i) => i === index ? id : selected), categories) === best);
  }
  const picked = alternatives[Math.min(alternatives.length - 1, Math.max(0, Math.floor(random() * alternatives.length)))];
  return selectedIds.map((id, i) => i === index ? picked : id);
}

export function isValidChallengeSet(ids, catalog = CHALLENGES) {
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3) return false;
  const known = new Set(catalog.map(({ id }) => id));
  return ids.every((id) => typeof id === 'string' && known.has(id)) && areChallengesCompatible(ids, catalog);
}
