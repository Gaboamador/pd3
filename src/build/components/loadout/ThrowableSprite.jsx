import {
  THROWABLE_SPRITE_URL,
  THROWABLE_SPRITE_IMAGE_W,
  THROWABLE_SPRITE_IMAGE_H,
  THROWABLE_SPRITE_TILE_W,
  THROWABLE_SPRITE_TILE_H,
} from "../../utils/sprites/throwablesSprites";

export default function ThrowableSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (THROWABLE_SPRITE_TILE_W / THROWABLE_SPRITE_TILE_H);
  const scale = height / THROWABLE_SPRITE_TILE_H;

  const bgW = THROWABLE_SPRITE_IMAGE_W * scale;
  const bgH = THROWABLE_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * THROWABLE_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * THROWABLE_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${THROWABLE_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
