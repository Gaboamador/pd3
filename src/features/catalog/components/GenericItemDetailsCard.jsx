import styles from "./GenericItemDetailsCard.module.scss";
import useIsMobile from "../../../hooks/useIsMobile";
import { resolveCatalogItem } from "./utils/resolveCatalogItem";

import WeaponSprite from "../../../build/components/weapons/WeaponSprite";
import ArmorSprite from "../../../build/components/loadout/ArmorSprite";
import ThrowableSprite from "../../../build/components/loadout/ThrowableSprite";
import DeployableSprite from "../../../build/components/loadout/DeployableSprite";
import ToolSprite from "../../../build/components/loadout/ToolSprite";

import WeaponStatsSection from "./WeaponStatsSection";
import OverkillStatsSection from "./OverkillsStatsSection";
import ArmorStatsSection from "./ArmorStatsSection";
import PlateStatsSection from "./PlateStatsSection";
import DeployableStatsSection from "./DeployableStatsSection";

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
          <SpriteComponent
            spritePos={def.sprite_pos}
            height={spriteHeight}
          />
        )}

        <div>
          <h2>{def.name}</h2>
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

    case "throwable":
      return ThrowableSprite;

    case "deployable":
      return DeployableSprite;

    case "tool":
      return ToolSprite;

    default:
      return null;
  }
}

  function prettifyKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, s => s.toUpperCase());
}

function renderDetails(kind, def, item) {
  switch (kind) {
    case "skill":
      return (
        <>
          <Section title="Base">
            {item.base_description_rendered}
          </Section>
          <Section title="Aced">
            {item.aced_description_rendered}
          </Section>
        </>
      );

    case "primary":
    case "secondary":
      return <WeaponStatsSection weapon={def} />;
    
    case "overkill":
      return <OverkillStatsSection weapon={def} />;

    case "armor":
      return <ArmorStatsSection armor={def} item={item} />;
    
    case "plate":
      return <PlateStatsSection plate={def} />;

    case "deployable":
      return <DeployableStatsSection deployable={def} />;

    default:
      return (
        <div className={styles.stats}>
          {def.stats &&
            Object.entries(def.stats).map(([k, v]) => (
              <div key={k} className={styles.statRow}>
                <span>{prettifyKey(k)}</span>
                <strong>{String(v)}</strong>
              </div>
            ))}
        </div>
      );
  }
}

function Section({ title, children }) {
  return (
    <div className={styles.section}>
      <h3>{title}</h3>
      <p>{children}</p>
    </div>
  );
}