/**
 * Serializa chips activos para guardarlos en query param.
 * Se guarda solo lo necesario para reconstruir filtros.
 */

export function encodeFilters(chips) {
  if (!chips?.length) return "";

  const minimal = chips.map((chip) => {
    switch (chip.kind) {
      case "skill":
        return {
          k: "skill",
          key: chip.key,
          state: chip.state ?? "base",
        };

      case "weaponType":
        return {
          k: "weaponType",
          slot: chip.slot,
          weaponType: chip.weaponType,
        };

      case "buildName":
        return {
          k: "buildName",
          value: chip.rawValue ?? chip.label,
        };

      default:
        return {
          k: chip.kind,
          key: chip.key,
        };
    }
  });

  return btoa(JSON.stringify(minimal));
}

/**
 * Reconstruye chips desde query param.
 * Ojo: acá todavía no reconstruimos labels bonitos,
 * eso lo hacemos luego en Explorer usando el catálogo.
 */

export function decodeFilters(str) {
  try {
    const parsed = JSON.parse(atob(str));
    return parsed ?? [];
  } catch {
    return [];
  }
}
