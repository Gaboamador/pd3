import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SHORT_LINK_NAME_LIMIT,
  createPublicBuildSnapshot,
  isValidPublicBuildSnapshot,
  isValidShortBuildId,
  stableBuildString,
  toBuildSlug,
} from '../src/build/share/shortBuildLinks.utils.js';

test('normalización de nombres complejos / caracteres especiales / Unicode', () => {
  assert.equal(toBuildSlug('Joy (Sentry: AR) "Turret Main"'), 'joy-sentry-ar-turret-main');
  assert.equal(toBuildSlug('Shadow Siphon Vampire ALTERNATIVE'), 'shadow-siphon-vampire-alternative');
  assert.equal(toBuildSlug('Ángel\'s SMG + Shotgun!'), 'angels-smg-shotgun');
  assert.equal(toBuildSlug('LOUD / TANK [OVERKILL]'), 'loud-tank-overkill');
  assert.equal(toBuildSlug('   Shadow   Siphon   '), 'shadow-siphon');
  assert.equal(toBuildSlug('!!!'), 'unnamed-build');
  assert.equal(toBuildSlug(''), 'unnamed-build');
  assert.equal(toBuildSlug(undefined), 'unnamed-build');
  assert.equal(toBuildSlug('   café /  déjà vu  '), 'cafe-deja-vu');
});

test('límite de 40 caracteres, sin guion final ni ID del autor', () => {
  const slug = toBuildSlug('Very Long Build Name With Many Words And (Special) Characters 2026');
  assert.ok(slug.length <= SHORT_LINK_NAME_LIMIT);
  assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.equal(toBuildSlug('a'.repeat(40) + ' !!!'), 'a'.repeat(40));
  assert.equal(toBuildSlug('a'.repeat(39) + '-ok'), 'a'.repeat(39));
});

test('validación de IDs de enlace corto legibles', () => {
  assert.equal(isValidShortBuildId('joy-sentry-ar-turret-main-a7b8c9d0e1f2'), true);
  assert.equal(isValidShortBuildId('unnamed-build-a7b8c9d0e1f2'), true);
  assert.equal(isValidShortBuildId('name-short'), false);
  assert.equal(isValidShortBuildId('name-../a7b8c9d0e1f2'), false);
  assert.equal(isValidShortBuildId('a'.repeat(41) + '-a7b8c9d0e1f2'), false);
});

test('snapshot preserva loadout, perks, overkillConfig y keys de skills sin datos de biblioteca', () => {
  const source = {
    id: 'private-id', slot: 5, uid: 'private-uid', __shared: false,
    name: 'Joy (Sentry: AR) "Turret Main"', version: 1,
    skills: { z_skill: { base: true, aced: true }, a_skill: { base: true, aced: false } },
    loadout: {
      primary: { weaponKey: 'unknown-p1', preset: 0, mods: { Sight: 'optic-A' }, perk: 'perk-1', extraPrivateField: 'x' },
      secondary: { weaponKey: 'unknown-s1', mods: {}, perk: null },
      overkill: 'overkill-key', overkillConfig: { modA: 'foo' },
      throwable: 'frag', deployable: 'ammo', tool: 'motion',
      armor: { key: 'armor-key', plates: ['plate-key', null] },
      otherPrivateField: true,
    },
    otherPrivateField: 'private',
  };
  const snapshot = createPublicBuildSnapshot(source);
  assert.ok(isValidPublicBuildSnapshot(snapshot));
  assert.equal(snapshot.name, source.name);
  assert.deepEqual(Object.keys(snapshot.skills), ['a_skill', 'z_skill']);
  assert.deepEqual(snapshot.skills.z_skill, { base: true, aced: true });
  assert.equal(snapshot.loadout.primary.perk, 'perk-1');
  assert.deepEqual(snapshot.loadout.primary.mods, { Sight: 'optic-A' });
  assert.deepEqual(snapshot.loadout.overkillConfig, { modA: 'foo' });
  assert.deepEqual(snapshot.loadout.armor.plates, ['plate-key', null]);
  assert.ok(!('id' in snapshot));
  assert.ok(!('slot' in snapshot));
  assert.ok(!('uid' in snapshot));
  assert.ok(!('__shared' in snapshot));
  assert.ok(!('otherPrivateField' in snapshot));
  assert.ok(!('extraPrivateField' in snapshot.loadout.primary));
  assert.ok(!('otherPrivateField' in snapshot.loadout));
});

test('snapshots para builds sin guardar y sin equipamiento; serialización determinista', () => {
  const snapshot = createPublicBuildSnapshot({ skills: {}, name: '', loadout: {} });
  assert.ok(isValidPublicBuildSnapshot(snapshot));
  assert.equal(snapshot.name, '');
  assert.equal(snapshot.loadout.primary, null);
  assert.deepEqual(snapshot.loadout.armor, { key: null, plates: [] });
  assert.equal(stableBuildString({ z: [3, { b: 2, a: 1 }], a: null }),
    stableBuildString({ a: null, z: [3, { a: 1, b: 2 }] }));
  assert.equal(isValidPublicBuildSnapshot({}), false);
  assert.equal(isValidPublicBuildSnapshot({ ...snapshot, version: 99 }), false);
});
