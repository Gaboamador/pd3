import {
  WEAPON_SPRITE_URL,
  WEAPON_SPRITE_IMAGE_W,
  WEAPON_SPRITE_IMAGE_H,
  WEAPON_SPRITE_TILE_W,
  WEAPON_SPRITE_TILE_H,
} from "../../utils/sprites/weaponSprites";

export default function WeaponSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  // tile is 256x128 => aspect 2:1
  const width = height * (WEAPON_SPRITE_TILE_W / WEAPON_SPRITE_TILE_H); // *2

  // escala para que 128px (tileH) se convierta en "height"
  const scale = height / WEAPON_SPRITE_TILE_H;

  const bgW = WEAPON_SPRITE_IMAGE_W * scale;
  const bgH = WEAPON_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * WEAPON_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * WEAPON_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${WEAPON_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
