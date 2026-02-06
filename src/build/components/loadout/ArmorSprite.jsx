import {
  ARMOR_SPRITE_URL,
  ARMOR_SPRITE_IMAGE_W,
  ARMOR_SPRITE_IMAGE_H,
  ARMOR_SPRITE_TILE_W,
  ARMOR_SPRITE_TILE_H,
} from "../../utils/sprites/armorsSprites";

export default function ArmorSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (ARMOR_SPRITE_TILE_W / ARMOR_SPRITE_TILE_H);
  const scale = height / ARMOR_SPRITE_TILE_H;

  const bgW = ARMOR_SPRITE_IMAGE_W * scale;
  const bgH = ARMOR_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * ARMOR_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * ARMOR_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${ARMOR_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
