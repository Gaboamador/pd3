// src/utils/skillText.utils.js

function formatValueByType(v, type) {
  if (v == null || Number.isNaN(Number(v))) return "";
  const n = Number(v);

  if (type === "rate") {
    // en los json rate suele venir como 0.04 => 4%
    const pct = n * 100;
    // 2 decimales si hace falta
    const s =
      Math.abs(pct - Math.round(pct)) < 1e-9 ? String(Math.round(pct)) : pct.toFixed(2);
    return `${s}%`;
  }

  // flat u otros
  const s =
    Math.abs(n - Math.round(n)) < 1e-9 ? String(Math.round(n)) : n.toFixed(2);
  return s;
}

function stripSkillTags(text) {
  if (!text) return "";
  // <Skill>1</> => 1
  return text.replace(/<\/?Skill>/g, "").replace(/<\/>/g, "");
}

function replacePluralToken(raw, tokenValue) {
  // "{X}|plural(one=time,other=times)" -> elige según tokenValue == 1
  // raw llega sin llaves (el fragmento completo)
  const m = raw.match(/^\{([^}]+)\}\|plural\(one=([^,]+),other=([^)]+)\)$/);
  if (!m) return null;

  const n = Number(tokenValue);
  const one = m[2];
  const other = m[3];
  return n === 1 ? one : other;
}

/**
 * Reemplaza {Key} por values[Key].value (formateado según type).
 * Soporta "{Key}|plural(one=...,other=...)".
 * Elimina líneas/fragmentos Computed{...} típicos para no ensuciar.
 */
export function renderSkillText(template, valuesMap) {
  if (!template) return "";

  let text = stripSkillTags(template);

  // 1) plural tokens primero (porque también incluye {Key})
  // buscamos patrones completos del estilo "{X}|plural(...)"
  text = text.replace(/\{[^}]+\}\|plural\(one=[^,]+,other=[^)]+\)/g, match => {
    const key = match.match(/^\{([^}]+)\}/)?.[1];
    if (!key) return match;

    const vObj = valuesMap?.[key];
    const vRaw = vObj?.value;
    const pluralWord = replacePluralToken(match, vRaw);
    if (pluralWord == null) return match;

    // reemplazamos solo el sufijo plural, pero el {Key} lo dejamos para el paso 2
    // return `{${key}} ${pluralWord}`;
    return pluralWord;
  });

  // 2) tokens {Key}
  text = text.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key) => {
    const vObj = valuesMap?.[key];

    // Si es un "Computed..." que suele ser 0 + text, lo omitimos
    if (key.startsWith("Computed")) return "";

    if (!vObj) return `{${key}}`; // deja visible si falta data

    const rendered = formatValueByType(vObj.value, vObj.type);
    return rendered || "";
  });

  // 3) limpieza: borra líneas vacías sobrantes
  text = text
    .split("\n")
    .map(l => l.trimEnd())
    .filter(l => l.trim() !== "")
    .join("\n");

  return text;
}
