import {
  PERK_SPRITE_URL,
  PERK_SPRITE_IMAGE_W,
  PERK_SPRITE_IMAGE_H,
  PERK_SPRITE_TILE_W,
  PERK_SPRITE_TILE_H,
  PERK_SPRITE_FALLBACK_POS,
} from "../../utils/sprites/perksSprites";
import styles from "./PerkSprite.module.scss";

export default function PerkSprite({ spritePos, perkType, height = 48 }) {
  const { r, c } = spritePos ?? PERK_SPRITE_FALLBACK_POS;

  const isFallback =
    r === PERK_SPRITE_FALLBACK_POS.r &&
    c === PERK_SPRITE_FALLBACK_POS.c;

  const tintFallback =
    isFallback && (perkType === "equipped" || perkType === "persistent");

  const scale = height / PERK_SPRITE_TILE_H;
  const tileWidth = PERK_SPRITE_TILE_W * scale;
  const spriteSize = `${PERK_SPRITE_IMAGE_W * scale}px ${PERK_SPRITE_IMAGE_H * scale}px`;
  const spritePosition = `${-(c - 1) * tileWidth}px ${-(r - 1) * height}px`;
  const offsetX = (height - tileWidth) / 2;
  const imageUrl = `url("${PERK_SPRITE_URL}")`;

  const imageStyle = tintFallback
    ? {
        // La máscara utiliza la transparencia del ícono blanco de (1,1).
        // El color lo determina la clase SCSS, sin alterar los otros íconos.
        maskImage: imageUrl,
        WebkitMaskImage: imageUrl,
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskSize: spriteSize,
        WebkitMaskSize: spriteSize,
        maskPosition: spritePosition,
        WebkitMaskPosition: spritePosition,
      }
    : {
        backgroundImage: imageUrl,
        backgroundRepeat: "no-repeat",
        backgroundSize: spriteSize,
        backgroundPosition: spritePosition,
      };

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
        className={tintFallback ? styles[perkType] : undefined}
        style={{
          width: tileWidth,
          height,
          marginLeft: offsetX,
          ...imageStyle,
        }}
      />
    </div>
  );
}
