import test from 'node:test';
import assert from 'node:assert/strict';
import loadout from '../src/data/payday3_loadout_items.json';
import legacy from '../src/data/payday3_legacy_mod_id_map.json';
import { getAttachment, getSourceModSlots } from '../src/data/weaponAttachments.js';
import {
  getWeaponModSlots, buildInitialModsStateForWeapon,
  normalizeModsForWeapon, normalizeBuildWeaponMods, validateWeaponMods,
  getWeaponByKey,
} from '../src/build/utils/loadout.utils.js';
const weapons = [...Object.values(loadout.primary), ...Object.values(loadout.secondary)];
const bases = weapons.filter(w => w.preset === 0);
const iconics = weapons.filter(w => w.preset === 1);

test('37 armas normales y 24 Iconic, todas con sus referencias', () => {
  assert.equal(bases.length, 37);
  assert.equal(iconics.length, 24);
  for (const w of bases) {
    assert.ok(getWeaponModSlots(w).length > 0, w.key);
    assert.equal('mods' in w, false, w.key);
  }
  for (const w of iconics) {
    assert.ok(getWeaponByKey(loadout, w.baseWeaponKey), w.key);
    assert.ok(w.perk, w.key);
    assert.ok(w.fixedMods && Object.keys(w.fixedMods).length > 0, w.key);
  }
});

test('Iconic: 24 configuraciones fijas válidas, sin attachments exclusivos', () => {
  for (const w of iconics) {
    const actual = buildInitialModsStateForWeapon(w);
    const actualSlots = new Map(getWeaponModSlots(w).map(s => [s.slot,s]));
    const base = getWeaponByKey(loadout,w.baseWeaponKey);
    const baseSlots = new Map(getSourceModSlots(base, { includeDefaultOnly: true }).map(s => [s.slot,s]));
    for (const [slot, ref] of Object.entries(w.fixedMods)) {
      assert.ok(actualSlots.has(slot), `${w.key}/${slot}`);
      const options = baseSlots.get(slot)?.options ?? [];
      // Una parte fija debe existir como opción o default de su arma base.
      if (ref) assert.ok(options.some(o => o.id===ref), `${w.key}/${slot}/${ref}`);
      const required = options.find(o => o.id===ref);
      assert.equal(actual[slot], required?.isDefault ? null : (ref ?? null), `${w.key}/${slot}`);
    }
  }
});

test('CAR4: numerales legacy se convierten a refs y Default se vuelve null', () => {
  const car4 = getWeaponByKey(loadout,'CAR4');
  const converted = normalizeModsForWeapon(car4,{Mag:24,BarrelExtension:9,Barrel:15});
  assert.equal(converted.Mag,'CAR4_Mag_Extended');
  assert.equal(converted.BarrelExtension,'BarrelExt_BeveledSilencer');
  assert.equal(converted.Barrel,null);
  assert.equal(validateWeaponMods({primary:{weaponKey:'CAR4',mods:converted}},loadout).length,0);
});

test('PC9: Viewpoint Sight verificada, ID 177 legacy y PC9_P11', () => {
  const pc9 = getWeaponByKey(loadout, 'PC9');
  const iconic = getWeaponByKey(loadout, 'PC9_P11');
  assert.ok(getWeaponModSlots(pc9).find(s=>s.slot==='Sight').options.some(o=>o.id==='Sight_ViewPoint'));
  assert.equal(normalizeModsForWeapon(pc9,{Sight:177}).Sight,'Sight_ViewPoint');
  assert.equal(buildInitialModsStateForWeapon(iconic).Sight,'Sight_ViewPoint');
});

test('IDs inexistentes o mods retirados regresan a null sin excepciones', () => {
  const atk = getWeaponByKey(loadout,'ATK7');
  assert.equal(normalizeModsForWeapon(atk,{Sight:430}).Sight,null);
  assert.equal(normalizeModsForWeapon(atk,{Sight:'Sight_Fake'}).Sight,null);
  assert.equal(normalizeModsForWeapon(atk,{Sight:999999}).Sight,null);
  const newer = normalizeModsForWeapon(atk,{Mag:'ATK7_Mag_Extended'});
  assert.equal(newer.Mag,'ATK7_Mag_Extended');
});

test('Legacy: todos los IDs disponibles se resuelven; removidos caen a null', () => {
  for (const [weaponKey, categories] of Object.entries(legacy.weapons)) {
    const weapon = getWeaponByKey(loadout,weaponKey);
    assert.ok(weapon,weaponKey);
    for (const [category, mappings] of Object.entries(categories)) {
      for (const [oldId, ref] of Object.entries(mappings)) {
        const state = normalizeModsForWeapon(weapon, { [category]:Number(oldId) });
        const expected = weapon.preset===1
          ? buildInitialModsStateForWeapon(weapon)[category] ?? null
          : (typeof ref==='string' && getWeaponModSlots(weapon)
             .find(x=>x.slot===category)?.options.some(o=>o.id===ref && !o.isDefault)) ? ref : null;
        assert.equal(state[category] ?? null,expected,`${weaponKey}/${category}/${oldId}`);
      }
    }
  }
});

test('Normalización es idempotente y conserva resto de la build', () => {
  const build = {name:'Legacy',skills:{a:{base:true}},loadout:{primary:{weaponKey:'CAR4',mods:{Mag:24,Sight:99999}},secondary:null,overkill:'HET5',armor:{key:null,plates:[]}}};
  const once=normalizeBuildWeaponMods(build);
  const twice=normalizeBuildWeaponMods(once);
  assert.deepEqual(once,twice);
  assert.equal(once.loadout.primary.mods.Mag,'CAR4_Mag_Extended');
  assert.equal(once.loadout.primary.mods.Sight,null);
  assert.equal(once.loadout.overkill,'HET5');
  assert.deepEqual(once.skills,build.skills);
  assert.equal(build.loadout.primary.mods.Mag,24);
});

test('Fuente nueva: CAR4 recibe los Sights añadidos sin duplicarlos en nuestro JSON', () => {
  const car4 = getWeaponByKey(loadout, 'CAR4');
  const sights = getWeaponModSlots(car4).find(s=>s.slot==='Sight').options;
  assert.ok(sights.some(o => o.id==='Sight_LPVO'));
  assert.ok(sights.some(o => o.id==='Sight_Seymour'));
  assert.equal(sights[0].name,'None');
  assert.equal(sights[0].isDefault,true);
});

test('Iconic: fallback si falta definición de un fixedMod', () => {
  const iconic = getWeaponByKey(loadout,'PC9_P11');
  const broken = {...iconic, fixedMods:{...iconic.fixedMods, Sight:'Sight_No_Existe'}};
  const normalized = normalizeModsForWeapon(broken,{Sight:811});
  assert.equal(normalized.Sight,null);
  assert.equal(validateWeaponMods({primary:{weaponKey:iconic.key, mods:normalized}},loadout).length,0);
});

test('Defaults obligatorios y None se presentan de forma diferenciada', () => {
  const car4 = getWeaponByKey(loadout,'CAR4');
  const options = getWeaponModSlots(car4);
  assert.equal(options.find(s=>s.slot==='Mag').options[0].name,'Default');
  assert.equal(options.find(s=>s.slot==='Mag').options[0].isDefault,true);
  assert.equal(options.find(s=>s.slot==='Sight').options[0].name,'None');
  assert.equal(normalizeModsForWeapon(car4,{Mag:22}).Mag,null);
});


test('Todas las opciones seleccionables tienen una definición en attachments.js', () => {
  let checked = 0;
  for (const weapon of bases) {
    for (const {slot,options} of getWeaponModSlots(weapon)) {
      for (const option of options) {
        if (!option.id) continue;
        assert.ok(getAttachment(option.id), `${weapon.key}/${slot}/${option.id}`);
        checked++;
      }
    }
  }
  assert.ok(checked >= 997, `refs evaluadas: ${checked}`);
});
