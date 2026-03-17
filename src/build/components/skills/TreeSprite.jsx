import SkillGroupSprite from "./SkillGroupSprite";
import styles from "./TreeSprite.module.scss";

export default function TreeSprite({ itemDef }) {

  const bgUrl = itemDef
    ? `/bg/groupbg-${itemDef.groupId}-${itemDef.treeIndex}-v1.svg`
    : "/icons/icon-512.png";

  return (
    <div
      className={`${styles.treeSprite} ${!itemDef ? styles.placeholder : "" }`}
      style={{
        backgroundImage: `url(${bgUrl})`,
        backgroundSize: itemDef ? "cover" : "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center"
      }}
    >
      {itemDef && (
        <div className={styles.categoryIcon}>
          <SkillGroupSprite spritePos={itemDef.sprite} height={18} />
        </div>
      )}
    </div>
  );
}