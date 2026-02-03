export const MAX_SKILL_POINTS = 51;

export const BUILD_VERSION = 1;

export const BUILD_SESSION_KEY = "pd3_build_v1";

export const BUILDS_LIBRARY_KEY = "pd3_build_library_v1";

export const DEFAULT_BUILD = {
  id: null,
  name: "",
  version: BUILD_VERSION,
  loadout: {
    primary: {
      weaponKey: null,
      preset: 0,
      mods: {},
    },
    secondary: {
      weaponKey: null,
      preset: 0,
      mods: {},
    },
    overkill: null,
    throwable: null,
    deployable: null,
    tool: null,
    armor: {
      key: null,
      plates: [],
    },
  },
  skills: {
  },
};
