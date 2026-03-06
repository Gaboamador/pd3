// src/features/compareBuilds/utils/semantic/generateSemanticInsights.js

function formatBuildList(labels) {
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")} and ${labels[labels.length - 1]}`;
}

function topContributorsText(contrib, skillNameByKey, max = 2) {
  const list = (contrib || []).slice(0, max);
  if (!list.length) return null;
  return list
    .map(x => `${skillNameByKey(x.skillKey)} (${x.level})`)
    .join(", ");
}

function getShortBuildLabel(build, idx) {
  return build?.name || `Build ${idx + 1}`;
}

export function generateSemanticInsights({ builds, buildLabels, semanticIndex, profiles, skillsData }) {
  const tagMeta = semanticIndex?.tagMeta || {};
  const skillNameByKey = (key) => skillsData?.[key]?.name || key;

  // Build tag->score matrix
  const buildIds = builds.map(b => b.id);
  const score = {};
  for (const b of builds) score[b.id] = profiles[b.id]?.scoreByTag || {};

  // Collect all tags
  const allTags = new Set();
  for (const id of buildIds) {
    for (const tag of Object.keys(score[id])) allTags.add(tag);
  }

  const insights = [];

  for (const tag of allTags) {
    // rank builds by this tag
    const ranked = buildIds
      .map(id => ({ id, v: score[id][tag] || 0 }))
      .sort((a, b) => b.v - a.v);

    // If nobody has it, ignore
    if (ranked[0].v <= 0) continue;

    // Create a “meaningful” difference threshold
    const best = ranked[0].v;
    const second = ranked[1]?.v ?? 0;
    const gap = best - second;

    // If gap is tiny, don’t spam.
    if (gap < Math.max(1.0, best * 0.15)) continue;

    const top = ranked.filter(x => x.v >= best * 0.85); // allow ties-ish
    const rest = ranked.filter(x => x.v < best * 0.85);

    // const topLabels = top.map(x => buildLabels[x.id] || x.id);
    // const restLabels = rest.map(x => buildLabels[x.id] || x.id);
    const buildNameById = Object.fromEntries(
      Object.entries(buildLabels).map(([id, label]) => {
        const short = label.replace(/^\d+\s*·\s*/, "");
        return [id, short];
      })
    );
    const topLabels = top.map(x => `[[${buildNameById[x.id]}]]`);
    const restLabels = rest.map(x => `[[${buildNameById[x.id]}]]`);

    const label = tagMeta?.[tag]?.label || tag;

    // Add “because of …” using top contributors from the strongest build
    const strongestId = ranked[0].id;
    const contrib = profiles[strongestId]?.contributorsByTag?.[tag] || [];
    const because = topContributorsText(contrib, skillNameByKey, 2);

    let text;
    if (restLabels.length) {
    text = `${formatBuildList(topLabels)} focuses more on **${label}** than ${formatBuildList(restLabels)}.`;
    } else {
    text = `${formatBuildList(topLabels)} strongly focuses on **${label}**.`;
    }

    if (because) {
    text += ` Mainly because of: ${because}.`;
    }

    insights.push({
      tag,
      label,
      scoreBest: best,
      scoreSecond: second,
      text
    });
  }

  // Most important first: bigger gap
  insights.sort((a, b) => (b.scoreBest - b.scoreSecond) - (a.scoreBest - a.scoreSecond));

  return insights.slice(0, 12);
}