import { BUILDS_LIBRARY_KEY } from "./build.constants";

export function loadBuildLibrary() {
  try {
    const raw = localStorage.getItem(BUILDS_LIBRARY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBuildLibrary(builds) {
  localStorage.setItem(
    BUILDS_LIBRARY_KEY,
    JSON.stringify(builds)
  );
}

export function saveBuildToLibrary(build) {
  const builds = loadBuildLibrary();

  const idx = builds.findIndex(b => b.id === build.id);

  if (idx >= 0) {
    builds[idx] = build; // update
  } else {
    builds.push(build); // new
  }

  saveBuildLibrary(builds);
}

export function getBuildFromLibrary(id) {
  const builds = loadBuildLibrary();
  return builds.find(b => b.id === id) ?? null;
}

export function deleteBuildFromLibrary(id) {
  const builds = loadBuildLibrary().filter(b => b.id !== id);
  saveBuildLibrary(builds);
  return builds;
}

export function assignBuildSlot(id, slot) {
  const builds = loadBuildLibrary();

  // liberamos el slot si ya estaba ocupado
  for (const b of builds) {
    if (b.slot === slot) {
      b.slot = null;
    }
  }

  const target = builds.find(b => b.id === id);
  if (!target) return builds;

  target.slot = slot;

  saveBuildLibrary(builds);
  return builds;
}

export function clearBuildSlot(id) {
  const builds = loadBuildLibrary();
  const target = builds.find(b => b.id === id);
  if (!target) return builds;

  target.slot = null;
  saveBuildLibrary(builds);
  return builds;
}
