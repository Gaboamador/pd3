import {
  SKILL_SPRITE_URL,
  SKILL_SPRITE_IMAGE_W,
  SKILL_SPRITE_IMAGE_H,
  SKILL_SPRITE_TILE_W,
  SKILL_SPRITE_TILE_H,
} from "../../utils/sprites/skillsSprites";

export default function SkillSprite({ spritePos, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (SKILL_SPRITE_TILE_W / SKILL_SPRITE_TILE_H);
  const scale = height / SKILL_SPRITE_TILE_H;

  const bgW = SKILL_SPRITE_IMAGE_W * scale;
  const bgH = SKILL_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * SKILL_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * SKILL_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${SKILL_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
        scale: 1.3,
      }}
    />
  );
}
