import { BUILD_VERSION } from '../build.constants.js';
import { normalizeBuildWeaponMods } from '../utils/loadout.utils.js';

export const SHORT_LINK_SCHEMA_VERSION = 1;
export const SHORT_LINK_ID_LENGTH = 12;
export const SHORT_LINK_NAME_LIMIT = 40;

/** Slug legible: no se usa como identificador único, solo como parte del documento. */
export function toBuildSlug(name) {
  const normalized = String(name ?? '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’"“”`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const truncated = normalized.slice(0, SHORT_LINK_NAME_LIMIT).replace(/-+$/g, '');
  return truncated || 'unnamed-build';
}

export function isValidShortBuildId(value) {
  return typeof value === 'string' && value.length <= SHORT_LINK_NAME_LIMIT + 1 + SHORT_LINK_ID_LENGTH &&
    /^(?:[a-z0-9]+-)*[a-z0-9]+-[a-z0-9]{12}$/.test(value);
}

/**
 * Un snapshot contiene SOLAMENTE información necesaria para recrear la build.
 * No incluye id, slot, uid, __shared ni metadatos de biblioteca/sesión.
 * A diferencia de los enlaces legacy, usa keys de skills estables, no índices.
 */
export function createPublicBuildSnapshot(build) {
  const original = normalizeBuildWeaponMods(build);
  const loadout = original?.loadout ?? {};
  const weapon = (state) => state?.weaponKey ? {
    weaponKey: state.weaponKey,
    preset: state.preset ?? 0,
    mods: { ...(state.mods ?? {}) },
    perk: state.perk ?? null,
  } : null;

  const skills = Object.fromEntries(
    Object.entries(original?.skills ?? {})
      .filter(([, state]) => state?.base || state?.aced)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, state]) => [key, { base: true, aced: Boolean(state?.aced) }]),
  );

  // Roundtrip JSON elimina valores undefined que Firestore no admite.
  return JSON.parse(JSON.stringify({
    version: original?.version ?? BUILD_VERSION,
    name: original?.name ?? '',
    skills,
    loadout: {
      primary: weapon(loadout.primary),
      secondary: weapon(loadout.secondary),
      overkill: loadout.overkill ?? null,
      overkillConfig: loadout.overkillConfig ?? {},
      throwable: loadout.throwable ?? null,
      deployable: loadout.deployable ?? null,
      tool: loadout.tool ?? null,
      armor: {
        key: loadout.armor?.key ?? null,
        plates: Array.isArray(loadout.armor?.plates) ? loadout.armor.plates : [],
      },
    },
  }));
}

/** Para descartar datos incompletos/ajenos antes de enviarlos al editor. */
export function isValidPublicBuildSnapshot(snapshot) {
  return Boolean(snapshot && typeof snapshot === 'object' && !Array.isArray(snapshot) &&
    snapshot.version === BUILD_VERSION && typeof snapshot.name === 'string' &&
    snapshot.skills && typeof snapshot.skills === 'object' && !Array.isArray(snapshot.skills) &&
    snapshot.loadout && typeof snapshot.loadout === 'object' && !Array.isArray(snapshot.loadout) &&
    snapshot.loadout.armor && typeof snapshot.loadout.armor === 'object' &&
    Array.isArray(snapshot.loadout.armor.plates));
}

/** Orden determinista para comparar snapshots, sin depender del orden de selección. */
export function stableBuildString(value) {
  if (Array.isArray(value)) return `[${value.map(stableBuildString).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key =>
      `${JSON.stringify(key)}:${stableBuildString(value[key])}`,
    ).join(',')}}`;
  }
  return JSON.stringify(value);
}
