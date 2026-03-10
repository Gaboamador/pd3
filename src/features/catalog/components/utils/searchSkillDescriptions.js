import { normalize } from "../../../../library/utils/normalize";

export function searchSkillDescriptions(query, skillsData) {

  const q = normalize(query).trim();

  if (!q) return [];

  const matches = [];

  for (const skill of Object.values(skillsData)) {

    const base = normalize(skill.base_description || "");
    const aced = normalize(skill.aced_description || "");

    if (base.includes(q) || aced.includes(q)) {
      matches.push(skill);
    }
  }

  return matches;
}