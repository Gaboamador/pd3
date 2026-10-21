import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { searchWeaponPerks } from '../src/features/catalog/components/utils/searchWeaponPerks.js';
import { findWeaponPerkCombinations } from '../src/features/catalog/components/utils/weaponPerkCombinations.js';

const perksData = JSON.parse(readFileSync(new URL('../src/data/payday3_perks.json', import.meta.url), 'utf8'));
const loadout = JSON.parse(readFileSync(new URL('../src/data/payday3_loadout_items.json', import.meta.url), 'utf8'));
const perks = Object.values(perksData).filter(p => p.scope === 'weapon' && p.optionType === 'perk');

test('escribir una parte del nombre filtra perks con coincidencia en cualquier posición', () => {
  assert.deepEqual(searchWeaponPerks(perks, 'vamp').map(p => p.key), ['perk_vampire']);
  assert.deepEqual(searchWeaponPerks(perks, 'maker').map(p => p.key), ['perk_haymaker']);
  assert.deepEqual(searchWeaponPerks(perks, ' & ').map(p => p.key), ['perk_run_and_gun']);
});

test('la búsqueda ignora mayúsculas, espacios extremos y acentos', () => {
  assert.deepEqual(searchWeaponPerks(perks, '   rUn & GUn  ').map(p => p.key), ['perk_run_and_gun']);
  const accents = [{ key: 'a', name: 'Rápido' }, { key: 'b', name: 'Lento' }];
  assert.deepEqual(searchWeaponPerks(accents, 'RAPIDO').map(p => p.key), ['a']);
});

test('consulta vacía muestra opciones ordenadas sin alterar los datos originales', () => {
  const copy = [...perks];
  const all = searchWeaponPerks(perks, '  ');
  assert.equal(all.length, perks.length);
  assert.deepEqual(perks, copy);
  assert.deepEqual(all.map(p => p.name), [...all.map(p => p.name)].sort((a, b) => a.localeCompare(b)));
});

test('si no hay coincidencias no ofrece ninguna opción', () => {
  assert.deepEqual(searchWeaponPerks(perks, 'no-existe-esta-perk'), []);
});

test('solo se ofrecen Weapon Perks; OVERKILL, ammo y blade quedan excluidos', () => {
  assert(perks.every(p => p.scope === 'weapon' && p.optionType === 'perk'));
  assert.deepEqual(searchWeaponPerks(perks, 'Cluster Bomb'), []);
});

test('al excluir la primera perk de la segunda lista no puede seleccionarse dos veces', () => {
  const options = perks.filter(p => p.key !== 'perk_haymaker');
  assert.deepEqual(searchWeaponPerks(options, 'Haymaker'), []);
  assert.deepEqual(searchWeaponPerks(options, 'Pin Puller').map(p => p.key), ['perk_pin_puller']);
});

test('la búsqueda solo decide qué perk elegir, no altera las combinaciones', () => {
  const [first] = searchWeaponPerks(perks, 'haymaker');
  const [second] = searchWeaponPerks(perks, 'pin puller');
  const combinations = findWeaponPerkCombinations(first, second, loadout);
  assert.equal(combinations.length, 2);
});
