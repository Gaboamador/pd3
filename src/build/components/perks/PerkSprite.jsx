
import {
  PERK_SPRITE_URL,
  PERK_SPRITE_IMAGE_W,
  PERK_SPRITE_IMAGE_H,
  PERK_SPRITE_TILE_W,
  PERK_SPRITE_TILE_H,
  PERK_SPRITE_FALLBACK_POS,
} from "../../utils/sprites/perksSprites";

export default function PerkSprite({ spritePos, height = 48 }) {
  const { r, c } = spritePos ?? PERK_SPRITE_FALLBACK_POS;

  const scale = height / PERK_SPRITE_TILE_H;
  const tileWidth = PERK_SPRITE_TILE_W * scale;

  const bgW = PERK_SPRITE_IMAGE_W * scale;
  const bgH = PERK_SPRITE_IMAGE_H * scale;

  const x = -(c - 1) * tileWidth;
  const y = -(r - 1) * height;

  // Centramos el sprite horizontalmente dentro del cuadrado.
  const offsetX = (height - tileWidth) / 2;

  return (
    <div
      role="img"
      aria-label="Perk icon"
      style={{
        width: height,
        height,
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: tileWidth,
          height,
          marginLeft: offsetX,
          backgroundImage: `url(${PERK_SPRITE_URL})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: `${bgW}px ${bgH}px`,
          backgroundPosition: `${x}px ${y}px`,
        }}
      />
    </div>
  );
}
