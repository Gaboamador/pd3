import test from 'node:test';
import assert from 'node:assert/strict';
import { getWeaponAttachmentSpritePos } from '../src/build/utils/sprites/weaponAttachmentSprites.js';

test('Brute Compensator reutiliza la imagen compartida en las armas nuevas', () => {
  const expected = { r: 2, c: 3 };
  for (const weapon of ['DualOutlaw', 'Bison', 'Castigo44', 'Bullkick500']) {
    assert.deepEqual(getWeaponAttachmentSpritePos(weapon, 'BarrelExt_BruteComp'), expected, weapon);
  }
});

test('12G Grim Compensator reutiliza la imagen sin duplicar coordenadas', () => {
  const expected = getWeaponAttachmentSpritePos('DualGrimshot', 'BarrelExt_12GGrimComp');
  assert.deepEqual(expected, { r: 1, c: 1 });
  for (const weapon of ['Fsa12', 'Justicar', 'TAS12']) {
    assert.deepEqual(getWeaponAttachmentSpritePos(weapon, 'BarrelExt_12GGrimComp'), expected, weapon);
  }
});

test('Las imágenes específicas siguen teniendo prioridad', () => {
  assert.deepEqual(getWeaponAttachmentSpritePos('KU59', 'KU59_Grip_Biofit'), { r: 1, c: 14 });
  assert.deepEqual(getWeaponAttachmentSpritePos('PFLK', 'KU59_Grip_Biofit'), { r: 5, c: 12 });
  assert.deepEqual(getWeaponAttachmentSpritePos('KU59', 'KU59_Grip_Tac'), { r: 14, c: 6 });
  assert.deepEqual(getWeaponAttachmentSpritePos('PFLK', 'KU59_Grip_Tac'), { r: 5, c: 15 });
});

test('Las claves con coordenadas divergentes no tienen fallback ambiguo', () => {
  assert.equal(getWeaponAttachmentSpritePos('CAR4', 'KU59_Grip_Biofit'), null);
  assert.equal(getWeaponAttachmentSpritePos('CAR4', 'KU59_Grip_Tac'), null);
});

test('Respeta los null explícitos y las referencias desconocidas', () => {
  assert.equal(getWeaponAttachmentSpritePos('Commando', 'Commando_Mag_Extended'), null);
  assert.equal(getWeaponAttachmentSpritePos('CAR4', 'mod_inexistente'), null);
  assert.equal(getWeaponAttachmentSpritePos('CAR4', ''), null);
  assert.equal(getWeaponAttachmentSpritePos(null, 'BarrelExt_BruteComp'), null);
});
