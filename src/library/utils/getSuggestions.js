import { normalize } from "./normalize";
import { searchSkillDescriptions } from "../../features/catalog/components/utils/searchSkillDescriptions";

  const KIND_BASE_WEIGHT = {
    skillDescriptionSearch: 1000,
    weaponType: 40,
    category: 35,
    tree: 30,
    armor: 25,
    plate: 20,
    throwable: 15,
    deployable: 10,
    tool: 5,
    skill: 0
  };
  
export function getSuggestions(query, catalog, activeChips = [], skillsData) {
  const q = normalize(query).trim().replace(/\s+/g, " ");
  const descriptionMatches =
  q.length >= 3
    ? searchSkillDescriptions(q, skillsData).length
    : 0;
  const qNoSpace = q.replace(/\s+/g, "");

  if (!q) return [];

  const suggestions = [];

  // opción especial: search in skill descriptions, solo mostrar la opción si el query tiene ≥3 caracteres
  if (q.length >= 3 && descriptionMatches > 0) {
    suggestions.push({
      kind: "skillDescriptionSearch",
      key: `desc:${q}`,
      label: `Search skill descriptions for "${query}" (${descriptionMatches})`,
      query: query,
      searchText: q
    });
  }

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
    // if (item.kind === "weaponType") score += 100;
    score += KIND_BASE_WEIGHT[item.kind] ?? 0;

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

  // return scored.slice(0, 12);
  return [
    ...suggestions,
    ...scored.slice(0, 11)
  ];
}

function signature(x) {
  // Chips y catalog comparten kind+key como firma
  return `${x.kind}:${x.key}`;
}
