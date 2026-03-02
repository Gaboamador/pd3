import {
  PLATE_SPRITE_URL,
  PLATE_SPRITE_IMAGE_W,
  PLATE_SPRITE_IMAGE_H,
  PLATE_SPRITE_TILE_W,
  PLATE_SPRITE_TILE_H,
} from "../../utils/sprites/platesSprites";

export default function PlateSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (PLATE_SPRITE_TILE_W / PLATE_SPRITE_TILE_H);
  const scale = height / PLATE_SPRITE_TILE_H;

  const bgW = PLATE_SPRITE_IMAGE_W * scale;
  const bgH = PLATE_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * PLATE_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * PLATE_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${PLATE_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
