export default function buildSkillLookup(skillGroups) {
  const map = {};

  Object.values(skillGroups || {}).forEach((group) => {
    Object.values(group.trees || {}).forEach((tree) => {
      (tree.skills || []).forEach((skill) => {
        map[skill.key] = {
          group: group.name,
          tree: tree.name,
        };
      });
    });
  });

  return map;
}