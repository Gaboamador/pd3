import test from 'node:test';
import assert from 'node:assert/strict';
import loadout from '../src/data/payday3_loadout_items.json';
import { getSourceModSlots } from '../src/data/weaponAttachments.js';
import {
  getWeaponByKey,
  getWeaponModSlots,
  buildInitialModsStateForWeapon,
  normalizeModsForWeapon,
  isWeaponModSlotActive,
} from '../src/build/utils/loadout.utils.js';

const weapons = [...Object.values(loadout.primary), ...Object.values(loadout.secondary)];
const bases = weapons.filter(w => w.preset === 0);
const iconics = weapons.filter(w => w.preset === 1);

const modSlotsByName = weapon => new Map(getWeaponModSlots(weapon).map(slot => [slot.slot, slot]));

test('Armas normales: no se muestran categorias con solo Default y ninguna alternativa', () => {
  for (const weapon of bases) {
    for (const {slot, options} of getWeaponModSlots(weapon)) {
      assert.ok(options.some(option => !option.isDefault), `${weapon.key}/${slot}`);
    }
  }
});

test('Tribune 32 normal: no muestra Barrel ni Grip, pero mantiene las categorias editables', () => {
  const tribune = getWeaponByKey(loadout, 'T32');
  const slots = modSlotsByName(tribune);
  assert.equal(slots.has('Barrel'), false);
  assert.equal(slots.has('Grip'), false);
  for (const key of ['BarrelExtension', 'Mag', 'Stock', 'Sight']) {
    assert.equal(slots.has(key), true, key);
  }
});

test('Miami Decadence: muestra los fixedMods Default sin marcarlos como activos', () => {
  const iconic = getWeaponByKey(loadout, 'T32_Fool');
  const slots = modSlotsByName(iconic);
  const mods = buildInitialModsStateForWeapon(iconic);
  for (const slot of ['BarrelExtension', 'Grip', 'Barrel']) {
    assert.ok(slots.has(slot), slot);
    assert.equal(slots.get(slot).options.length, 1);
    assert.equal(slots.get(slot).options[0].isDefault, true, slot);
    assert.equal(mods[slot], null, slot);
    assert.equal(isWeaponModSlotActive(slots.get(slot), mods[slot]), false, slot);
    // Aun si llegara una referencia Default sin normalizar, el sprite sigue inactive.
    assert.equal(isWeaponModSlotActive(slots.get(slot), iconic.fixedMods[slot]), false, slot);
  }
  assert.equal(mods.Mag, 'T32_Mag_Extended');
  assert.equal(isWeaponModSlotActive(slots.get('Mag'), mods.Mag), true);
});

test('Default/None y IDs desconocidos nunca marcan el icono como active', () => {
  const car4 = getWeaponByKey(loadout, 'CAR4');
  const slots = modSlotsByName(car4);
  const mag = slots.get('Mag');
  const sight = slots.get('Sight');
  assert.equal(isWeaponModSlotActive(mag, null), false);
  assert.equal(isWeaponModSlotActive(mag, ''), false);
  assert.equal(isWeaponModSlotActive(mag, mag.options[0].id), false);
  assert.equal(isWeaponModSlotActive(mag, 'fake-mod'), false);
  assert.equal(isWeaponModSlotActive(sight, null), false);
  assert.equal(isWeaponModSlotActive(mag, 'CAR4_Mag_Extended'), true);
  assert.equal(isWeaponModSlotActive(sight, 'Sight_ClassicRDS'), true);
});

test('Iconic: cada fixedMod se resuelve aunque el arma base oculte la categoria Default-only', () => {
  for (const iconic of iconics) {
    const slots = modSlotsByName(iconic);
    assert.deepEqual([...slots.keys()].sort(), Object.keys(iconic.fixedMods).sort(), iconic.key);
    const mods = normalizeModsForWeapon(iconic, {});
    for (const [slot, fixed] of Object.entries(iconic.fixedMods)) {
      const candidate = slots.get(slot);
      assert.ok(candidate, `${iconic.key}/${slot}`);
      assert.equal(candidate.options.length, 1, `${iconic.key}/${slot}`);
      assert.equal(isWeaponModSlotActive(candidate, mods[slot]), !candidate.options[0].isDefault, `${iconic.key}/${slot}`);
      if (candidate.options[0].isDefault) {
        assert.equal(mods[slot], null, `${iconic.key}/${slot}`);
      } else {
        assert.equal(mods[slot], fixed, `${iconic.key}/${slot}`);
      }
    }
  }
});

test('El catálogo completo de categorias Default-only se conserva para resolver las Iconic', () => {
  const tribune = getWeaponByKey(loadout, 'T32');
  const all = new Map(getSourceModSlots(tribune, {includeDefaultOnly: true}).map(s => [s.slot,s]));
  assert.equal(all.get('Grip').options.length, 1);
  assert.equal(all.get('Grip').options[0].id, 'T32_Grip_Default');
  assert.equal(all.get('Barrel').options.length, 1);
  assert.equal(all.get('Barrel').options[0].id, 'T32_Barrel_Default');
});
