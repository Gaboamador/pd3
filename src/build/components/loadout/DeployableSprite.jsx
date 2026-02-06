import {
  DEPLOYABLE_SPRITE_URL,
  DEPLOYABLE_SPRITE_IMAGE_W,
  DEPLOYABLE_SPRITE_IMAGE_H,
  DEPLOYABLE_SPRITE_TILE_W,
  DEPLOYABLE_SPRITE_TILE_H,
} from "../../utils/sprites/deployablesSprites";

export default function DeployableSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (DEPLOYABLE_SPRITE_TILE_W / DEPLOYABLE_SPRITE_TILE_H);
  const scale = height / DEPLOYABLE_SPRITE_TILE_H;

  const bgW = DEPLOYABLE_SPRITE_IMAGE_W * scale;
  const bgH = DEPLOYABLE_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * DEPLOYABLE_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * DEPLOYABLE_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${DEPLOYABLE_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
