import { CHALLENGE_COUNT_OPTIONS } from '../data/challenges.js';
import { isValidChallengeSet } from './challengeGenerator.js';

// Acepta las sesiones v1.1, en las que no se guardaba el estado de apertura.
export function restoreChallengeSession(raw) {
  try {
    if (typeof raw !== 'string') return null;
    const saved = JSON.parse(raw);
    if (!saved || saved.version !== 1 || !CHALLENGE_COUNT_OPTIONS.includes(saved.count)) return null;
    if (!Array.isArray(saved.ids) || saved.ids.length > 3) return null;
    if (saved.ids.length && !isValidChallengeSet(saved.ids)) return null;
    if (saved.ids.length !== saved.generatedCount) return null;
    const opened = Array.isArray(saved.opened)
      && saved.opened.length === saved.ids.length
      && saved.opened.every((value) => typeof value === 'boolean')
      ? saved.opened
      : saved.ids.map(() => true);
    return { count: saved.count, ids: saved.ids, opened };
  } catch {
    return null;
  }
}
