/**
 * Construye un árbol por skill_tree_id y tier, ordenado por position.
 * Devuelve:
 * {
 *   [treeId]: {
 *     name: string,
 *     tiers: {
 *       [tierNumber]: SkillDef[]
 *     }
 *   }
 * }
 */
export function buildSkillTree(skillsData, skillGroupsData) {
  const skills = Object.values(skillsData || {});
  const treeNameMap = buildTreeNameMap(skillGroupsData);

  const result = {};

  for (const skill of skills) {
    const treeId = String(skill.skill_tree_id ?? "unknown");
    const tier = Number(skill.tier ?? 1);

    if (!result[treeId]) {
      result[treeId] = {
        id: treeId,
        name: treeNameMap[treeId] ?? `Tree ${treeId}`,
        tiers: {},
      };
    }
    if (!result[treeId].tiers[tier]) result[treeId].tiers[tier] = [];

    result[treeId].tiers[tier].push(skill);
  }

  // sort tiers content
  for (const treeId of Object.keys(result)) {
    const tiers = result[treeId].tiers;
    for (const tierKey of Object.keys(tiers)) {
      tiers[tierKey].sort((a, b) => {
        const pa = Number(a.position ?? 0);
        const pb = Number(b.position ?? 0);
        return pa - pb;
      });
    }
  }

  return result;
}

/**
 * Intenta extraer nombres de árboles desde payday3_skill_groups.json.
 * Como el shape puede variar, lo hacemos defensivo.
 */
function buildTreeNameMap(skillGroupsData) {
  const map = {};

  // Caso común: array de grupos con { skill_tree_id, name } o { id, name }
  if (Array.isArray(skillGroupsData)) {
    for (const g of skillGroupsData) {
      const treeId = g?.skill_tree_id ?? g?.id ?? g?.key;
      const name = g?.name ?? g?.title;
      if (treeId != null && name) map[String(treeId)] = String(name);
    }
    return map;
  }

  // Caso: objeto con keys
  if (skillGroupsData && typeof skillGroupsData === "object") {
    for (const [k, g] of Object.entries(skillGroupsData)) {
      const treeId = g?.skill_tree_id ?? g?.id ?? g?.key ?? k;
      const name = g?.name ?? g?.title;
      if (treeId != null && name) map[String(treeId)] = String(name);
    }
  }

  return map;
}
