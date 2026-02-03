import { calculateSkillPoints } from "./utils/skillPoints.utils";
import { MAX_SKILL_POINTS } from "./build.constants";

/**
 * @param {import("./build.types").Build} build
 * @param {Record<string, any>} skillsData
 */
export function selectUsedSkillPoints(build, skillsData) {
  return calculateSkillPoints(build.skills, skillsData);
}

export function selectRemainingSkillPoints(build, skillsData) {
  return MAX_SKILL_POINTS - selectUsedSkillPoints(build, skillsData);
}

export function selectIsOverSkillCap(build, skillsData) {
  return selectUsedSkillPoints(build, skillsData) > MAX_SKILL_POINTS;
}
