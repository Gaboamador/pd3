import fs from "node:fs";
import path from "node:path";

// Regenerar después de actualizar el PNG, el proyecto del Sprite Workshop y
// las referencias attachmentKey -> filename. Ejecutar en la raíz del proyecto.
const base = path.resolve("tools/weapon-mod-sources");
const project = JSON.parse(fs.readFileSync(path.join(base, "pd3_sprite_project.json"), "utf8"));
const weaponMap = JSON.parse(fs.readFileSync(path.join(base, "mapa_mods.json"), "utf8"));
const byFilename = new Map();

for (const item of project.items ?? []) {
  if (byFilename.has(item.filename)) throw new Error(`Duplicado en el sprite: ${item.filename}`);
  if (item.r < 1 || item.c < 1 || item.r > project.projectConfig.rows || item.c > project.projectConfig.cols) {
    throw new Error(`Coordenada inválida: ${item.filename}`);
  }
  byFilename.set(item.filename, { r: item.r, c: item.c });
}

const output = {};
let assigned = 0;
let missing = 0;
for (const [weaponKey, mods] of Object.entries(weaponMap)) {
  output[weaponKey] = {};
  for (const [attachmentKey, filename] of Object.entries(mods)) {
    if (filename === null) {
      output[weaponKey][attachmentKey] = null;
      missing++;
      continue;
    }
    const pos = byFilename.get(filename);
    if (!pos) throw new Error(`Falta imagen: ${weaponKey}/${attachmentKey} -> ${filename}`);
    output[weaponKey][attachmentKey] = pos;
    assigned++;
  }
}
const outputPath = path.resolve("src/data/weapon_attachment_sprite_positions.json");
fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
console.log(`Generado: ${assigned} referencias con ícono; ${missing} sin imagen. ${outputPath}`);
