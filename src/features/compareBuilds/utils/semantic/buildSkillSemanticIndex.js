// src/features/compareBuilds/utils/semantic/buildSkillSemanticIndex.js
import { TAGS, TAG_META } from "./semanticTags";
import { skillSemanticOverrides } from "./skillSemanticOverrides";

function textOfSkill(skill) {
  const a = skill?.base_description || "";
  const b = skill?.aced_description || "";
  return `${a}\n${b}`.toLowerCase();
}

function extractValues(skill) {
  // values can be null
  const v = skill?.values;
  if (!v || typeof v !== "object") return [];
  return Object.entries(v).map(([k, obj]) => ({
    key: k,
    value: obj?.value,
    type: obj?.type
  }));
}

// Convert a value into a rough "impact magnitude"
function valueMagnitude({ value, type }) {
  if (value === null || value === undefined) return 0;
  const n = Number(value);
  if (Number.isNaN(n)) return 0;

  // Heuristic scaling:
  // - "rate" often means 0.xx; use absolute
  // - "flat" varies (seconds, charges, meters); damp a bit
  if (type === "rate") return Math.abs(n) * 100; // 0.2 -> 20
  return Math.abs(n); // flat
}

function addTag(outTags, outWeights, tag, amount) {
  outTags.add(tag);
  outWeights[tag] = (outWeights[tag] || 0) + (amount || 1);
}

function inferTagsForSkill(skillKey, skill) {
  // overrides first
  if (skillSemanticOverrides[skillKey]) {
    const tags = new Set(skillSemanticOverrides[skillKey]);
    const weights = {};
    for (const t of tags) weights[t] = 1;
    return { tags, weights, source: "override" };
  }

  const t = textOfSkill(skill);
  const vals = extractValues(skill);

  const tags = new Set();
  const weights = {};

  // -------- Weapons by mention
  const mentionsAR = t.includes("assault rifle") || t.includes(" lmg");
  const mentionsShotgun = t.includes("shotgun");
  const mentionsHandgun = t.includes("handgun");
  const mentionsMarksman = t.includes("marksman");

  // -------- Core mechanics keywords
  const mentionsAccuracy = t.includes("accuracy");
  const mentionsStability = t.includes("stability");
  const mentionsReload = t.includes("reload");
  const mentionsDamage = t.includes("damage");
  const mentionsArmorRegen = t.includes("armor regeneration");
  const mentionsDamageReduction = t.includes("take") && t.includes("less damage");
  const mentionsMarked = t.includes("marked");
  const mentionsFlashbang = t.includes("flashbang");
  const mentionsShock = t.includes("shock grenade");
  const mentionsFrag = t.includes("frag grenade");
  const mentionsRuntime = t.includes("runtime");
  const mentionsCamera = t.includes("camera");
  const mentionsLoop = t.includes("loop");
  const mentionsTurret = t.includes("sentry turret");
  const mentionsHeat = t.includes("heat buildup") || t.includes("overheat");
  const mentionsHostage = t.includes("hostage") || t.includes("trade");
  const mentionsCarry = t.includes("carry") || t.includes("bags");
  const mentionsUnmasked = t.includes("unmasked");
  const mentionsRestoreTool = t.includes("restore") && t.includes("tool");
  const mentionsRestoreThrowable = t.includes("restore") && t.includes("throwable");
  const mentionsArmorLayer = t.includes("armor layer");
//   const mentionsDown = t.includes("down");

  // -------- Value signals (stronger than plain text)
  const hasAddedCharges = vals.some(v => v.key.toLowerCase().includes("additionalcharges"));
  const hasIncomingDamage = vals.some(v => v.key.toLowerCase().includes("increasedincomingdamage"));
  const hasDuration = vals.some(v => v.key.toLowerCase().includes("duration"));
  const hasRegenReductionTime = vals.some(v => v.key.toLowerCase().includes("regenreductiontime"));
  const hasDamageReduction = vals.some(v => v.key.toLowerCase().includes("damagereduction"));
  const hasInventoryAmmo = vals.some(v => v.key.toLowerCase().includes("increasedinventoryammo"));
  const hasTurretHeat = vals.some(v => v.key.toLowerCase().includes("heatbuildup"));
  const hasTurretDamage = vals.some(v => v.key.toLowerCase().includes("increaseddamage"));

  // -------- Assign tags + weights
  // AR
  if (mentionsAR) {
    if (mentionsDamage) addTag(tags, weights, TAGS.AR_DAMAGE, 1);
    if (mentionsAccuracy) addTag(tags, weights, TAGS.AR_ACCURACY, 1);
    if (mentionsStability) addTag(tags, weights, TAGS.AR_STABILITY, 1);
    if (hasInventoryAmmo || t.includes("reserve ammo")) addTag(tags, weights, TAGS.AR_AMMO, 1);
  }

  // Shotgun
  if (mentionsShotgun) {
    if (mentionsDamage) addTag(tags, weights, TAGS.SHOTGUN_DAMAGE, 1);
    if (mentionsReload) addTag(tags, weights, TAGS.SHOTGUN_RELOAD, 1);
    if (mentionsDamageReduction) addTag(tags, weights, TAGS.SHOTGUN_SURVIVABILITY, 1);
  }

  // Pistol
  if (mentionsHandgun) {
    if (mentionsDamage) addTag(tags, weights, TAGS.PISTOL_DAMAGE, 1);
    if (mentionsAccuracy) addTag(tags, weights, TAGS.PISTOL_ACCURACY, 1);
    if (mentionsDamageReduction) addTag(tags, weights, TAGS.PISTOL_SURVIVABILITY, 1);
    // restore/utility patterns in handgun skills often exist
    if (mentionsMarked || mentionsRestoreTool || mentionsRestoreThrowable) addTag(tags, weights, TAGS.PISTOL_UTILITY, 1);
  }

  // Marksman
  if (mentionsMarksman && (hasInventoryAmmo || t.includes("reserve ammo"))) {
    addTag(tags, weights, TAGS.MARKSMAN_AMMO, 1);
  }

  // Defense / sustain
  if (mentionsArmorRegen || hasRegenReductionTime) addTag(tags, weights, TAGS.ARMOR_REGEN, 1);
  if (mentionsDamageReduction || hasDamageReduction) addTag(tags, weights, TAGS.DAMAGE_REDUCTION, 1);
  if (t.includes("dodge")) addTag(tags, weights, TAGS.DODGE, 1);
  if (t.includes("maximum health")) addTag(tags, weights, TAGS.HEALTH_MAX, 1);
  if (t.includes("heal")) addTag(tags, weights, TAGS.HEALING, 1);
  if (mentionsArmorLayer) addTag(tags, weights, TAGS.ARMOR_REPAIR, 1);
//   if (mentionsDown) addTag(tags, weights, TAGS.DOWNS, 1);

  // Marking
  if (mentionsMarked) addTag(tags, weights, TAGS.MARKING, 1);

  // Flashbang / Shock / Frag
  if (mentionsFlashbang) {
    addTag(tags, weights, TAGS.FLASHBANG, 1);
    if (hasDuration || t.includes("stun duration")) addTag(tags, weights, TAGS.FLASHBANG_STUN, 1);
    if (hasIncomingDamage || t.includes("take") && t.includes("more damage")) addTag(tags, weights, TAGS.FLASHBANG_VULN, 1);
  }

  if (mentionsShock) {
    addTag(tags, weights, TAGS.SHOCK_GRENADE, 1);
    if (hasDuration || t.includes("stun duration")) addTag(tags, weights, TAGS.SHOCK_STUN, 1);
    if (hasIncomingDamage) addTag(tags, weights, TAGS.SHOCK_VULN, 1);
  }

  if (mentionsFrag) {
    addTag(tags, weights, TAGS.FRAG_GRENADE, 1);
    if (hasIncomingDamage) addTag(tags, weights, TAGS.FRAG_VULN, 1);
  }

  // Hacking / camera
  if (mentionsRuntime) addTag(tags, weights, TAGS.HACKING, 1);
  if (mentionsCamera) addTag(tags, weights, TAGS.HACKING, 1);
  if (mentionsLoop && mentionsCamera) addTag(tags, weights, TAGS.CAMERA_LOOP, 1);

  // Turrets
  if (mentionsTurret) addTag(tags, weights, TAGS.TURRET, 1);
  if (mentionsTurret && hasTurretDamage) addTag(tags, weights, TAGS.TURRET_DAMAGE, 1);
  if (mentionsTurret && (mentionsHeat || hasTurretHeat)) addTag(tags, weights, TAGS.TURRET_HEAT, 1);

  // Deployables
  if (t.includes("ammo bag") || t.includes("ammo bags")) addTag(tags, weights, TAGS.AMMO_BAG, hasAddedCharges ? 2 : 1);
  if (t.includes("armor bag") || t.includes("armor bags")) addTag(tags, weights, TAGS.ARMOR_BAG, hasAddedCharges ? 2 : 1);
  if (t.includes("medic bag") || t.includes("medic bags")) addTag(tags, weights, TAGS.MEDIC_BAG, 1);

  // Hostages / carry
  if (mentionsHostage) addTag(tags, weights, TAGS.HOSTAGES, 1);
  if (mentionsCarry) addTag(tags, weights, TAGS.CARRY, 1);

  // Stealth unmasked
  if (mentionsUnmasked) addTag(tags, weights, TAGS.STEALTH_UNMASKED, 1);

  // Restores (generic economy)
  if (mentionsRestoreTool) addTag(tags, weights, TAGS.TOOL_RESTORE, 1);
  if (mentionsRestoreThrowable) addTag(tags, weights, TAGS.THROWABLE_RESTORE, 1);

  // -------- Weighting from numeric values (boost weight for “real magnitude”)
  // We distribute value magnitude across all tags that got assigned,
  // so stronger skills contribute more to their categories.
  const totalMag = vals.reduce((acc, x) => acc + valueMagnitude(x), 0);
  if (tags.size && totalMag > 0) {
    const boost = totalMag / 50; // dampener; tune later
    for (const tag of tags) {
      weights[tag] = (weights[tag] || 1) + boost;
    }
  }

  return { tags, weights, source: "auto" };
}

export function buildSkillSemanticIndex(skillsData) {
  const tagsBySkillKey = {};
  const weightsBySkillKey = {};
  const sourcesBySkillKey = {};

  for (const [skillKey, skill] of Object.entries(skillsData || {})) {
    const { tags, weights, source } = inferTagsForSkill(skillKey, skill);
    tagsBySkillKey[skillKey] = [...tags];
    weightsBySkillKey[skillKey] = weights;
    sourcesBySkillKey[skillKey] = source;
  }

  return {
    tagsBySkillKey,
    weightsBySkillKey,
    sourcesBySkillKey,
    tagMeta: TAG_META
  };
}