// import { normalize } from "./normalize";

// export function getSuggestions(query, catalog, activeChips = []) {
//   if (!query) return [];

//   const q = normalize(query);

//   const alreadySelected = new Set(
//     activeChips.map(c => `${c.kind}:${c.key}`)
//   );

//   const matches = catalog
//     .filter(item => item.searchText.includes(q))
//     .filter(item => !alreadySelected.has(`${item.kind}:${item.key}`))
//     .map(item => {
//       const startsWith = item.searchText.startsWith(q);
//       const score = startsWith ? 2 : 1;

//       return { ...item, score };
//     })
//     .sort((a, b) => b.score - a.score)
//     .slice(0, 12);

//   return matches;
// }
import { normalize } from "./normalize";

export function getSuggestions(query, catalog, activeChips = []) {
//   const q = normalize(query);
const q = normalize(query).trim().replace(/\s+/g, " ");
const qNoSpace = q.replace(/\s+/g, "");

  if (!q) return [];

  const alreadySelected = new Set(activeChips.map((c) => signature(c)));

  const scored = [];

  for (const item of catalog) {
    if (alreadySelected.has(signature(item))) continue;
    // if (!item.searchText.includes(q)) continue;
    if (
        !item.searchText.includes(q) &&
        !item.searchText.includes(qNoSpace)
        ) {
        continue;
        }

    // score base
    let score = 0;

    // Prioridad de tipo de sugerencia
    // Querés que "pistol" muestre primero Weapon Type, después pistolas por nombre.
    if (item.kind === "weaponType") score += 100;

    // Mejor si el label empieza con el query (más “typeahead”)
    const labelNorm = normalize(item.label);
    if (labelNorm.startsWith(q)) score += 20;

    // si alguna palabra empieza con q
    if (labelNorm.split(" ").some((w) => w.startsWith(q))) score += 10;

    // match en searchText
    if (item.searchText.startsWith(q)) score += 5;

    // Bonus si es match exacto de tipo (pistol -> weaponType pistol)
    if (item.kind === "weaponType" && item.weaponType === q) score += 30;

    scored.push({ ...item, __score: score });
  }

  scored.sort((a, b) => b.__score - a.__score);

  return scored.slice(0, 12);
}

function signature(x) {
  // Chips y catalog comparten kind+key como firma
  return `${x.kind}:${x.key}`;
}
