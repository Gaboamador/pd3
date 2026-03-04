import SkillSection from "../../../components/SkillSection";
import styles from "./SkillDetailsPanel.module.scss";

export default function SkillDetailsPanel({
  skill,
  equippedCount = 0,
  enableTotals = false,
}) {
  if (!skill) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.emptyTitle}>
          Skill details
        </div>
        <div className={styles.emptyText}>
          Select a skill to see its description.
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {skill.name}
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