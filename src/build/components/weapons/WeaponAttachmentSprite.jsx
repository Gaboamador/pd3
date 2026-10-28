import {
  WEAPON_ATTACHMENT_SPRITE_URL,
  WEAPON_ATTACHMENT_SPRITE_IMAGE_W,
  WEAPON_ATTACHMENT_SPRITE_IMAGE_H,
  WEAPON_ATTACHMENT_SPRITE_TILE_W,
  WEAPON_ATTACHMENT_SPRITE_TILE_H,
} from "../../utils/sprites/weaponAttachmentSprites";

/** Sprite de attachments reales (no el sprite genérico de los slots). */
export default function WeaponAttachmentSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;
  const scale = height / WEAPON_ATTACHMENT_SPRITE_TILE_H;
  const width = WEAPON_ATTACHMENT_SPRITE_TILE_W * scale;

  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width,
        height,
        flexShrink: 0,
        backgroundImage: `url(${WEAPON_ATTACHMENT_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${WEAPON_ATTACHMENT_SPRITE_IMAGE_W * scale}px ${WEAPON_ATTACHMENT_SPRITE_IMAGE_H * scale}px`,
        backgroundPosition: `${-(c - 1) * width}px ${-(r - 1) * height}px`,
      }}
    />
  );
}
