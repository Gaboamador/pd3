/**
 * Ejecutar desde la RAÍZ del proyecto PD3:
 *   node scripts/apply-throwable-stats.mjs
 *
 * Agrega las estadísticas a los siete throwables según su `key`.
 * Conserva todos los demás elementos, incluyendo las Iconic nuevas.
 * Crea un backup sin sobrescribir copias preexistentes.
 */
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/data/payday3_loadout_items.json");
const backup = `${file}.backup-before-throwable-stats`;

const STATS_BY_KEY = {
  FragGrenade: {
    damage: 150,
    ap: 2,
    capacity: 3,
    explosionRadius: 8,
    detonationTime: 3,
  },
  Flashbang: {
    damage: 0,
    ap: 0,
    capacity: 3,
    explosionRadius: 8,
    detonationTime: 3,
  },
  PlayerSmokeGrenade: {
    damage: 0,
    ap: 0,
    capacity: 3,
    explosionRadius: 10,
    detonationTime: null,
  },
  Knife: {
    damage: 150,
    ap: 2,
    capacity: 2,
    explosionRadius: null,
    detonationTime: null,
  },
  ShockGrenade: {
    damage: 0,
    specialEffect: "Insta-kills Shields, Zappers, and Techies",
    ap: 0,
    capacity: 3,
    affectedEnemies: 7,
    detonationTime: 3,
    secondaryDetonationTime: 1.5,
  },
  Studsgranat: {
    damage: 400,
    ap: 0,
    capacity: 3,
    explosionRadius: 8,
    detonationTime: 3,
  },
  Tomahawk: {
    damage: 350,
    ap: 10,
    capacity: 1,
  },
};

if (!fs.existsSync(file)) {
  throw new Error(`No existe ${file}. Ejecutá el script desde la raíz de PD3.`);
}

const original = fs.readFileSync(file, "utf8");
const data = JSON.parse(original);
const throwable = data.throwable;
if (!throwable || typeof throwable !== "object") {
  throw new Error("No se encontró el objeto throwable en payday3_loadout_items.json.");
}

const byKey = new Map(Object.entries(throwable).map(([id, item]) => [item.key, id]));
const missing = Object.keys(STATS_BY_KEY).filter((key) => !byKey.has(key));
if (missing.length) {
  throw new Error(`No se modificó el JSON. Throwables no encontrados: ${missing.join(", ")}`);
}

let changed = 0;
for (const [key, stats] of Object.entries(STATS_BY_KEY)) {
  const id = byKey.get(key);
  const item = throwable[id];
  if (item.stats !== undefined) {
    if (JSON.stringify(item.stats) === JSON.stringify(stats)) continue;
    throw new Error(`El throwable ${key} ya tiene stats diferentes. No se realizó ningún guardado.`);
  }
}

for (const [key, stats] of Object.entries(STATS_BY_KEY)) {
  const id = byKey.get(key);
  const item = throwable[id];
  if (item.stats !== undefined) continue;

  // Insertar stats antes de description para mantener la estructura legible.
  const withStats = {};
  let inserted = false;
  for (const [property, value] of Object.entries(item)) {
    if (property === "description") {
      withStats.stats = stats;
      inserted = true;
    }
    withStats[property] = value;
  }
  if (!inserted) withStats.stats = stats;
  throwable[id] = withStats;
  changed++;
}

if (changed === 0) {
  console.log("Los 7 throwables ya tienen estas estadísticas. No se modificó el JSON.");
} else {
  // Flag `wx` evita reemplazar un backup existente.
  fs.writeFileSync(backup, original, { flag: "wx" });
  fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  console.log(`Estadísticas agregadas a ${changed} throwables.`);
  console.log(`Backup: ${backup}`);
}
