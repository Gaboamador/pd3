/** Los builds anteriores a esta funcionalidad se consideran activos. */
export function isLegacyBuild(build) {
  return build?.isLegacy === true;
}

export function filterActiveBuilds(builds) {
  return (builds ?? []).filter(build => !isLegacyBuild(build));
}

export function filterLegacyBuilds(builds) {
  return (builds ?? []).filter(isLegacyBuild);
}

/** Archivar/restaurar siempre libera el slot para evitar conflictos. */
export function withLegacyStatus(build, isLegacy) {
  return { ...build, isLegacy: Boolean(isLegacy), slot: null };
}
