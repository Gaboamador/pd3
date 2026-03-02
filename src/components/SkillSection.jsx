import { useMemo } from "react";
import { renderSkillText } from "../build/utils/skillText.utils";
import styles from "./SkillSection.module.scss";
import skillGroupsData from "../data/payday3_skill_groups.json";

export default function SkillSection({ skill, showMeta = false }) {
  if (!skill) return null;

  const baseRendered = renderSkillText(skill.base_description, skill.values || {});
  const acedRendered = renderSkillText(skill.aced_description, skill.values || {});

  const meta = useMemo(() => {
    if (!showMeta) return null;

    const group =
      skillGroupsData?.[String(skill.skill_category_id)] ??
      null;

    const tree =
      group?.trees?.[String(skill.skill_tree_id)] ??
      null;

    return {
      groupName: group?.name ?? null,
      treeName: tree?.name ?? null,
      tier: skill?.tier ?? null,
    };
  }, [showMeta, skill?.skill_category_id, skill?.skill_tree_id, skill?.tier]);


  return (
    <div className={styles.wrapper}>
        {showMeta && (
            <div className={styles.metaRow}>
            <span className={styles.metaChip}>
                Category: <strong>{meta?.groupName ?? "Unknown"}</strong>
            </span>

            <span className={styles.metaChip}>
                Tree: <strong>{meta?.treeName ?? "Unknown"}</strong>
            </span>

            <span className={styles.metaChip}>
                Tier: <strong>{meta?.tier ?? "—"}</strong>
            </span>
            </div>
        )}
        <Section title="Base" cost={skill?.req_points?.base ?? 0}>
            <pre className={styles.pre}>{baseRendered}</pre>
        </Section>

        <Section title="Aced" cost={skill?.req_points?.aced ?? 0}>
            <pre className={styles.pre}>{acedRendered}</pre>
        </Section>
    </div>
  );
}

function Section({ title, cost, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCost}>Cost {cost}</span>
      </div>

      {children}
    </div>
  );
}