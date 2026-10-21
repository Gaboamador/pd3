import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAttachment } from '../src/data/weaponAttachments.js';
import perksData, { buildPerksData } from '../src/data/perksData.js';
import { renderSkillText } from '../src/build/utils/skillText.utils.js';

const root = new URL('../', import.meta.url);
const read = (path) => readFileSync(new URL(path, root), 'utf8');
const definitions = JSON.parse(read('src/data/payday3_perks.json'));
const weaponPerks = Object.values(definitions).filter(perk => perk.scope === 'weapon');
const overkillPerks = Object.values(definitions).filter(perk => perk.scope === 'overkill');

test('el JSON no duplica equipped/persistent; cada Weapon Perk tiene sourceKey', () => {
  assert.equal(weaponPerks.length, 28);
  for (const perk of weaponPerks) {
    assert.equal(Object.hasOwn(perk, 'equipped'), false, perk.key);
    assert.equal(Object.hasOwn(perk, 'persistent'), false, perk.key);
    assert.ok(perk.sourceKey, perk.key);
    assert.ok(Array.isArray(perk.weaponTypes), perk.key);
  }
});

test('las 28 Weapon Perks obtienen perkType del JS original: 18 equipped y 10 persistent', () => {
  const types = { equipped: 0, persistent: 0 };
  for (const perk of weaponPerks) {
    const source = getAttachment(perk.sourceKey);
    assert.ok(source, perk.key);
    const expected = source.perkType;
    assert.ok(expected === 'equipped' || expected === 'persistent', perk.key);
    types[expected]++;
    assert.equal(perksData[perk.key].perkType, expected, perk.key);
    assert.equal(perksData[perk.key].equipped, expected === 'equipped', perk.key);
    assert.equal(perksData[perk.key].persistent, expected === 'persistent', perk.key);
    assert.equal(perksData[perk.key].description, renderSkillText(source.description, perk.values ?? {}));
  }
  assert.deepEqual(types, { equipped: 18, persistent: 10 });
});

test('el tipo procede de la fuente externa, incluso si su valor cambia', () => {
  const perk = definitions.perk_vampire;
  const virtualSource = { description: 'Healing: {HealPercentage}', perkType: 'persistent' };
  const result = buildPerksData({ [perk.key]: perk }, () => virtualSource)[perk.key];
  assert.equal(result.perkType, 'persistent');
  assert.equal(result.equipped, false);
  assert.equal(result.persistent, true);
  assert.equal(result.description, 'Healing: 0.5%');
  assert.equal(Object.hasOwn(definitions.perk_vampire, 'equipped'), false);
});

test('un perkType faltante o desconocido no rompe el dato ni fuerza una clasificación', () => {
  const perk = definitions.perk_vampire;
  for (const perkType of [undefined, 'other']) {
    const next = buildPerksData({[perk.key]:perk}, () => ({description:'No tokens', perkType}))[perk.key];
    assert.equal(next.perkType, null);
    assert.equal(next.equipped, false);
    assert.equal(next.persistent, false);
    assert.equal(next.description, 'No tokens');
  }
});

test('las 47 opciones OVERKILL permanecen intactas', () => {
  assert.equal(overkillPerks.length, 47);
  for (const option of overkillPerks) {
    assert.deepEqual(perksData[option.key], option);
  }
});

test('el componente de descripciones reutiliza exactamente el estilo y el renderizador de skills', () => {
  const source = read('src/components/PerkDescriptionText.jsx');
  assert.match(source, /renderSkillTextWithTotals/);
  assert.match(source, /SkillSection\.module\.scss/);
  assert.match(source, /styles\.skillValueHighlight/);
  assert.match(source, /showTotals:\s*false/);
  assert.match(source, /valuesMap:\s*\{\}/);
  assert.match(read('src/components/SkillSection.module.scss'), /\.skillValueHighlight\s*\{[^}]*font-weight:\s*700/s);
  assert.match(perksData.perk_vampire.description, /0\.5%/);
  assert.match(renderSkillText('A {Percentage} increase', {Percentage:{value:0.025,type:'rate'}}), /2\.5%/);
});

test('los ocho contextos visuales muestran las descripciones con el componente compartido', () => {
  const files = [
    'src/build/components/weapons/WeaponModsModal.jsx',
    'src/build/components/loadout/OverkillConfigModal.jsx',
    'src/features/catalog/components/PerkDetailsSection.jsx',
    'src/features/catalog/components/PerksComparisonSection.jsx',
    'src/features/catalog/components/WeaponStatsSection.jsx',
    'src/features/catalog/components/WeaponTypeComparisonSection.jsx',
    'src/features/catalog/components/OverkillsStatsSection.jsx',
    'src/randomizer/components/RandomizerPerksModal.jsx',
  ];
  for (const file of files) {
    const source = read(file);
    assert.match(source, /import PerkDescriptionText from/, file);
    assert.match(source, /<PerkDescriptionText description=/, file);
  }
  // Las descripciones deben continuar disponibles como texto plano en atributos y búsquedas.
  assert.match(read('src/build/components/weapons/WeaponModsModal.jsx'), /title=\{perk\.description\}/);
  assert.match(read('src/library/utils/buildCatalog.js'), /perk\.description/);
});
