// Las coordenadas de attachments reales son independientes de los sprites de slots.
// El PNG adjunto mide 2048 x 1280 y contiene 16 x 20 tiles de 128 x 64.
// pd3_sprite_project.json fue creado originalmente a 4096 x 2560, pero el
// archivo PNG entregado está a media resolución; las posiciones r,c no cambian.
import positionsByWeapon from "../../../data/weapon_attachment_sprite_positions.json";

export const WEAPON_ATTACHMENT_SPRITE_URL = "/sprites/weapon-mods.png";
export const WEAPON_ATTACHMENT_SPRITE_IMAGE_W = 2048;
export const WEAPON_ATTACHMENT_SPRITE_IMAGE_H = 1280;
export const WEAPON_ATTACHMENT_SPRITE_COLS = 16;
export const WEAPON_ATTACHMENT_SPRITE_ROWS = 20;
export const WEAPON_ATTACHMENT_SPRITE_TILE_W = WEAPON_ATTACHMENT_SPRITE_IMAGE_W / WEAPON_ATTACHMENT_SPRITE_COLS;
export const WEAPON_ATTACHMENT_SPRITE_TILE_H = WEAPON_ATTACHMENT_SPRITE_IMAGE_H / WEAPON_ATTACHMENT_SPRITE_ROWS;

// Para mods compartidos, permite reutilizar una imagen existente sin repetir
// las mismas coordenadas en cada arma. Si hay imágenes distintas para una misma
// clave (por ejemplo, KU59/PFLK), no se aplica el fallback automáticamente.
const sharedPositions = new Map();
const ambiguousAttachments = new Set();

for (const weaponPositions of Object.values(positionsByWeapon)) {
  for (const [attachmentKey, position] of Object.entries(weaponPositions)) {
    if (!position || ambiguousAttachments.has(attachmentKey)) continue;

    const previous = sharedPositions.get(attachmentKey);
    if (!previous) {
      sharedPositions.set(attachmentKey, position);
    } else if (previous.r !== position.r || previous.c !== position.c) {
      sharedPositions.delete(attachmentKey);
      ambiguousAttachments.add(attachmentKey);
    }
  }
}

/**
 * Prioriza la imagen específica del arma. Si no hay una entrada, usa el
 * sprite compartido solo cuando todas sus coordenadas conocidas coinciden.
 * Un null explícito significa "sin PNG" y se respeta.
 */
export function getWeaponAttachmentSpritePos(weaponKey, attachmentKey) {
  if (!weaponKey || !attachmentKey) return null;

  const weaponPositions = positionsByWeapon[weaponKey];
  if (weaponPositions && Object.hasOwn(weaponPositions, attachmentKey)) {
    return weaponPositions[attachmentKey];
  }

  return sharedPositions.get(attachmentKey) ?? null;
}
