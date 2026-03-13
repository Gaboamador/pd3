export function computeBuildSemanticProfile(build, semanticIndex) {
  const scoreByTag = {};
  const contributorsByTag = {};

  const skills = build?.skills || {};
  const weightsBySkill = semanticIndex?.weightsBySkillKey || {};
  const tagsBySkill = semanticIndex?.tagsBySkillKey || {};

  for (const [skillKey, state] of Object.entries(skills)) {
    const hasBase = !!state?.base;
    const hasAced = !!state?.aced;
    if (!hasBase && !hasAced) continue;

    const levelMult = hasAced ? 1.35 : 1.0; // tune later

    const tags = tagsBySkill[skillKey] || [];
    const weights = weightsBySkill[skillKey] || {};

    for (const tag of tags) {
      const w = (weights[tag] || 1) * levelMult;
      scoreByTag[tag] = (scoreByTag[tag] || 0) + w;

      if (!contributorsByTag[tag]) contributorsByTag[tag] = [];
      contributorsByTag[tag].push({
        skillKey,
        level: hasAced ? "aced" : "base",
        weight: w
      });
    }
  }

  // sort contributors by weight desc
  for (const tag of Object.keys(contributorsByTag)) {
    contributorsByTag[tag].sort((a, b) => b.weight - a.weight);
  }

  return { scoreByTag, contributorsByTag };
}