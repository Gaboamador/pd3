function formatValueByType(v, type) {
  if (v == null || Number.isNaN(Number(v))) return "";
  const n = Number(v);

  if (type === "rate") {
    const pct = n * 100;

    // hasta 3 decimales pero sin ceros innecesarios
    return `${parseFloat(pct.toFixed(3))}%`;
  }

  // flat u otros
    const rounded = parseFloat(n.toFixed(3));
    if (Math.abs(rounded - Math.round(rounded)) < 1e-9) {
      return String(Math.round(rounded));
    }
    return String(rounded);
}

// function stripSkillTags(text) {
//   if (!text) return "";
//   // <Skill>1</> => 1
//   // return text.replace(/<\/?Skill>/g, "").replace(/<\/>/g, "");
//   return text.replace(/<\/?Skill>/g, "");
// }
function stripSkillTags(text) {
  if (!text) return "";

  // Convierte <Skill>1</> en "1" (incluye el cierre </>)
  // NO toca <Enemy>...</>
  let out = text.replace(/<Skill>(.*?)<\/>/g, "$1");

  // Por si quedara algún <Skill> suelto (sin cierre), lo removemos igual
  out = out.replace(/<\/?Skill>/g, "");

  return out;
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
    // .filter(l => l.trim() !== "")
    .join("\n");

  // evita múltiples líneas en blanco cuando se eliminan tokens {Computed}
  text = text.replace(/\n{3,}/g, "\n\n");

  return text;
}
