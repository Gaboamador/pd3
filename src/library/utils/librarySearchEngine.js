import { normalize } from "./normalize";

function matchesFilter(build, filter, ctx) {
  const idx = build.__searchIndex;
  if (!idx) return false;

  switch (filter.type) {
    case "skill": {
      if (filter.state === "any") {
        return (
          idx.skills.base.has(filter.key) ||
          idx.skills.aced.has(filter.key)
        );
      }

      if (filter.state === "aced") {
        return idx.skills.aced.has(filter.key);
      }

      // base = baseOnly
      return idx.skills.base.has(filter.key) && !idx.skills.aced.has(filter.key);
    }

    case "primary":
      return idx.loadout.primary === filter.key;

    case "secondary":
      return idx.loadout.secondary === filter.key;

    case "overkill":
      return idx.loadout.overkill === filter.key;

    case "throwable":
      return idx.loadout.throwable === filter.key;

    case "deployable":
      return idx.loadout.deployable === filter.key;

    case "tool":
      return idx.loadout.tool === filter.key;

    case "armor":
      return idx.armor.key === filter.key;

    case "plate":
      return idx.armor.plates.includes(filter.key);

    case "weaponType": {
      const slot = filter.slot; // "primary" | "secondary"
      const weaponKey = idx.loadout?.[slot];
      if (!weaponKey) return false;

      const weaponTypeByKey = ctx?.weaponTypeByKey;
      const actual = weaponTypeByKey?.[slot]?.[weaponKey];
      if (!actual) return false;

      return actual === filter.weaponType; // ambos normalizados (lowercase)
    }

    case "name":
      return idx.nameTokens.includes(filter.value);

    case "buildName":
      return normalize(build.name).includes(filter.value);

    default:
      return false;
  }
}

export function filterBuilds(builds, filters, ctx) {
  if (!filters?.length) return builds;

  return builds.filter((build) => {
    return filters.every((filterGroup) => {
      if (Array.isArray(filterGroup)) {
        return filterGroup.some((f) => matchesFilter(build, f, ctx));
      }
      return matchesFilter(build, filterGroup, ctx);
    });
  });
}
