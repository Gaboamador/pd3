export function buildSkillUIIndex(skillsData, skillGroupsData) {
  const groups = Object.values(skillGroupsData || {})
    .filter(Boolean)
    .map(g => ({
      groupId: Number(g.id),
      key: g.key,
      name: g.name,
      position: Number(g.position ?? 999),
      sprite: g.sprite ?? null,
      treesRaw: g.trees || {},
    }))
    .sort((a, b) => a.position - b.position);

  return groups.map(g => {
    const trees = Object.values(g.treesRaw || {})
      .filter(Boolean)
      .map(t => ({
        treeId: Number(t.id),
        key: t.key,
        name: t.name,
        position: Number(t.position ?? 999),
        skill_category_id: Number(t.skill_category_id ?? g.groupId),
        skillsRaw: t.skills || [],
      }))
      .sort((a, b) => a.position - b.position)
      .map(t => {
        const skills = (t.skillsRaw || [])
          .map(sRef => {
            const full = skillsData?.[sRef.key] || null;
            if (!full) return null;

            return {
              ...full,
              groupId: g.groupId,
              treeId: t.treeId,
              treeKey: t.key,
              treeName: t.name,
            };
          })
          .filter(Boolean)
          // por si acaso: orden por tier desc (arriba) y position asc
          .sort((a, b) => {
            if (a.tier !== b.tier) return b.tier - a.tier;
            return (a.position ?? 999) - (b.position ?? 999);
          });

        return { ...t, skills };
      });

    return {
      groupId: g.groupId,
      key: g.key,
      name: g.name,
      position: g.position,
      sprite: g.sprite ?? null,
      trees
    };
  });
}
