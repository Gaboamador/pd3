import { DEFAULT_BUILD } from "./build.constants";
import { BUILD_SESSION_KEY } from "./build.constants";

export function loadBuildFromSession() {
  try {
    const raw = sessionStorage.getItem(BUILD_SESSION_KEY);
    if (!raw) return DEFAULT_BUILD;

    const parsed = JSON.parse(raw);

    // Validación mínima
    if (!parsed || parsed.version !== DEFAULT_BUILD.version) {
      return DEFAULT_BUILD;
    }

    return parsed;
  } catch (err) {
    console.warn("Failed to load build from sessionStorage", err);
    return DEFAULT_BUILD;
  }
}

export function saveBuildToSession(build) {
  try {
    sessionStorage.setItem(
      BUILD_SESSION_KEY,
      JSON.stringify(build)
    );
  } catch (err) {
    console.warn("Failed to save build to sessionStorage", err);
  }
}


export function createEmptyBuild() {
  return {
    id: null,
    name: "",
    version: 1,
    loadout: {
      primary: null,
      secondary: null,
      overkill: null,
      armor: { key: null, plates: [] },
      deployable: null,
      throwable: null,
      tool: null,
    },
    skills: {},
  };
}
