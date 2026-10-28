import { mkdir, writeFile, access } from "node:fs/promises";
import path from "node:path";

const API = "https://payday.fandom.com/api.php";
const OUT = "payday3_mods";
const H_API = { "User-Agent": "payday3-tool/1.0" };
const H_IMG = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Referer: "https://payday.fandom.com/",
  Accept: "image/avif,image/webp,image/png,image/*,*/*;q=0.8",
};

const ARMAS = `
CAR-4, Northwest B-9, VF-7S, KU-59, Adelig RG5, Chanit S3, Skogskrigare AG-9,
Dual Grimshot, Dual Outlaw,
Zokas-17, Blyspruta MX63,
Reinfeld 900S, Spearfish 1895, SA A144, FIK-22 TLR,
Reinfeld 880, Mosconi 12 Classic, FSA-12G, M7 Pursuivant, TAS-12,
FIK PC9, Ziv Commando, SG Compact-7, ATK-7, WAR-45,
Signature 40, Tribune 32, Signature 403, SP Model 11, Stryk 7,
Garstini Viper .50AE, Jackknife SE5, Picchio Duro 5,
J&M Castigo 44, Sforza Bison, Bullkick 500,
Justicar, Locomotive 12G,
Russell JB-9
`.split(",").map(a => a.trim()).filter(Boolean);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const norm = s => s.replaceAll("_", " ").trim();

async function api(params) {
  const url = new URL(API);
  for (const [k, v] of Object.entries({ ...params, format: "json" })) {
    url.searchParams.set(k, v);
  }
  const res = await fetch(url, { headers: H_API });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

async function sections(titulo) {
  const d = await api({ action: "parse", page: titulo, prop: "sections", redirects: 1 });
  return d.parse?.sections ?? [];
}

// ---------- 1) Nombres de archivo por arma ----------
const mods = {};          // nombre normalizado -> armas
const problemas = [];

// Nombres mal escritos en las páginas -> nombre real del archivo
const ALIAS = {
  "KU59PerforatedGrip.png": "KU59 Perforated Grip.png",
  "S430 Ribbed Grip.png": "S403 Ribbed Grip.png",
  "S403 Quick-Pull Mag.png.png": "S403 Quick-Pull Mag.png",
  "ARG5 Rigger Handstop.png": "Rigger Handstop.png",
  "B500 Snapshot Clear-Tag.png": "Snapshot Clear-Tag.png",
};

for (const arma of ARMAS) {
  let titulo = null, secs = [];
  for (const candidato of [`${arma} (Payday 3)`, arma]) {
    secs = await sections(candidato);
    if (secs.length) { titulo = candidato; break; }
  }

  if (!titulo) {
    const s = await api({ action: "query", list: "search", srsearch: arma, srlimit: 3 });
    const sugeridos = s.query.search.map(x => x.title);
    problemas.push({ arma, motivo: "página no encontrada", sugeridos });
    continue;
  }

  const sec = secs.find(s =>
  /^(available )?modifications$/i.test(s.line.replace(/\s+/g, " ").trim()));
  if (!sec) {
    problemas.push({ arma, titulo, motivo: "sin sección Available Modifications",
                     secciones: secs.map(s => s.line) });
    continue;
  }

  const d = await api({ action: "parse", page: titulo, section: sec.index,
                        prop: "images", redirects: 1 });
  for (const f of d.parse.images) {
    if (/Perk Icon|^Icon |Preview/i.test(f)) continue;
    const clave = ALIAS[norm(f)] ?? norm(f);
    (mods[clave] ??= []).push(arma);
  }
  console.log(`${arma}: ${d.parse.images.length} imágenes`);
  await sleep(200);
}

console.log(`\n${Object.keys(mods).length} candidatos`);
console.log("Problemas:");
console.dir(problemas, { depth: null });

// ---------- 2) URLs directas + tamaños (de a 50 títulos) ----------
const nombres = Object.keys(mods);
const archivos = [];      // { nombre, url, width, height }
const faltantes = [];

for (let i = 0; i < nombres.length; i += 50) {
  const lote = nombres.slice(i, i + 50);
  const d = await api({
    action: "query",
    titles: lote.map(n => "File:" + n).join("|"),
    prop: "imageinfo", iiprop: "url|size", redirects: 1,
  });
  for (const p of Object.values(d.query.pages)) {
    const info = p.imageinfo?.[0];
    if (!info) { faltantes.push(p.title.replace(/^File:/, "")); continue; }
    archivos.push({
      nombre: p.title.replace(/^File:/, ""),
      url: info.url, width: info.width, height: info.height,
    });
  }
  await sleep(200);
}

const utiles = faltantes.filter(n => !/^[\d,.\s]+(\.png)?$/i.test(n)); // ignora "50", "10,000", etc.
console.log("\nArchivos que no existen con ese nombre:");
for (const n of utiles) {
  const base = n.replace(/(\.png)+$/i, "");
  const s = await api({ action: "query", list: "search", srnamespace: 6, srsearch: base, srlimit: 3 });
  console.log(n, "->", s.query.search.map(x => x.title));
  await sleep(200);
}

// Mods = imágenes de al menos 200x100 (descarta iconos chicos como 50, 10,000, etc.)
const finales = archivos.filter(a => a.width >= 200 && a.height >= 100);
console.log(`${finales.length} mods tras filtrar por tamaño (${archivos.length - finales.length} descartados)`);

// ---------- 3) Descarga ----------
await mkdir(OUT, { recursive: true });
let ok = 0, fallos = 0;

for (const a of finales) {
  const destino = path.join(OUT, a.nombre.replaceAll(" ", "_"));
  try { await access(destino); ok++; continue; } catch {}   // ya existe: se saltea

  const res = await fetch(a.url, { headers: H_IMG });
  if (!res.ok) {
    console.log("ERROR", a.nombre, res.status);
    fallos++;
    continue;
  }
  await writeFile(destino, Buffer.from(await res.arrayBuffer()));
  ok++;
  await sleep(100);
}

const salida = Object.fromEntries(
  finales.map(a => [a.nombre.replaceAll(" ", "_"), mods[norm(a.nombre)] ?? mods[a.nombre] ?? []])
);
await writeFile("mods_por_arma.json", JSON.stringify(salida, null, 2), "utf8");

console.log(`\nListo: ${ok} descargadas, ${fallos} con error.`);