import {
  TOOL_SPRITE_URL,
  TOOL_SPRITE_IMAGE_W,
  TOOL_SPRITE_IMAGE_H,
  TOOL_SPRITE_TILE_W,
  TOOL_SPRITE_TILE_H,
} from "../../utils/sprites/toolsSprites";

export default function ToolSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (TOOL_SPRITE_TILE_W / TOOL_SPRITE_TILE_H);
  const scale = height / TOOL_SPRITE_TILE_H;

  const bgW = TOOL_SPRITE_IMAGE_W * scale;
  const bgH = TOOL_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * TOOL_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * TOOL_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${TOOL_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
      }}
    />
  );
}
