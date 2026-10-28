import {
  OVERKILL_MOD_SPRITE_URL,
  OVERKILL_MOD_SPRITE_IMAGE_W,
  OVERKILL_MOD_SPRITE_IMAGE_H,
  OVERKILL_MOD_SPRITE_TILE_W,
  OVERKILL_MOD_SPRITE_TILE_H,
} from "../../utils/sprites/overkillModsSprites";

/**
 * Los perks y blades se muestran cuadrados, recortando los márgenes laterales
 * transparentes de la celda original de 256 × 128.
 * Las municiones mantienen el ancho completo, porque sus ilustraciones ocupan
 * prácticamente los 256 px originales.
 */
export default function OverkillModSprite({ spritePos, optionType, height = 48 }) {
  if (!spritePos) return null;

  const { r, c } = spritePos;
  const scale = height / OVERKILL_MOD_SPRITE_TILE_H;
  const tileWidth = OVERKILL_MOD_SPRITE_TILE_W * scale;

  const imageStyle = {
    backgroundImage: `url("${OVERKILL_MOD_SPRITE_URL}")`,
    backgroundRepeat: "no-repeat",
    backgroundSize: `${OVERKILL_MOD_SPRITE_IMAGE_W * scale}px ${OVERKILL_MOD_SPRITE_IMAGE_H * scale}px`,
    backgroundPosition: `${-(c - 1) * tileWidth}px ${-(r - 1) * height}px`,
  };

  if (optionType === "ammo") {
    return (
      <div
        role="img"
        aria-label="Overkill ammo icon"
        style={{ width: tileWidth, height, flexShrink: 0, ...imageStyle }}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label="Overkill mod icon"
      style={{ width: height, height, overflow: "hidden", flexShrink: 0 }}
    >
      <div
        aria-hidden="true"
        style={{
          width: tileWidth,
          height,
          marginLeft: (height - tileWidth) / 2,
          ...imageStyle,
        }}
      />
    </div>
  );
}
