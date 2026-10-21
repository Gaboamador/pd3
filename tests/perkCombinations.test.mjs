import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  findWeaponPerkCombinations,
  getWeaponPerkSources,
} from '../src/features/catalog/components/utils/weaponPerkCombinations.js';

const loadout = JSON.parse(readFileSync(new URL('../src/data/payday3_loadout_items.json', import.meta.url), 'utf8'));
const perks = JSON.parse(readFileSync(new URL('../src/data/payday3_perks.json', import.meta.url), 'utf8'));
const sources = (key) => getWeaponPerkSources(perks[key], loadout);
const pairs = (a, b) => findWeaponPerkCombinations(perks[a], perks[b], loadout);

test('Vampire incluye sus SMG normales y la Iconic NW B-9 Wraith de Primary', () => {
  const options = sources('perk_vampire');
  assert(options.some(s => s.kind === 'type' && s.slot === 'primary' && s.weaponType === 'smg' && s.count === 5));
  assert(options.some(s => s.kind === 'type' && s.slot === 'secondary' && s.weaponType === 'smg'));
  assert(options.some(s => s.kind === 'iconic' && s.slot === 'primary' && s.key === 'NWB9_P4'));
  assert(!options.some(s => s.kind === 'type' && s.weaponType === 'assaultrifle'));
});

test('Haymaker + Pin Puller: dos alternativas exactas, sin mezclar Primary y Secondary', () => {
  const options = pairs('perk_haymaker', 'perk_pin_puller');
  assert.equal(options.length, 2);
  assert(options.every(x => x.primary.key === 'Commando_B8' && x.primary.perkKey === 'perk_haymaker'));
  assert(options.some(x => x.secondary.kind === 'type' && x.secondary.weaponType === 'pistol' && x.secondary.perkKey === 'perk_pin_puller'));
  assert(options.some(x => x.secondary.kind === 'iconic' && x.secondary.key === 'Castigo44_B13'));
});

test('Accelerator + Run & Gun permite Primary Shotgun y Secondary Pistol', () => {
  const options = pairs('perk_accelerator', 'perk_run_and_gun');
  assert(options.some(x => x.primary.kind === 'type' && x.primary.weaponType === 'shotgun' && x.primary.perkKey === 'perk_accelerator'
    && x.secondary.kind === 'type' && x.secondary.weaponType === 'pistol' && x.secondary.perkKey === 'perk_run_and_gun'));
  assert(options.some(x => x.primary.key === 'VF7S_B9' && x.secondary.weaponType === 'pistol'));
});

test('Las Iconic solo aportan su perk fija, incluso cuando tienen otro weaponType', () => {
  for (const slot of ['primary', 'secondary']) {
    for (const weapon of Object.values(loadout[slot])) {
      if (weapon.preset !== 1) continue;
      const available = sources(weapon.perk);
      assert(available.some(s => s.kind === 'iconic' && s.key === weapon.key && s.slot === slot), weapon.key);
      for (const perk of Object.values(perks).filter(p => p.scope === 'weapon' && p.key !== weapon.perk)) {
        assert(!getWeaponPerkSources(perk, loadout).some(s => s.kind === 'iconic' && s.key === weapon.key), `${weapon.key} incorrectly supports ${perk.key}`);
      }
    }
  }
});

test('Las perks Iconic only no se ofrecen en armas normales', () => {
  for (const perk of Object.values(perks).filter(p => p.iconicOnly && p.scope === 'weapon')) {
    assert(sources(perk.key).every(s => s.kind === 'iconic'), perk.key);
  }
});

test('Cada grupo regular incluye solo armas reales de su slot y tipo', () => {
  for (const perk of Object.values(perks).filter(p => p.scope === 'weapon')) {
    for (const src of getWeaponPerkSources(perk, loadout)) {
      if (src.kind === 'type') {
        const found = Object.values(loadout[src.slot]).filter(w => w.preset === 0 && w.type === src.weaponType);
        assert.equal(src.count, found.length);
        assert(found.length > 0);
        assert(perk.weaponTypes.includes(src.weaponType));
      }
    }
  }
});

test('Ninguna combinación incluye dos armas del mismo slot ni pierde la perk asignada', () => {
  const all = Object.values(perks).filter(p => p.scope === 'weapon' && p.optionType === 'perk');
  for (const a of all) for (const b of all) {
    const options = findWeaponPerkCombinations(a, b, loadout);
    const unique = new Set();
    for (const o of options) {
      assert.equal(o.primary.slot, 'primary');
      assert.equal(o.secondary.slot, 'secondary');
      assert.notEqual(o.primary.perkKey, o.secondary.perkKey);
      assert(new Set([a.key, b.key]).has(o.primary.perkKey));
      assert(new Set([a.key, b.key]).has(o.secondary.perkKey));
      const signature = `${o.primary.perkKey}/${o.primary.key}|${o.secondary.perkKey}/${o.secondary.key}`;
      assert(!unique.has(signature), `Duplicated: ${signature}`);
      unique.add(signature);
    }
  }
});

test('Combinaciones imposibles devuelven lista vacía', () => {
  assert.deepEqual(pairs('perk_vampire', 'perk_vampire'), []);
  assert.deepEqual(pairs('perk_browbeater', 'perk_domino_effect'), []); // Ambas solo disponibles en Primary
});

test('Caso sintético: evita grupos de tipo fantasma, acepta un arma única y respeta Iconic', () => {
  const fixture = {
    primary: { one: { key: 'p1', type: 'smg', preset: 0, name: 'Only Primary SMG' }, two: { key: 'p2', type: 'shotgun', preset: 1, perk: 'other', name: 'Iconic Shotgun' } },
    secondary: { one: { key: 's1', type: 'pistol', preset: 0, name: 'Only Pistol' } },
  };
  const p = { key: 'first', optionType: 'perk', scope: 'weapon', weaponTypes: ['smg', 'revolver'] };
  const q = { key: 'second', optionType: 'perk', scope: 'weapon', weaponTypes: ['pistol'] };
  assert.deepEqual(getWeaponPerkSources(p, fixture).map(s => s.key), ['primary:smg']);
  assert.equal(getWeaponPerkSources(p, fixture)[0].count, 1);
  assert.equal(findWeaponPerkCombinations(p, q, fixture).length, 1);
  assert.deepEqual(findWeaponPerkCombinations(q, p, fixture).map(x => x.primary.perkKey), ['first']);
});

test('No aplica a OVERKILL ni a opciones de ammo', () => {
  const overkillPerk = Object.values(perks).find(p => p.scope === 'overkill');
  assert.deepEqual(getWeaponPerkSources(overkillPerk, loadout), []);
  assert.deepEqual(findWeaponPerkCombinations(perks.perk_vampire, overkillPerk, loadout), []);
});
