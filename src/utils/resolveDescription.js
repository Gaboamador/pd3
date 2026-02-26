export function resolveDescription(text, descValues) {
  if (!text) return "";
  if (!descValues) return text;

  let result = text;

  for (const [key, config] of Object.entries(descValues)) {
    const value = config?.value;

    if (value == null) continue;

    // 1️⃣ Plural primero (para evitar doble reemplazo)
    const pluralRegex = new RegExp(
      `\\{${key}\\}\\|plural\\(one=([^,]+),other=([^\\)]+)\\)`,
      "g"
    );

    result = result.replace(pluralRegex, (_, one, other) => {
      return value === 1 ? one : other;
    });

    // 2️⃣ Reemplazo simple {Key}
    const valueRegex = new RegExp(`\\{${key}\\}`, "g");
    result = result.replace(valueRegex, formatValue(value, config.type));
  }

  return result;
}

function formatValue(value, type) {
  if (type === "rate") {
    return `${Math.round(value * 100)}%`;
  }

  return value;
}