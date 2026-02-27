export function formatNumber(n) {
  if (n == null || Number.isNaN(n)) return null;
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export function parsePelletString(value) {
  if (typeof value !== "string") return null;

  const m = value.trim().match(/^(\d+)\s*[x×]\s*([0-9]+(?:\.[0-9]+)?)$/i);
  if (!m) return null;

  const pellets = parseInt(m[1], 10);
  const perPellet = parseFloat(m[2]);

  if (!Number.isFinite(pellets) || !Number.isFinite(perPellet)) return null;

  return { pellets, perPellet, total: pellets * perPellet };
}

export function formatDamageValue(value) {
  const parsed = parsePelletString(value);
  if (parsed) return `${value} (${formatNumber(parsed.total)})`;

  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;

  return null;
}

export function formatAP(value) {
  if (typeof value === "number") return formatNumber(value);
  if (typeof value === "string") return value;
  return null;
}