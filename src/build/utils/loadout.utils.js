/**
 * Normalización del catálogo y de los mods persistidos (IDs históricos o refs).
 * No se reescribe Firestore al abrir una build; la conversión es en memoria.
 */
import loadoutData from '../../data/payday3_loadout_items.json';
import legacyModIds from '../../data/payday3_legacy_mod_id_map.json';
import {
  getSourceModSlots,
  getIconicModSlots,
} from '../../data/weaponAttachments.js';

export function normalizeLoadoutData(data) {
  const result = {
    primary: {}, secondary: {}, overkill: [], throwable: [],
    deployable: [], tool: [], armors: [],
  };
  for (const slot of ['primary', 'secondary']) {
    Object.values(data?.[slot] ?? {}).forEach(item => {
      result[slot][item.type] ??= [];
      result[slot][item.type].push(item);
    });
  }
  for (const category of ['overkill', 'throwable', 'deployable', 'tool']) {
    result[category] = Object.values(data?.[category] ?? {});
  }
  result.armors = Object.values(data?.armor ?? {});
  return result;
}

export function getWeaponByKey(data, weaponKey) {
  if (!weaponKey) return null;
  return ['primary', 'secondary']
    .flatMap(slot => Object.values(data?.[slot] ?? {}))
    .find(item => item?.key === weaponKey) ?? null;
}

export function getWeaponModSlots(weaponDef) {
  if (!weaponDef) return [];
  if (weaponDef.preset === 1) {
    const baseWeapon = getWeaponByKey(loadoutData, weaponDef.baseWeaponKey);
    return getIconicModSlots(weaponDef, baseWeapon);
  }
  return getSourceModSlots(weaponDef);
}

/**
 * El indicador visual está activo únicamente si existe un attachment elegido
 * distinto de Default/None. No basta con que el estado tenga una referencia:
 * las Iconic pueden conservar explícitamente la pieza Default.
 */
export function isWeaponModSlotActive(slotDefinition, selectedId) {
  if (selectedId == null || selectedId === '') return false;
  return Boolean(slotDefinition?.options?.some(option =>
    !option.isDefault && option.id === selectedId
  ));
}

export function buildEmptyModsStateForWeapon(weaponDef) {
  return Object.fromEntries(getWeaponModSlots(weaponDef).map(s => [s.slot, null]));
}

export function buildInitialModsStateForWeapon(weaponDef) {
  return normalizeModsForWeapon(weaponDef, {});
}

/**
 * Una Iconic siempre utiliza sus mods fijos. Para un arma normal, traduce
 * IDs numéricos por weaponKey+slot y desestima opciones que ya no existen.
 */
export function normalizeModsForWeapon(weaponDef, persistedMods) {
  if (!weaponDef) return {};
  const result = {};
  const legacySlots = legacyModIds.weapons?.[weaponDef.key] ?? {};
  const fixed = weaponDef.preset === 1;

  for (const { slot, options } of getWeaponModSlots(weaponDef)) {
    const defaultOption = options.find(option => option.isDefault);
    const original = fixed
      ? (weaponDef.fixedMods?.[slot] ?? null)
      : persistedMods?.[slot];
    if (original == null || original === '') {
      result[slot] = null;
      continue;
    }
    const translated = (typeof original === 'number' || /^\d+$/.test(String(original)))
      ? legacySlots?.[slot]?.[String(original)]
      : original;
    const match = typeof translated === 'string'
      ? options.find(option => option.id === translated)
      : null;
    result[slot] = !match || match.isDefault || match.id === defaultOption?.id
      ? null
      : match.id;
  }
  return result;
}

/** Modifica solamente loadout.primary/secondary.mods, dejando el resto intacto. */
export function normalizeBuildWeaponMods(build) {
  if (!build?.loadout) return build;
  let changed = false;
  const nextLoadout = { ...build.loadout };
  for (const slot of ['primary', 'secondary']) {
    const state = build.loadout?.[slot];
    if (!state?.weaponKey) continue;
    const weaponDef = getWeaponByKey(loadoutData, state.weaponKey);
    if (!weaponDef) continue;
    const normalized = normalizeModsForWeapon(weaponDef, state.mods);
    if (JSON.stringify(normalized) !== JSON.stringify(state.mods ?? {})) {
      nextLoadout[slot] = { ...state, mods: normalized };
      changed = true;
    }
  }
  return changed ? { ...build, loadout: nextLoadout } : build;
}

export function validateWeaponMods(loadoutState, data) {
  const issues = [];
  for (const slotName of ['primary', 'secondary']) {
    const state = loadoutState?.[slotName];
    if (!state?.weaponKey) continue;
    const weapon = getWeaponByKey(data, state.weaponKey);
    if (!weapon) {
      issues.push({ code: 'WEAPON_NOT_FOUND',
        message: `Weapon ${state.weaponKey} no encontrada`,
        meta: { slotName, weaponKey: state.weaponKey } });
      continue;
    }
    const allowed = new Map(getWeaponModSlots(weapon).map(({slot, options}) =>
      [slot, new Set(options.map(o => o.id))]
    ));
    for (const [slot, id] of Object.entries(state.mods ?? {})) {
      if (id == null || id === '') continue;
      if (!allowed.has(slot) || !allowed.get(slot).has(id)) {
        issues.push({ code: 'MOD_ID_INVALID',
          message: `Mod inválido (${slotName}/${slot}): ${id}`,
          meta: { slotName, modSlot: slot, modId: id } });
      }
    }
  }
  return issues;
}
