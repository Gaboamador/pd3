export function buildTreePool(skillGroupsData) {
  const primary = [];
  const secondary = [];

  Object.values(skillGroupsData).forEach(group => {
    const groupId = group.id;

    Object.values(group.trees).forEach(tree => {
      const treeIndex = tree.position + 1;

      const entry = {
        key: tree.key,
        name: tree.name,

        categoryId: group.id,
        categoryKey: group.key,
        categoryName: group.name,

        groupId,
        treeIndex,

        sprite: group.sprite,
        position: tree.position,
        isSecondary: tree.position === 2
      };

      if (entry.isSecondary) {
        secondary.push(entry);
      } else {
        primary.push(entry);
      }
    });
  });

  return { primary, secondary };
}