import { renderSkillText } from "../../utils/skillText.utils";
import styles from "./SkillDetailsPanel.module.scss";

export default function SkillDetailsPanel({ skill }) {
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

  const baseRendered = renderSkillText(
    skill.base_description,
    skill.values || {}
  );

  const acedRendered = renderSkillText(
    skill.aced_description,
    skill.values || {}
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <div className={styles.title}>
          {skill.name}
        </div>
      </div>

      <Section
        title="Base"
        cost={skill?.req_points?.base ?? 0}
      >
        <pre className={styles.pre}>
          {baseRendered}
        </pre>
      </Section>

      <Section
        title="Aced"
        cost={skill?.req_points?.aced ?? 0}
      >
        <pre className={styles.pre}>
          {acedRendered}
        </pre>
      </Section>
    </div>
  );
}

function Section({ title, cost, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>
          {title}
        </span>

        <span className={styles.sectionCost}>
          Cost {cost}
        </span>
      </div>

      {children}
    </div>
  );
}
