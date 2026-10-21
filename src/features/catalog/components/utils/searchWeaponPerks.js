// Coincide con el criterio de búsqueda del selector de armas del Build Editor.
const normalize = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase();

export function searchWeaponPerks(perks, query) {
  const term = normalize(query.trim());
  return [...perks]
    .filter((perk) => perk?.key && (!term || normalize(perk.name ?? perk.key).includes(term)))
    .sort((a, b) => (a.name ?? a.key).localeCompare(b.name ?? b.key));
}
