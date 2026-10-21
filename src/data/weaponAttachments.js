/**
 * Fuentes de Payday 3 obtenidas de terceros. Los dos archivos externos se
 * mantienen sin modificaciones: las excepciones propias viven aquí.
 * Vite carga sus contenidos como texto, porque los originales no exportan módulos.
 */
import weaponsText from './external/weapons.js?raw';
import attachmentsText from './external/attachments.js?raw';

const SLOT_NAMES = {
  barrelExtension: 'BarrelExtension', barrel: 'Barrel', grip: 'Grip',
  mag: 'Mag', stock: 'Stock', sight: 'Sight',
  verticalGrip: 'VerticalGrip', foreGrip: 'ForeGrip',
};

function parseFrozenJson(source, variable) {
  const prefix = `const ${variable} = Object.freeze(`;
  const trimmed = source.trim();
  if (!trimmed.startsWith(prefix) || !trimmed.endsWith(');')) {
    throw new Error(`Formato inesperado de ${variable}`);
  }
  return JSON.parse(trimmed.slice(prefix.length, -2));
}

const weaponSource = parseFrozenJson(weaponsText, 'WEAPON_DATA');
const attachmentSource = parseFrozenJson(attachmentsText, 'ATTACHMENT_DATA');

// Confirmación dentro del juego: la PC9 admite Viewpoint Sight. Mantener la
// excepción separada permite reemplazar weapons.js sin perder la corrección.
const AVAILABILITY_OVERRIDES = {
  PC9: { Sight: ['Sight_ViewPoint'] },
};

const allAttachmentNames = new Map(
  Object.entries(attachmentSource).map(([key, value]) => [key.toLowerCase(), key])
);

export function resolveAttachmentKey(key) {
  if (typeof key !== 'string' || !key) return null;
  return Object.hasOwn(attachmentSource, key)
    ? key
    : (allAttachmentNames.get(key.toLowerCase()) ?? null);
}

export function getAttachment(key) {
  const resolved = resolveAttachmentKey(key);
  return resolved ? attachmentSource[resolved] : null;
}

function getDefaultOption(defaultKey) {
  if (!defaultKey) {
    return { id: null, name: 'None', isDefault: true, isVirtual: true };
  }
  return {
    id: defaultKey,
    name: attachmentSource[defaultKey]?.displayName ?? 'Default',
    isDefault: true,
  };
}

function optionFor(id) {
  return {
    id,
    name: attachmentSource[id]?.displayName ?? id,
    isDefault: false,
  };
}

function getSourceConfiguration(weaponDef) {
  const sourceKey = weaponDef?.sourceKey ?? weaponDef?.key;
  return weaponSource[sourceKey]?.modularConfiguration ?? null;
}

/** Lista única de slots que el selector de attachments puede presentar. */
export function getSourceModSlots(weaponDef, { includeDefaultOnly = false } = {}) {
  const config = getSourceConfiguration(weaponDef);
  if (!config) return [];
  const sourceKey = weaponDef.sourceKey ?? weaponDef.key;
  const overrides = AVAILABILITY_OVERRIDES[sourceKey] ?? {};
  const result = [];

  for (const [sourceSlot, slot] of Object.entries(SLOT_NAMES)) {
    const definition = config[sourceSlot];
    if (!definition) continue;
    const defaultKey = resolveAttachmentKey(definition.defaultPart);
    const seen = new Set(defaultKey ? [defaultKey] : []);
    const options = [getDefaultOption(defaultKey)];
    const refs = [...(definition.uniqueParts ?? []), ...(overrides[slot] ?? [])];

    for (const rawRef of refs) {
      const key = resolveAttachmentKey(rawRef);
      if (!key || seen.has(key)) continue;
      seen.add(key);
      options.push(optionFor(key));
    }
    // El editor solo muestra categorías donde hay algo para elegir.
    // Las categorías con una única pieza Default siguen accesibles para
    // resolver los fixedMods de armas Iconic.
    if (options.length > 1 || (includeDefaultOnly && defaultKey)) {
      result.push({ slot, options });
    }
  }
  return result;
}

/**
 * La Iconic conserva sus fixedMods en nuestro JSON. Un attachment que ya no
 * exista, o que no corresponda a su arma base, cae silenciosamente a Default/None.
 */
export function getIconicModSlots(weaponDef, baseWeaponDef) {
  const baseSlots = new Map(getSourceModSlots(baseWeaponDef, { includeDefaultOnly: true }).map(s => [s.slot, s]));
  const result = [];
  for (const [slot, rawFixed] of Object.entries(weaponDef.fixedMods ?? {})) {
    const parentSlot = baseSlots.get(slot);
    const defaultOpt = parentSlot?.options[0] ?? getDefaultOption(null);
    const fixed = resolveAttachmentKey(rawFixed);
    const matched = parentSlot?.options.find(o => o.id === fixed);
    const selected = matched ?? defaultOpt;
    result.push({ slot, options: [selected] });
  }
  return result;
}
