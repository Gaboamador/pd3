import { useTranslation } from "react-i18next";
import SkillSection from "../../../components/SkillSection";
import SkillSprite from "./SkillSprite";
import styles from "./SkillDetailsPanel.module.scss";

export default function SkillDetailsPanel({
  skill,
  equippedCount = 0,
  enableTotals = false,
  isLocked = false
}) {
  const { t } = useTranslation();
  if (!skill) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyTitle}>
          {t('skills.panel.title')}
        </div>
        <div className={styles.emptyText}>
          {t('skills.panel.msg.no-skill')}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.titleWrapper}>
        <div className={styles.title}>
          <div className={styles.titleText}>
            {skill.name?.toUpperCase()}
          </div>
        </div>
        {isLocked && (
          <div className={styles.lockedLabel}>
            &gt; {t('skills.panel.locked')} &lt;
          </div>
        )}
        </div>
        <div className={`${styles.spriteWrapper} ${isLocked ? styles.hasLockedSkill : ""}`}>
          <div className={styles.sprite}>
            <SkillSprite spritePos={skill.sprite} height={64} scaleOverride={true} />
          </div>
          {isLocked && (
            <img
              src="/icons/padlock.png"
              className={styles.padlock}
              alt=""
            />
          )}
        </div>
      </div>

      <SkillSection
        skill={skill}
        equippedCount={equippedCount}
        enableTotals={enableTotals}
      />
    </div>
  );
}