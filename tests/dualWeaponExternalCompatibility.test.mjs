import test from 'node:test';
import assert from 'node:assert/strict';
import loadoutData from '../src/data/payday3_loadout_items.json';
import { getSourceModSlots, resolveAttachmentKey } from '../src/data/weaponAttachments.js';

function weaponByKey(key) {
  return ['primary', 'secondary']
    .flatMap(group => Object.values(loadoutData[group] ?? {}))
    .find(weapon => weapon.key === key);
}

function requireSlots(weaponKey, expected) {
  const weapon = weaponByKey(weaponKey);
  assert.ok(weapon, `${weaponKey}: weapon is missing from loadout items`);
  const slots = getSourceModSlots(weapon);
  assert.deepEqual(
    new Set(slots.map(({ slot }) => slot)),
    new Set(expected),
    `${weaponKey}: missing or unexpected mod categories (check external weapon key/sourceKey)`
  );
  return new Map(slots.map(({ slot, options }) => [slot, options]));
}

test('Dual Outlaw retains its four mod categories and historical attachment IDs', () => {
  const slots = requireSlots('DualOutlaw', ['Barrel', 'BarrelExtension', 'Mag', 'Grip']);
  for (const [slot, modId] of [
    ['Barrel', 'DualOutlaw_Barrel_Ranged'],
    ['Barrel', 'DualOutlaw_Barrel_CQC'],
    ['BarrelExtension', 'BarrelExt_BruteComp'],
    ['Mag', 'DualOutlaw_Mag_Brute'],
    ['Mag', 'DualOutlaw_Mag_Engraved'],
    ['Mag', 'DualOutlaw_Mag_Smooth'],
    ['Grip', 'DualOutlaw_Grip_Ivory'],
    ['Grip', 'DualOutlaw_Grip_Tactical'],
    ['Grip', 'DualOutlaw_Grip_Timber'],
  ]) {
    assert.ok(slots.get(slot)?.some(option => option.id === modId),
      `DualOutlaw.${slot} no longer exposes ${modId}`);
  }
});

test('Dual Grimshot retains its four mod categories and historical attachment IDs', () => {
  const slots = requireSlots('DualGrimshot', ['Barrel', 'BarrelExtension', 'Grip', 'ChargingHandle']);
  for (const [slot, modId] of [
    ['Barrel', 'DualGrimshot_Barrel_Medium'],
    ['Barrel', 'DualGrimshot_Barrel_CQC'],
    ['BarrelExtension', 'BarrelExt_12GGrimComp'],
    ['Grip', 'DualGrimshot_Grip_Ranger'],
    ['ChargingHandle', 'DualGrimshot_ChargingHandle_Swift'],
  ]) {
    assert.ok(slots.get(slot)?.some(option => option.id === modId),
      `DualGrimshot.${slot} no longer exposes ${modId}`);
  }
});

test('Brute Compensator uses the same attachment ID in Castigo and Dual Outlaw', () => {
  assert.equal(resolveAttachmentKey('BarrelExt_BruteComp'), 'BarrelExt_BruteComp');
  for (const weaponKey of ['Castigo44', 'DualOutlaw', 'Bison']) {
    const options = getSourceModSlots(weaponByKey(weaponKey))
      .find(({ slot }) => slot === 'BarrelExtension')?.options ?? [];
    assert.ok(options.some(({ id }) => id === 'BarrelExt_BruteComp'),
      `${weaponKey} does not expose BarrelExt_BruteComp`);
  }
});
