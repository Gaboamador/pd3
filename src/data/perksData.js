/**
 * Catálogo de perks para toda la aplicación.
 *
 * Las Weapon Perks usan la redacción oficial del catálogo externo y nuestros
 * valores tipados (como las skills). Las opciones de OVERKILL no se modifican.
 * Los archivos JS descargados de terceros nunca se escriben desde aquí.
 */
import perkDefinitions from './payday3_perks.json';
import { getAttachment } from './weaponAttachments.js';
import { renderSkillText } from '../build/utils/skillText.utils.js';

const UNAVAILABLE_DESCRIPTION = 'Description unavailable.';
const TOKEN_PATTERN = /\{([A-Za-z0-9_]+)\}/g;

/** Resuelve únicamente Weapon Perks; no toca textos propios de OVERKILL. */
export function resolveWeaponPerkDescription(perk, getSource = getAttachment) {
  if (perk?.scope !== 'weapon') return perk?.description ?? '';

  const template = perk.sourceKey ? getSource(perk.sourceKey)?.description : null;
  if (typeof template !== 'string' || !template.trim()) {
    return perk.description || UNAVAILABLE_DESCRIPTION;
  }

  // Detectar placeholders nuevos después de una actualización de attachments.js.
  // Nunca filtrar un texto a medias ni imprimir {Parameter} en la interfaz.
  const required = [...template.matchAll(TOKEN_PATTERN)].map(match => match[1]);
  if (required.some(key => {
    const parameter = perk.values?.[key];
    return !parameter || parameter.value == null || !Number.isFinite(Number(parameter.value));
  })) {
    return perk.description || UNAVAILABLE_DESCRIPTION;
  }

  const description = renderSkillText(template, perk.values ?? {});
  if (!description || /\{[A-Za-z0-9_]+\}/.test(description)) {
    return perk.description || UNAVAILABLE_DESCRIPTION;
  }
  return description;
}

function hydrateWeaponPerk(perk, getSource) {
  const source = perk.sourceKey ? getSource(perk.sourceKey) : null;
  const perkType = source?.perkType;

  return {
    ...perk,
    perkType: perkType === 'equipped' || perkType === 'persistent' ? perkType : null,
    // Mantener los flags derivados para no cambiar contratos de componentes.
    equipped: perkType === 'equipped',
    persistent: perkType === 'persistent',
    description: resolveWeaponPerkDescription(perk, getSource),
  };
}

export function buildPerksData(definitions, getSource = getAttachment) {
  return Object.fromEntries(Object.entries(definitions).map(([key, perk]) => [
    key,
    perk?.scope === 'weapon' ? hydrateWeaponPerk(perk, getSource) : perk,
  ]));
}

const perksData = buildPerksData(perkDefinitions);
export default perksData;
