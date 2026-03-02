export function createSkillIndexMap(skillsData) {
  const keys = Object.keys(skillsData).sort();

  const keyToIndex = {};
  const indexToKey = {};

  keys.forEach((key, i) => {
    keyToIndex[key] = i;
    indexToKey[i] = key;
  });

  return { keyToIndex, indexToKey };
}