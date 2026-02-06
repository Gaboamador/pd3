import {
  OVERKILL_SPRITE_URL,
  OVERKILL_SPRITE_IMAGE_W,
  OVERKILL_SPRITE_IMAGE_H,
  OVERKILL_SPRITE_TILE_W,
  OVERKILL_SPRITE_TILE_H,
} from "../../utils/sprites/overkillsSprites";

export default function OverkillSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  // tile is 256x128 => aspect 2:1
  const width = height * (OVERKILL_SPRITE_TILE_W / OVERKILL_SPRITE_TILE_H); // *2

  // escala para que 128px (tileH) se convierta en "height"
  const scale = height / OVERKILL_SPRITE_TILE_H;

  const bgW = OVERKILL_SPRITE_IMAGE_W * scale;
  const bgH = OVERKILL_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * OVERKILL_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * OVERKILL_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${OVERKILL_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
