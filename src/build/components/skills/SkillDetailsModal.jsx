import { renderSkillText } from "../../utils/skillText.utils";
import styles from './SkillDetailsModal.module.scss'

export default function SkillDetailsModal({ open, onClose, skill }) {
  if (!open || !skill) return null;

  const baseRendered = renderSkillText(skill.base_description, skill.values || {});
  const acedRendered = renderSkillText(skill.aced_description, skill.values || {});

  return (
  <div
    role="dialog"
    aria-modal="true"
    onClick={onClose}
    className={styles.overlay}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className={styles.modal}
    >
      <div className={styles.header}>
        <div className={styles.title}>
          {skill.name}
        </div>

        <button
          type="button"
          onClick={onClose}
          className={styles.closeButton}
        >
          Close
        </button>
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
