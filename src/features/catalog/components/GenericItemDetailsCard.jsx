import styles from "./GenericItemDetailsCard.module.scss";
import useIsMobile from "../../../hooks/useIsMobile";
import { resolveCatalogItem } from "./utils/resolveCatalogItem";

import SkillSprite from "../../../build/components/skills/SkillSprite";
import WeaponSprite from "../../../build/components/weapons/WeaponSprite";
import ArmorSprite from "../../../build/components/loadout/ArmorSprite";
import PlateSprite from "../../../build/components/loadout/PlateSprite";
import ThrowableSprite from "../../../build/components/loadout/ThrowableSprite";
import DeployableSprite from "../../../build/components/loadout/DeployableSprite";
import ToolSprite from "../../../build/components/loadout/ToolSprite";

import SkillSection from "../../../components/SkillSection";
import WeaponStatsSection from "./WeaponStatsSection";
import OverkillStatsSection from "./OverkillsStatsSection";
import ArmorStatsSection from "./ArmorStatsSection";
import PlateStatsSection from "./PlateStatsSection";
import OtherItemsSection from "./OtherItemsSection";

export default function GenericItemDetailsCard({ item }) {
  const isMobile = useIsMobile();
  const spriteHeight = isMobile ? 80 : 110;

  const { def, kind } = resolveCatalogItem(item);

  if (!def) return null;

  const SpriteComponent = getSpriteComponent(kind);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {SpriteComponent && def.sprite_pos && (
          <div className={styles.spriteWrapper}>
            <SpriteComponent
              spritePos={def.sprite_pos}
              height={spriteHeight}
            />
          </div>
        )}

        <div>
          <div className={styles.itemName}>{def.name}</div>
          <div className={styles.kindLabel}>{kind}</div>
        </div>
      </div>

      {renderDetails(kind, def, item)}
    </div>
  );
}

function getSpriteComponent(kind) {
  switch (kind) {
    case "primary":
    case "secondary":
    case "overkill":
      return WeaponSprite;

    case "armor":
      return ArmorSprite;

    case "plate":
      return PlateSprite;

    case "throwable":
      return ThrowableSprite;

    case "deployable":
      return DeployableSprite;

    case "tool":
      return ToolSprite;

    case "skill":
      return SkillSprite;

    default:
      return null;
  }
}

function renderDetails(kind, def, item) {
  switch (kind) {
    case "skill":
      return <SkillSection skill={def} showMeta/>;

    case "primary":
    case "secondary":
      return <WeaponStatsSection weapon={def} />;
    
    case "overkill":
      return <OverkillStatsSection weapon={def} />;

    case "armor":
      return <ArmorStatsSection armor={def} item={item} />;
    
    case "plate":
      return <PlateStatsSection plate={def} />;

    default:
      return <OtherItemsSection item={def} />;
  }
}