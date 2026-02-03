import { MAX_SKILL_POINTS } from "./build.constants";
import { calculateSkillPoints } from "./utils/skillPoints.utils";
import { validateArmorPlatesOrder } from "./utils/armor.utils";
import { validateWeaponMods } from "./utils/loadout.utils";

/**
 * @param {import("./build.types").Build} build
 * @param {{ skillsData: Record<string, any>, loadoutData: any, platesData: Record<string, any> }} data
 */
export function validateBuild(build, data) {
  const issues = [];

  // Skills
  const points = calculateSkillPoints(build.skills, data.skillsData);
  if (points > MAX_SKILL_POINTS) {
    issues.push({
      code: "SKILL_POINTS_EXCEEDED",
      message: `Skill points excedidos: ${points}/${MAX_SKILL_POINTS}`,
    });
  }

  for (const [skillKey, state] of Object.entries(build.skills || {})) {
    if (state?.aced && !state?.base) {
      issues.push({
        code: "SKILL_ACED_WITHOUT_BASE",
        message: `Skill ${skillKey}: aced requiere base`,
        meta: { skillKey },
      });
    }
  }

  // Armor plates order / capacity
  const armorIssues = validateArmorPlatesOrder(build.loadout?.armor, data.loadoutData, data.platesData);
  issues.push(...armorIssues);

  // Weapons & mods validity
  const modIssues = validateWeaponMods(build.loadout, data.loadoutData);
  issues.push(...modIssues);

  return { ok: issues.length === 0, issues };
}
