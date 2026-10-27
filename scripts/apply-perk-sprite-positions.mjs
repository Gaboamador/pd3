#!/usr/bin/env node
// Incorpora las 27 posiciones del sprite /sprites/perks.png en payday3_perks.json.
// - No toca las perks sin icono (el fallback se resuelve en React).
// - Conserva el formato del archivo: inserta solamente el campo sprite_pos.
// - Crea backup, valida el resultado y permite reejecutarlo sin cambios.
// - Uso: node scripts/apply-perk-sprite-positions.mjs [ruta-al-json] [--dry-run]

import { existsSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { resolve } from 'node:path';

const SPRITE_COLS = 4;
const SPRITE_ROWS = 21;
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const SPRITE_POSITIONS = Object.freeze({
  "perk_bleeding_edge": { r: 1, c: 2 },
  "perk_battle_grit": { r: 1, c: 3 },
  "perk_accelerator": { r: 1, c: 4 },
  "perk_bulky": { r: 2, c: 1 },
  "perk_glass_cannon": { r: 2, c: 2 },
  "perk_ammo_feed": { r: 2, c: 3 },
  "perk_resilient": { r: 2, c: 4 },
  "perk_run_and_gun": { r: 3, c: 1 },
  "perk_haymaker": { r: 3, c: 2 },
  "perk_browbeater": { r: 3, c: 3 },
  "perk_bleed": { r: 3, c: 4 },
  "perk_domino_effect": { r: 4, c: 1 },
  "perk_luck_of_the_draw": { r: 4, c: 2 },
  "perk_final_tap": { r: 4, c: 3 },
  "perk_pin_puller": { r: 4, c: 4 },
  "perk_hard_cast": { r: 5, c: 1 },
  "perk_sharpshooter": { r: 5, c: 2 },
  "perk_knockback": { r: 5, c: 3 },
  "perk_vampire": { r: 5, c: 4 },
  "perk_hot_lead": { r: 6, c: 1 },
  "perk_trigger_happy": { r: 6, c: 2 },
  "perk_midas_touch": { r: 6, c: 3 },
  "perk_target_practice": { r: 6, c: 4 },
  "perk_veteran": { r: 7, c: 1 },
  "perk_fog_of_war": { r: 7, c: 2 },
  "perk_assassin": { r: 7, c: 3 },
  "perk_double_cross": { r: 7, c: 4 },
});

function fail(message) {
  throw new Error(message);
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const unknownFlags = args.filter(a => a.startsWith('--') && a !== '--dry-run');
if (unknownFlags.length) fail(`Opciones desconocidas: ${unknownFlags.join(', ')}`);
const fileArgs = args.filter(a => !a.startsWith('--'));
if (fileArgs.length > 1) fail('Indicá como máximo una ruta al JSON.');
const jsonPath = resolve(process.cwd(), fileArgs[0] ?? 'src/data/payday3_perks.json');
if (!existsSync(jsonPath)) fail(`No se encontró el archivo: ${jsonPath}`);

const originalText = readFileSync(jsonPath, 'utf8');
const hasBom = originalText.charCodeAt(0) === 0xFEFF;
const parseText = (text) => JSON.parse(hasBom ? text.slice(1) : text);
let original;
try {
  original = parseText(originalText);
} catch (error) {
  fail(`JSON inválido en ${jsonPath}: ${error.message}`);
}
if (!original || Array.isArray(original) || typeof original !== 'object') {
  fail('payday3_perks.json debe tener un objeto de perks en la raíz.');
}

const mapEntries = Object.entries(SPRITE_POSITIONS);
const usedPositions = new Set();
for (const [key, pos] of mapEntries) {
  if (!hasOwn(original, key)) fail(`Falta la perk ${key} en el JSON. Se cancela sin cambios.`);
  const perk = original[key];
  if (!perk || perk.key !== key || perk.scope !== 'weapon') {
    fail(`La entrada ${key} no coincide con la estructura esperada. Se cancela sin cambios.`);
  }
  if (!Number.isInteger(pos.r) || !Number.isInteger(pos.c)
      || pos.r < 1 || pos.r > SPRITE_ROWS || pos.c < 1 || pos.c > SPRITE_COLS) {
    fail(`Posición fuera de la grilla para ${key}.`);
  }
  const coord = `${pos.r},${pos.c}`;
  if (usedPositions.has(coord)) fail(`Posición duplicada en el mapeo: ${coord}.`);
  usedPositions.add(coord);

  if (hasOwn(perk, 'sprite_pos')) {
    const existing = perk.sprite_pos;
    if (existing?.r !== pos.r || existing?.c !== pos.c) {
      fail(`${key} ya tiene sprite_pos distinto (${JSON.stringify(existing)}); no se sobrescribe.`);
    }
  }
}

let modifiedText = originalText;
let updated = 0;
let unchanged = 0;
for (const [key, pos] of mapEntries) {
  if (hasOwn(original[key], 'sprite_pos')) {
    unchanged++;
    continue;
  }

  // Detectar la entrada top-level por su clave exacta.
  const startRe = new RegExp(`^[ \\t]*"${escapeRegExp(key)}"[ \\t]*:[ \\t]*\\{[ \\t]*\\r?$`, 'm');
  const start = startRe.exec(modifiedText);
  if (!start) fail(`No se pudo localizar el bloque textual de ${key}. No se escribió ningún archivo.`);

  // El sourceKey aparece inmediatamente después de key y name en el JSON del proyecto.
  const sectionStart = start.index + start[0].length;
  const firstLines = modifiedText.slice(sectionStart, sectionStart + 750);
  const sourceRe = /^([ \t]*)"sourceKey"[ \t]*:[ \t]*"([^"]+)"[ \t]*,[ \t]*(\r?\n)/m;
  const source = sourceRe.exec(firstLines);
  if (!source || source[2] !== original[key].sourceKey) {
    fail(`No se encontró el sourceKey correcto para ${key}. No se escribió ningún archivo.`);
  }

  const indent = source[1];
  const lineEnding = source[3];
  const insertion = `${indent}"sprite_pos": {${lineEnding}` +
                    `${indent}  "r": ${pos.r},${lineEnding}` +
                    `${indent}  "c": ${pos.c}${lineEnding}` +
                    `${indent}},${lineEnding}`;
  const insertAt = sectionStart + source.index + source[0].length;
  modifiedText = modifiedText.slice(0, insertAt) + insertion + modifiedText.slice(insertAt);
  updated++;
}

// Verificar que SOLO se añadieron las posiciones planeadas y que no cambió ningún otro dato.
let result;
try {
  result = parseText(modifiedText);
} catch (error) {
  fail(`El JSON generado no pasó validación: ${error.message}. No se escribió ningún archivo.`);
}
const verificationCopy = JSON.parse(JSON.stringify(result));
for (const [key, pos] of mapEntries) {
  if (result[key]?.sprite_pos?.r !== pos.r || result[key]?.sprite_pos?.c !== pos.c) {
    fail(`Coordenada incorrecta para ${key}. No se escribió ningún archivo.`);
  }
  if (!hasOwn(original[key], 'sprite_pos')) delete verificationCopy[key].sprite_pos;
}
if (JSON.stringify(verificationCopy) !== JSON.stringify(original)) {
  fail('La comprobación de integridad falló. No se escribió ningún archivo.');
}

const missing = Object.entries(result)
  .filter(([, perk]) => perk?.scope === 'weapon' && !perk.sprite_pos)
  .map(([key]) => key);

console.log(`Perks mapeadas: ${mapEntries.length}`);
console.log(`A incorporar: ${updated}; ya correctas: ${unchanged}`);
console.log(`Sin icono propio (usan fallback): ${missing.length}`);
if (missing.length) console.log(`  ${missing.join(', ')}`);

if (updated === 0) {
  console.log('El JSON ya está actualizado. No se creó backup ni se modificó el archivo.');
} else if (dryRun) {
  console.log('SIMULACIÓN: validación exitosa; no se modificó ningún archivo.');
} else {
  const dateSuffix = new Date().toISOString().replace(/[-:T]/g, '').replace(/\..+/, '').replace('Z', '');
  let backupPath = `${jsonPath}.bak-${dateSuffix}`;
  for (let i = 1; existsSync(backupPath); i++) backupPath = `${jsonPath}.bak-${dateSuffix}-${i}`;
  copyFileSync(jsonPath, backupPath, 0);
  writeFileSync(jsonPath, modifiedText, 'utf8');
  console.log(`JSON actualizado: ${jsonPath}`);
  console.log(`Backup: ${backupPath}`);
}
