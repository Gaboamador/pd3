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

/**
 * El mismo attachmentKey puede usar otra imagen según el arma (KU59/PFLK).
 * Las referencias sin PNG tienen null y se muestran sin ícono.
 */
export function getWeaponAttachmentSpritePos(weaponKey, attachmentKey) {
  if (!weaponKey || !attachmentKey) return null;
  return positionsByWeapon[weaponKey]?.[attachmentKey] ?? null;
}
