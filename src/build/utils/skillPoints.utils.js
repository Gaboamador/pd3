import { MAX_SKILL_POINTS } from "../build.constants";

/**
 * Calcula puntos totales usados según JSON:
 * skill.req_points.base / skill.req_points.aced
 */
export function calculateSkillPoints(buildSkills, skillsData) {
  let total = 0;
  const skills = buildSkills || {};

  for (const [skillKey, sel] of Object.entries(skills)) {
    const def = skillsData?.[skillKey];
    if (!def) continue;

    const baseCost = Number(def?.req_points?.base ?? 0);
    const acedCost = Number(def?.req_points?.aced ?? 0);

    if (sel?.base) total += baseCost;
    if (sel?.aced) total += acedCost;
  }

  return total;
}

export function canToggleBase({ current, skillDef, usedPoints }) {
  if (!skillDef) return false;

  const baseCost = Number(skillDef?.req_points?.base ?? 0);

  // si ya está comprada, se puede desmarcar (libera puntos)
  if (current?.base) return true;

  // si no está comprada, hay que tener puntos
  return usedPoints + baseCost <= MAX_SKILL_POINTS;
}

export function canToggleAced({ current, skillDef, usedPoints }) {
  if (!skillDef) return false;

  const acedCost = Number(skillDef?.req_points?.aced ?? 0);

  // si ya está aced, se puede desmarcar (libera puntos)
  if (current?.aced) return true;

  // para marcar aced: requiere base + puntos
  if (!current?.base) return false;

  return usedPoints + acedCost <= MAX_SKILL_POINTS;
}
