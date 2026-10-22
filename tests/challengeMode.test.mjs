import assert from 'node:assert/strict';
import { test } from 'node:test';
import { CHALLENGES, CHALLENGE_BY_ID } from '../src/challenges/data/challenges.js';
import { areChallengesCompatible, INCOMPATIBLE_PAIRS, INCOMPATIBLE_TRIPLES } from '../src/challenges/utils/challengeCompatibility.js';
import { generateChallengeSet, isValidChallengeSet, rerollChallengeAt } from '../src/challenges/utils/challengeGenerator.js';

const ids = CHALLENGES.map(({ id }) => id);

test('44 desafíos aprobados: IDs únicos, descripciones y categorías', () => {
  assert.equal(CHALLENGES.length, 44);
  assert.equal(new Set(ids).size, 44);
  assert.deepEqual(CHALLENGES.reduce((count, { category }) => ({ ...count, [category]: (count[category] || 0) + 1 }), {}), {
    combat: 14, equipment: 17, skills: 13,
  });
  for (const challenge of CHALLENGES) {
    assert.ok(challenge.title.trim().length > 3, challenge.id);
    assert.ok(challenge.description.trim().length > 12, challenge.id);
  }
  assert.equal(CHALLENGE_BY_ID['concentrated-power'].description, 'Do not equip more than 30 skills.');
  assert.equal(CHALLENGE_BY_ID['top-shelf'].description, 'Equip at least three different Tier 4 skills.');
  assert.equal(CHALLENGE_BY_ID['jack-of-all-trades'].description, 'Equip at least three skills from each of four different Skill Groups.');
  assert.equal(CHALLENGE_BY_ID['full-spectrum'].description, 'Equip at least two skills from each of the six Skill Groups.');
  assert.equal(CHALLENGE_BY_ID['ace-collector'].description, 'Equip at least 18 Aced skills.');
});

test('incompatibilidades bien referenciadas, no duplicadas ni autorreferenciales', () => {
  const seen = new Set();
  for (const [a, b] of INCOMPATIBLE_PAIRS) {
    assert.ok(CHALLENGE_BY_ID[a], a);
    assert.ok(CHALLENGE_BY_ID[b], b);
    assert.notEqual(a, b);
    const key = [a, b].sort().join('|');
    assert.ok(!seen.has(key), `Duplicate: ${key}`);
    seen.add(key);
    assert.equal(areChallengesCompatible([a, b]), false);
    assert.equal(areChallengesCompatible([b, a]), false);
  }
  for (const triple of INCOMPATIBLE_TRIPLES) {
    assert.equal(triple.length, 3);
    assert.ok(triple.every(id => CHALLENGE_BY_ID[id]));
    assert.equal(areChallengesCompatible(triple), false);
  }
});

test('reglas particulares acordadas: contradicciones y redundancias', () => {
  for (const [a, b] of [
    ['burden-free', 'no-crutches'],
    ['no-top-tier', 'triple-threat'],
    ['top-shelf', 'triple-threat'],
    ['no-aces', 'ace-collector'],
    ['concentrated-power', 'ace-collector'],
    ['minimalist', 'ace-collector'],
    ['melee-only', 'no-close-combat'],
    ['hipfire-hero', 'eyes-on-target'],
    ['no-turrets', 'turret-operator'],
    ['empty-pockets', 'knife-time'],
    ['empty-pockets', 'frag-out'],
    ['full-plating', 'patchwork-armor'],
    ['armor-purist', 'impact-only'],
  ]) assert.equal(areChallengesCompatible([a, b]), false, `${a} - ${b}`);

  // Las dos prohibiciones de daño se pueden cumplir usando melee, Throwables u Overkill.
  assert.equal(areChallengesCompatible(['no-primary-damage', 'no-secondary-damage']), true);
  // Prohibir equipar Ammo Bag NO prohíbe utilizar la de compañeros.
  assert.equal(areChallengesCompatible(['ammo-discipline', 'no-resupply']), true);
  // Challenge Mode no ofrece más de una restricción de Skills & Builds.
  assert.equal(areChallengesCompatible(['jack-of-all-trades', 'full-spectrum', 'concentrated-power']), false);
  assert.equal(areChallengesCompatible(['minimalist', 'triple-threat']), false); // Ambas son de Skills & Builds.
  assert.equal(areChallengesCompatible(['concentrated-power', 'triple-threat', 'full-spectrum']), false);
  assert.equal(areChallengesCompatible(['minimalist', 'triple-threat', 'ace-across-the-board']), false);
});

test('genera entre 1 y 3 desafíos compatibles, sin repetición', () => {
  for (let count = 1; count <= 3; count += 1) {
    for (let i = 0; i < 800; i += 1) {
      const selected = generateChallengeSet(count);
      assert.equal(selected.length, count);
      assert.ok(isValidChallengeSet(selected));
    }
  }
  for (const badCount of [0, 4, -1, 1.5, null]) {
    assert.throws(() => generateChallengeSet(badCount), RangeError);
  }
});

test('reroll individual: conserva las demás reglas, evita la anterior y respeta compatibilidad', () => {
  for (let i = 0; i < 600; i += 1) {
    const previous = generateChallengeSet(3);
    const index = i % 3;
    const next = rerollChallengeAt(previous, index);
    assert.ok(next);
    assert.equal(next.length, 3);
    assert.notEqual(next[index], previous[index]);
    assert.ok(isValidChallengeSet(next));
    for (let j = 0; j < 3; j += 1) {
      if (index !== j) assert.equal(next[j], previous[j]);
    }
  }
});

test('reroll sin alternativas y entradas inválidas no alteran el conjunto', () => {
  const tinyCatalog = [CHALLENGE_BY_ID['no-primary-damage']];
  assert.deepEqual(generateChallengeSet(1, { catalog: tinyCatalog }), ['no-primary-damage']);
  assert.equal(rerollChallengeAt(['no-primary-damage'], 0, { catalog: tinyCatalog }), null);
  assert.equal(generateChallengeSet(2, { catalog: tinyCatalog }), null);
  assert.equal(rerollChallengeAt(['no-primary-damage'], -1), null);
  assert.equal(rerollChallengeAt(['no-primary-damage'], 1), null);
  assert.equal(isValidChallengeSet(['no-primary-damage', 'no-primary-damage']), false);
  assert.equal(isValidChallengeSet(['invalid-id']), false);
});

test('generación recupera una solución después de encontrar una rama bloqueada', () => {
  const catalog = [
    CHALLENGE_BY_ID['hipfire-hero'],
    CHALLENGE_BY_ID['eyes-on-target'],
    CHALLENGE_BY_ID['melee-only'],
  ];
  // Cada candidato está excluido de los otros: no existe un conjunto válido de 2.
  assert.equal(generateChallengeSet(2, { catalog, random: () => 0.99 }), null);
  const valid = generateChallengeSet(2, { catalog: [
    ...catalog, CHALLENGE_BY_ID['stand-tall'],
  ], random: () => 0.99 });
  assert.ok(isValidChallengeSet(valid));
});


test('a lo sumo una regla de Skills & Builds en la generación y en cada reroll', () => {
  const skillIds = new Set(CHALLENGES.filter(({ category }) => category === 'skills').map(({ id }) => id));
  assert.equal(areChallengesCompatible(['minimalist', 'no-aces']), false);
  assert.equal(areChallengesCompatible(['top-shelf', 'full-spectrum']), false);
  for (let count = 1; count <= 3; count += 1) {
    for (let i = 0; i < 1000; i += 1) {
      const generated = generateChallengeSet(count);
      assert.ok(generated.filter(id => skillIds.has(id)).length <= 1);
      for (let index = 0; index < generated.length; index += 1) {
        const next = rerollChallengeAt(generated, index);
        assert.ok(next);
        assert.ok(next.filter(id => skillIds.has(id)).length <= 1);
      }
    }
  }
});

test('prohibiciones de equipar Deployables: una como máximo en cada conjunto', () => {
  const bans = ['no-safety-net', 'field-medicine', 'ammo-discipline', 'no-turrets'];
  for (let i = 0; i < bans.length; i += 1) {
    for (let j = i + 1; j < bans.length; j += 1) {
      assert.equal(areChallengesCompatible([bans[i], bans[j]]), false);
    }
  }
  assert.equal(areChallengesCompatible(['no-safety-net', 'no-spotting']), true);
  assert.equal(areChallengesCompatible(['no-spotting', 'hipfire-hero']), true);
  for (let i = 0; i < 600; i += 1) {
    assert.ok(generateChallengeSet(3).filter(id => bans.includes(id)).length <= 1);
  }
});

test('la diversidad de categorías es preferencia, no obligación', () => {
  const categoryById = new Map(CHALLENGES.map(({ id, category }) => [id, category]));
  let distinctThree = 0;
  const iterations = 600;
  for (let i = 0; i < iterations; i += 1) {
    const drawn = generateChallengeSet(3);
    if (new Set(drawn.map(id => categoryById.get(id))).size === 3) distinctThree += 1;
  }
  assert.ok(distinctThree > iterations * 0.8, `Solo ${distinctThree}/${iterations} combinaciones con tres categorías`);
  // Las combinaciones con dos reglas de combate siguen siendo legales.
  assert.equal(areChallengesCompatible(['no-spotting', 'hipfire-hero']), true);
});

test('reroll mantiene las restricciones y prefiere categorías diferentes', () => {
  const starting = ['no-spotting', 'hipfire-hero', 'minimalist'];
  assert.ok(isValidChallengeSet(starting));
  const result = rerollChallengeAt(starting, 1, { random: () => 0 });
  assert.ok(result);
  assert.equal(result[0], starting[0]);
  assert.equal(result[2], starting[2]);
  assert.notEqual(result[1], starting[1]);
  assert.ok(isValidChallengeSet(result));
  const categories = result.map(id => CHALLENGE_BY_ID[id].category);
  assert.equal(new Set(categories).size, 3);
});
