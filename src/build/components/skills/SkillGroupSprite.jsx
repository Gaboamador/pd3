import {
  SKILL_GROUP_SPRITE_URL,
  SKILL_GROUP_SPRITE_IMAGE_W,
  SKILL_GROUP_SPRITE_IMAGE_H,
  SKILL_GROUP_SPRITE_TILE_W,
  SKILL_GROUP_SPRITE_TILE_H,
} from "../../utils/sprites/skillGroupSprites";

export default function SkillGroupSprite({ spritePos, height = 20 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;

  const width = height * (SKILL_GROUP_SPRITE_TILE_W / SKILL_GROUP_SPRITE_TILE_H);
  const scale = height / SKILL_GROUP_SPRITE_TILE_H;

  const bgW = SKILL_GROUP_SPRITE_IMAGE_W * scale;
  const bgH = SKILL_GROUP_SPRITE_IMAGE_H * scale;

  const x = -((c - 1) * SKILL_GROUP_SPRITE_TILE_W) * scale;
  const y = -((r - 1) * SKILL_GROUP_SPRITE_TILE_H) * scale;

  return (
    <div
      style={{
        width,
        height,
        backgroundImage: `url(${SKILL_GROUP_SPRITE_URL})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: `${bgW}px ${bgH}px`,
        backgroundPosition: `${x}px ${y}px`,
        // opacity: 0.9,
      }}
    />
  );
}
