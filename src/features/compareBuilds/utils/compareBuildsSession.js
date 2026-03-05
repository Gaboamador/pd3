// src/features/compareBuilds/utils/compareBuildsSession.js

const KEY = "pd3_compare_builds_v1";

export function saveCompareBuilds(builds) {
  try {
    const payload = Array.isArray(builds) ? builds : [];
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function loadCompareBuilds() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function clearCompareBuilds() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}