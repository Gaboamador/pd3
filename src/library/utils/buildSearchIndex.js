import { normalize } from "./normalize";

/**
 * Construye un índice estructurado para un build.
 * Se ejecuta UNA VEZ cuando se cargan los builds.
 */
export function buildSearchIndex(build) {
  const index = {
    skills: {
      base: new Set(),
      aced: new Set(),
    },

    loadout: {
      primary: build.loadout?.primary?.weaponKey ?? null,
      secondary: build.loadout?.secondary?.weaponKey ?? null,
      overkill: build.loadout?.overkill ?? null,
      throwable: build.loadout?.throwable ?? null,
      deployable: build.loadout?.deployable ?? null,
      tool: build.loadout?.tool ?? null,
    },

    armor: {
      key: build.loadout?.armor?.key ?? null,
      plates: build.loadout?.armor?.plates ?? [],
    },

    nameTokens: normalize(build.name).split(/\s+/).filter(Boolean),
  };

  // Skills
  Object.entries(build.skills ?? {}).forEach(([key, state]) => {
    if (state?.base) index.skills.base.add(key);
    if (state?.aced) index.skills.aced.add(key);
  });

  return index;
}

/**
 * Enriquecer lista de builds con índice interno
 */
export function attachSearchIndexToBuilds(builds) {
  return builds.map(build => ({
    ...build,
    __searchIndex: buildSearchIndex(build),
  }));
}
