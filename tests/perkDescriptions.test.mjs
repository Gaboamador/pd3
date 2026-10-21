import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getAttachment } from '../src/data/weaponAttachments.js';
import perksData, { buildPerksData, resolveWeaponPerkDescription } from '../src/data/perksData.js';
import { renderSkillText } from '../src/build/utils/skillText.utils.js';

const original = JSON.parse(readFileSync(new URL('../src/data/payday3_perks.json', import.meta.url), 'utf8'));
const weaponPerks = Object.values(original).filter(perk => perk.scope === 'weapon');
const overkillOptions = Object.values(original).filter(perk => perk.scope === 'overkill');

const placeholders = text => [...text.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map(match => match[1]);

test('28 Weapon Perks usan una fuente externa válida y ninguna duplica la descripción en JSON', () => {
  assert.equal(weaponPerks.length, 28);
  assert.equal(new Set(weaponPerks.map(perk => perk.sourceKey)).size, 28);
  for (const perk of weaponPerks) {
    assert.ok(!Object.hasOwn(perk, 'description'), perk.key);
    assert.ok(perk.sourceKey.startsWith('Perk_'), perk.key);
    assert.ok(getAttachment(perk.sourceKey)?.description, perk.key);
    assert.equal(perksData[perk.key].sourceKey, perk.sourceKey);
  }
});

test('se resuelven los 41 placeholders de 20 Weapon Perks, sin dejar tokens ni perder información', () => {
  let withTokens = 0;
  let tokenCount = 0;
  const parameters = new Set();
  for (const perk of weaponPerks) {
    const template = getAttachment(perk.sourceKey).description;
    const keys = placeholders(template);
    if (keys.length) withTokens++;
    tokenCount += keys.length;
    for (const key of keys) {
      parameters.add(key);
      assert.ok(Object.hasOwn(perk.values ?? {}, key), `${perk.key}: ${key}`);
      const {value, type} = perk.values[key];
      assert.ok(Number.isFinite(Number(value)), `${perk.key}: ${key} no es numérico`);
      assert.ok(['rate','flat'].includes(type), `${perk.key}: ${key} tipo inválido`);
    }
    const description = perksData[perk.key].description;
    assert.ok(description && description !== 'Description unavailable.', perk.key);
    assert.deepEqual(placeholders(description), [], perk.key);
    assert.equal(description, renderSkillText(template, perk.values ?? {}), perk.key);
  }
  assert.equal(withTokens, 20);
  assert.equal(tokenCount, 41);
  assert.equal(parameters.size, 27);
});

test('Vampire conserva precisión decimal y Final Tap presenta 300% adicional', () => {
  assert.match(perksData.perk_vampire.description, /0\.5%/);
  assert.match(perksData.perk_final_tap.description, /300% additional damage/);
  assert.equal(original.perk_final_tap.values.IncreasedDamage.value, 3);
});

test('Target Practice y Luck of the Draw utilizan la mecánica oficial, no la descripción antigua', () => {
  assert.match(perksData.perk_target_practice.description, /When you hit an enemy with a critical hit/);
  assert.match(perksData.perk_luck_of_the_draw.description, /50% extra damage/);
  assert.match(perksData.perk_luck_of_the_draw.description, /2% chance/);
});

test('Knockback tiene los dos porcentajes confirmados', () => {
  assert.match(perksData.perk_knockback.description, /50% higher chance/);
  assert.match(perksData.perk_knockback.description, /10% to trigger/);
  assert.equal(original.perk_knockback.values.IncreasedHurtStun.value, .5);
  assert.equal(original.perk_knockback.values.MinHurtStun.value, .1);
});

test('assassin aplica la corrección aprobada: solo revolver', () => {
  assert.deepEqual(original.perk_assassin.weaponTypes, ['revolver']);
});

test('las 47 opciones OVERKILL conservan su descripción en el JSON, sin alteraciones', () => {
  assert.equal(overkillOptions.length, 47);
  for (const originalEntry of overkillOptions) {
    assert.deepEqual(perksData[originalEntry.key], originalEntry);
    assert.equal(perksData[originalEntry.key].description, originalEntry.description);
  }
});

test('si una futura fuente introduce un placeholder desconocido, se usa fallback sin mostrar el token', () => {
  const perk = original.perk_pin_puller;
  const changed = buildPerksData({[perk.key]:perk}, () => ({description:'New {UnknownParameter} effect.'}));
  assert.equal(changed[perk.key].description, 'Description unavailable.');
  assert.equal(resolveWeaponPerkDescription(perk, () => null), 'Description unavailable.');
});

test('si se pierde un valor o es inválido, el fallback no imprime la descripción incompleta', () => {
  const perk = {...original.perk_vampire, values:{}};
  assert.equal(resolveWeaponPerkDescription(perk), 'Description unavailable.');
  const invalid = {...original.perk_vampire, values:{ HealPercentage: {value:null,type:'rate'} }};
  // null se debe rechazar en el renderizador de valores para no introducir cifras falsas.
  assert.equal(resolveWeaponPerkDescription(invalid), 'Description unavailable.');
});
