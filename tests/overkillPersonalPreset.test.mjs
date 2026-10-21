import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { getOverkillConfigGroups } from '../src/build/utils/perks.utils.js';

const source = readFileSync(new URL('../src/build/components/loadout/OverkillConfigModal.jsx', import.meta.url), 'utf8');
const service = readFileSync(new URL('../src/services/weaponPresetService.js', import.meta.url), 'utf8');
const perks = JSON.parse(readFileSync(new URL('../src/data/payday3_perks.json', import.meta.url), 'utf8'));
const loadout = JSON.parse(readFileSync(new URL('../src/data/payday3_loadout_items.json', import.meta.url), 'utf8'));
const groupsFor = (key) => getOverkillConfigGroups(perks, key);

// Probamos la función pura real del modal sin importar JSX ni React en Node.
const start = source.indexOf('function normalizeOverkillPreset(');
const end = source.indexOf('\nexport default function OverkillConfigModal(', start);
assert.ok(start >= 0 && end > start, 'No se encontró el normalizador de presets');
const normalize = vm.runInNewContext(`(${source.slice(start, end).trim()})`);
const plain = (obj) => JSON.parse(JSON.stringify(obj));

test('OVERKILL: normaliza los 7 presets sin perder slots ni valores por defecto', () => {
  for (const weapon of Object.values(loadout.overkill)) {
    const groups = groupsFor(weapon.key);
    const expected = Object.fromEntries(groups.map(group => [
      group.slotKey,
      group.options.find(option => option.isDefault)?.key ?? null,
    ]));
    assert.deepEqual(plain(normalize(groups, {})), expected, weapon.key);
    assert.deepEqual(plain(normalize(groups, null)), expected, weapon.key);
  }
});

test('OVERKILL: las perks válidas de HET5 se guardan y recuperan por slot', () => {
  const groups = groupsFor('HET5');
  const selected = Object.fromEntries(groups.map(group => [group.slotKey, group.options[1].key]));
  assert.deepEqual(plain(normalize(groups, selected)), selected);
});

test('OVERKILL: conserva Ammo predeterminada de KarlAlfred y permite otra Ammo válida', () => {
  const groups = groupsFor('KarlAlfred');
  const ammo = groups.find(group => group.slotKey === 'ammo');
  assert.equal(normalize(groups, {}).ammo, 'ovk_karlalfred_ammo_explosive');
  assert.equal(normalize(groups, {ammo: null}).ammo, 'ovk_karlalfred_ammo_explosive');
  for (const option of ammo.options) {
    assert.equal(normalize(groups, {ammo: option.key}).ammo, option.key);
  }
});

test('OVERKILL: el slot Blade puede restaurarse desde un preset', () => {
  const groups = groupsFor('OVE9050');
  const blade = groups.find(group => group.slotKey === 'blade');
  assert.ok(blade);
  assert.equal(normalize(groups, {blade: blade.options[2].key}).blade, blade.options[2].key);
});

test('OVERKILL: ignora slots inventados, opciones inexistentes y perks de otra arma', () => {
  const groups = groupsFor('HET5');
  const karlGroups = groupsFor('KarlAlfred');
  const otherPerk = karlGroups.find(group => group.slotKey === 'perk1').options[0].key;
  const result = plain(normalize(groups, {
    perk1: otherPerk,
    perk2: 'does-not-exist',
    perk3: groups[2].options[0].key,
    ammo: 'ovk_karlalfred_ammo_explosive',
    rogue: 'unexpected',
  }));
  assert.deepEqual(result, {
    perk1: null,
    perk2: null,
    perk3: groups[2].options[0].key,
  });
});

test('OVERKILL: datos malformados no rompen la carga', () => {
  const groups = groupsFor('KarlAlfred');
  for (const value of [undefined, 5, 'bad', [], true]) {
    const result = plain(normalize(groups, value));
    assert.equal(result.ammo, 'ovk_karlalfred_ammo_explosive');
    assert.equal(result.perk1, null);
    assert.equal(result.perk2, null);
  }
});

test('el modal usa WeaponPresetService sin cambios en Firebase', () => {
  assert.match(source, /import \{ WeaponPresetService \} from "\.\.\/\.\.\/\.\.\/services\/weaponPresetService"/);
  assert.match(source, /WeaponPresetService\.get\(uid, weaponKey\)/);
  assert.match(source, /WeaponPresetService\.save\(uid, weaponKey, presetConfig\)/);
  assert.match(source, /onChange\(normalizeOverkillPreset\(groups, currentPreset\.mods\)\)/);
  assert.match(source, /const presetConfig = normalizeOverkillPreset\(groups, effectiveConfig\)/);
  assert.match(service, /"users", uid, "weaponPresets", weaponKey/);
  assert.match(service, /mods: mods \?\? \{\}/);
});

test('el modal replica login, confirmación de reemplazo, Load/Save y feedback', () => {
  assert.match(source, /if \(!uid\) \{\s*setAuthRequired\(true\)/);
  assert.match(source, /if \(hasPersonalPreset\) \{\s*setConfirmReplaceOpen\(true\)/);
  assert.match(source, /title=\{t\("modal\.title\.replace-preset"\)\}/);
  assert.match(source, /t\("modal\.msg\.replace-preset"\)/);
  assert.match(source, /t\("build\.actions\.load"\)/);
  assert.match(source, /t\("build\.actions\.save"\)/);
  assert.match(source, /t\("toast\.msg\.preset\.saved"\)/);
  assert.match(source, /t\("toast\.msg\.preset\.failed-to-save"\)/);
  assert.match(source, /t\("auth\.msg\.login-required\.presets"\)/);
  assert.match(source, /navigate\("\/auth"\)/);
  assert.match(source, /existingPreset\?\.uid === uid && existingPreset\?\.weaponKey === weaponKey/);
  assert.match(source, /if \(mounted\) setCheckingPreset\(false\)/);
});

test('OVERKILL: las weaponKey no colisionan con Primary ni Secondary en la colección existente', () => {
  const normalKeys = new Set([
    ...Object.values(loadout.primary).map(weapon => weapon.key),
    ...Object.values(loadout.secondary).map(weapon => weapon.key),
  ]);
  for (const weapon of Object.values(loadout.overkill)) {
    assert.ok(!normalKeys.has(weapon.key), `Colisión en weaponPresets/${weapon.key}`);
  }
});
