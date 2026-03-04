import { useMemo } from "react";
import { renderSkillText } from "../build/utils/skillText.utils";
import { renderSkillTextWithTotals } from "../build/utils/skillScaling.utils.jsx";
import styles from "./SkillSection.module.scss";
import skillGroupsData from "../data/payday3_skill_groups.json";

export default function SkillSection({ skill, showMeta = false, equippedCount = 0, enableTotals = false }) {
  if (!skill) return null;

  const baseRendered = enableTotals
  ? renderSkillTextWithTotals({
      description: skill.base_description,
      valuesMap: skill.values || {},
      equippedCount,
      highlightClass: styles.skillValueHighlight,
      enemyClass: styles.enemyHighlight,
    })
  : renderSkillTextWithTotals({
    description: skill.base_description,
    valuesMap: skill.values || {},
    highlightClass: styles.skillValueHighlight,
    enemyClass: styles.enemyHighlight,
    showTotals: false,
  });


  const acedRendered = enableTotals
  ? renderSkillTextWithTotals({
      description: skill.aced_description,
      valuesMap: skill.values || {},
      equippedCount,
      highlightClass: styles.skillValueHighlight,
      enemyClass: styles.enemyHighlight,
    })
  : renderSkillTextWithTotals({
    description: skill.aced_description,
    valuesMap: skill.values || {},
    highlightClass: styles.skillValueHighlight,
    enemyClass: styles.enemyHighlight,
    showTotals: false,
  });

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
            <div className={styles.textBlock}>{baseRendered}</div>
        </Section>

        <Section title="Aced" cost={skill?.req_points?.aced ?? 0}>
            <div className={styles.textBlock}>{acedRendered}</div>
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