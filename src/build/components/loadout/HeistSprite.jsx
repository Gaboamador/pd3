import { getHeistImage } from "../../utils/sprites/heistsImages";
import placeholder from "/src/assets/heists/_placeholder.webp";

export default function HeistSprite({ itemDef, height }) {

    const src = itemDef?.key ? getHeistImage(itemDef.key) : null;

  return (
    <img
      src={src ?? placeholder}
      alt={itemDef?.name ?? "Heist"}
      style={{
        width: "100%",
        height,
        objectFit: "cover",
        borderRadius: "8px"
      }}
    />
  );
}