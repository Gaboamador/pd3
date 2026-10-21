import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildOverkillLoadoutSelection,
  getOverkillConfigGroups,
  getEffectiveOverkillConfig,
} from '../src/build/utils/perks.utils.js';

const perksData = JSON.parse(readFileSync(new URL('../src/data/payday3_perks.json', import.meta.url), 'utf8'));
const loadoutData = JSON.parse(readFileSync(new URL('../src/data/payday3_loadout_items.json', import.meta.url), 'utf8'));
const overkillWeapons = Object.values(loadoutData.overkill);

test('OVERKILL: la seleccion normal y la seleccion con Edit generan la configuracion inicial esperada', () => {
  for (const weapon of overkillWeapons) {
    const selection = buildOverkillLoadoutSelection(perksData, weapon.key);
    assert.equal(selection.overkill, weapon.key);
    const groups = getOverkillConfigGroups(perksData, weapon.key);
    assert.deepEqual(Object.keys(selection.overkillConfig).sort(), groups.map(group => group.slotKey).sort());

    for (const group of groups) {
      const defaultKey = group.options.find(option => option.isDefault)?.key ?? null;
      assert.equal(selection.overkillConfig[group.slotKey], defaultKey, `${weapon.key}/${group.slotKey}`);
    }
  }
});

test('OVERKILL: seleccionar otro item no arrastra perks/ammo de la seleccion anterior', () => {
  const m606 = buildOverkillLoadoutSelection(perksData, 'KarlAlfred');
  assert.equal(m606.overkillConfig.ammo, 'ovk_karlalfred_ammo_explosive');
  const het5 = buildOverkillLoadoutSelection(perksData, 'HET5');
  assert.equal(het5.overkill, 'HET5');
  assert.deepEqual(het5.overkillConfig, { perk1: null, perk2: null, perk3: null });
  assert.equal('ammo' in het5.overkillConfig, false);
});

test('OVERKILL: la configuracion efectiva del modal corresponde al item seleccionado', () => {
  for (const weapon of overkillWeapons) {
    const { overkill, overkillConfig } = buildOverkillLoadoutSelection(perksData, weapon.key);
    assert.deepEqual(getEffectiveOverkillConfig(overkillConfig, perksData, overkill), overkillConfig);
  }
});

test('OVERKILL: solo hay acceso a Edit cuando el arma tiene slots configurables', () => {
  for (const weapon of overkillWeapons) {
    assert.ok(getOverkillConfigGroups(perksData, weapon.key).length > 0, weapon.key);
  }
  assert.deepEqual(getOverkillConfigGroups(perksData, '__sin_configuracion__'), []);
});

test('OVERKILL: el picker conecta Select y Edit al mismo handler, abriendo el editor solo con Edit', () => {
  // Comprobacion de cableado JSX; la navegacion real de modales se valida manualmente.
  const jsx = readFileSync(new URL('../src/build/components/loadout/LoadoutEditor.jsx', import.meta.url), 'utf8');
  const start = jsx.indexOf('open={openPicker === "overkill"}');
  assert.notEqual(start, -1, 'No se encontro el picker de OVERKILL');
  const end = jsx.indexOf('<OverkillConfigModal', start);
  assert.ok(end > start);
  const picker = jsx.slice(start, end);
  assert.match(picker, /onClick=\{\(\) => handleSelectOverkill\(def\)\}/);
  assert.match(picker, /onEdit=\{[\s\S]*getOverkillConfigGroups\(perksData, def\.key\)\.length > 0[\s\S]*handleSelectOverkill\(def, true\)/);
  assert.match(jsx, /function handleSelectOverkill\(def, openEditor = false\)[\s\S]*?updateLoadout\(buildOverkillLoadoutSelection\(perksData, def\.key\)\);[\s\S]*?setOpenPicker\(null\);[\s\S]*?if \(openEditor\) setOpenOverkillEditor\(true\);/);
});
