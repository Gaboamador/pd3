import {
  WEAPON_MOD_SPRITE_URL,
  WEAPON_MOD_SPRITE_IMAGE_W,
  WEAPON_MOD_SPRITE_IMAGE_H,
  WEAPON_MOD_SPRITE_TILE_W,
  WEAPON_MOD_SPRITE_TILE_H,
} from "../../utils/sprites/weaponModsSprites";

export default function WeaponModSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (WEAPON_MOD_SPRITE_TILE_W / WEAPON_MOD_SPRITE_TILE_H);

  const scale = height / WEAPON_MOD_SPRITE_TILE_H;

  const bgW = WEAPON_MOD_SPRITE_IMAGE_W * scale;
  const bgH = WEAPON_MOD_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * WEAPON_MOD_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * WEAPON_MOD_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${WEAPON_MOD_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
