import assert from 'node:assert/strict';
import { test } from 'node:test';
import { generateChallengeSet, rerollChallengeAt } from '../src/challenges/utils/challengeGenerator.js';
import { restoreChallengeSession } from '../src/challenges/utils/dossierSession.js';

const ids = generateChallengeSet(3);

test('persistencia: recuerda carpetas abiertas y cerradas sin cambiar el conjunto', () => {
  const persisted = JSON.stringify({ version: 1, count: 3, generatedCount: 3, ids, opened: [true, false, true] });
  assert.deepEqual(restoreChallengeSession(persisted), { count: 3, ids, opened: [true, false, true] });
});

test('compatibilidad v1.1: el conjunto anterior se conserva visible', () => {
  const previous = JSON.stringify({ version: 1, count: 3, generatedCount: 3, ids });
  assert.deepEqual(restoreChallengeSession(previous), { count: 3, ids, opened: [true, true, true] });
});

test('rechaza sesiones corruptas o incompatibles sin romper la pantalla', () => {
  for (const bad of [null, 'bad json', '{}', JSON.stringify({ version: 2, count: 1, ids: [] }),
    JSON.stringify({ version: 1, count: 3, generatedCount: 3, ids: ['unknown'] }),
    JSON.stringify({ version: 1, count: 3, generatedCount: 2, ids }),
  ]) assert.equal(restoreChallengeSession(bad), null);
  const invalidOpened = JSON.stringify({ version: 1, count: 3, generatedCount: 3, ids, opened: [false] });
  assert.deepEqual(restoreChallengeSession(invalidOpened)?.opened, [true, true, true]);
});

test('reroll: la nueva orden es distinta, compatible y el resto permanece intacto', () => {
  const previous = generateChallengeSet(3);
  const next = rerollChallengeAt(previous, 1);
  assert.notEqual(next[1], previous[1]);
  assert.equal(next[0], previous[0]);
  assert.equal(next[2], previous[2]);
  // La UI puede revelar únicamente la posición reemplazada (reissue opened).
  const opened = [true, false, true];
  const newOpened = opened.map((value, index) => index === 1 ? true : value);
  assert.deepEqual(newOpened, [true, true, true]);
});
