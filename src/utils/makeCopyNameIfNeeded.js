function normalizeName(s) {
  return (s ?? "").trim().toLowerCase();
}

export function makeCopyNameIfNeeded(baseName, libraryBuilds) {
  const cleanBase = (baseName ?? "").trim() || "New build";

  const taken = new Set(libraryBuilds.map(b => normalizeName(b.name)));

  // Si el nombre NO existe, lo dejamos tal cual
  if (!taken.has(normalizeName(cleanBase))) return cleanBase;

  // Si existe, probamos " (copy)", " (copy 2)", ...
  let i = 1;
  while (true) {
    const candidate = i === 1 ? `${cleanBase} (copy)` : `${cleanBase} (copy ${i})`;
    if (!taken.has(normalizeName(candidate))) return candidate;
    i += 1;
  }
}
