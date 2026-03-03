// import { renderSkillText } from "../../utils/skillText.utils";
// import { renderSkillTextWithTotals } from "../../utils/skillScaling";
// import styles from "./SkillDetailsPanel.module.scss";

// export default function SkillDetailsPanel({ skill, equippedCount = 0, enableTotals = false }) {
//   if (!skill) {
//     return (
//       <div className={styles.wrapper}>
//         <div className={styles.emptyTitle}>
//           Skill details
//         </div>
//         <div className={styles.emptyText}>
//           Select a skill to see its description.
//         </div>
//       </div>
//     );
//   }

//   const baseRendered = enableTotals
//   ? renderSkillTextWithTotals({
//       description: skill.base_description,
//       valuesMap: skill.values || {},
//       equippedCount,
//     })
//   : renderSkillText(skill.base_description, skill.values || {});


//   const acedRendered = enableTotals
//   ? renderSkillTextWithTotals({
//       description: skill.aced_description,
//       valuesMap: skill.values || {},
//       equippedCount,
//     })
//   : renderSkillText(skill.aced_description, skill.values || {});

//   return (
//     <div className={styles.wrapper}>
//       <div className={styles.header}>
//         <div className={styles.title}>
//           {skill.name}
//         </div>
//       </div>

//       <Section
//         title="Base"
//         cost={skill?.req_points?.base ?? 0}
//       >
//         <pre className={styles.pre}>
//           {baseRendered}
//         </pre>
//       </Section>

//       <Section
//         title="Aced"
//         cost={skill?.req_points?.aced ?? 0}
//       >
//         <pre className={styles.pre}>
//           {acedRendered}
//         </pre>
//       </Section>
//     </div>
//   );
// }

// function Section({ title, cost, children }) {
//   return (
//     <div className={styles.section}>
//       <div className={styles.sectionHeader}>
//         <span className={styles.sectionTitle}>
//           {title}
//         </span>

//         <span className={styles.sectionCost}>
//           Cost {cost}
//         </span>
//       </div>

//       {children}
//     </div>
//   );
// }
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