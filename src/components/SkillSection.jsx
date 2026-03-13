import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { renderSkillTextWithTotals } from "../build/utils/skillScaling.utils.jsx";
import styles from "./SkillSection.module.scss";
import skillGroupsData from "../data/payday3_skill_groups.json";

export default function SkillSection({ skill, showMeta = false, equippedCount = 0, enableTotals = false, textTransform }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const baseText = textTransform
    ? textTransform(baseRendered)
    : baseRendered;

  const acedText = textTransform
    ? textTransform(acedRendered)
    : acedRendered;

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

  function goToCategory() {
    if (!skill?.skill_category_id) return;

    navigate(`/catalog/category/${skill.skill_category_id}`, {state: { highlightSkill: skill.key, highlightTree: skill.skill_tree_id }});
  }

  function goToTree() {
    if (!skill?.skill_tree_id) return;

    navigate(`/catalog/tree/${skill.skill_tree_id}`, {state: { highlightSkill: skill.key }});
  }

  return (
    <div className={styles.wrapper}>
        {showMeta && (
            <div className={styles.metaRow}>
            <span
              className={`${styles.metaChip} ${styles.metaClickable}`}
              onClick={goToCategory}
            >
                {t('skills.label.category')} <strong>{meta?.groupName ?? t('common.unknown')}</strong>
            </span>

            <span
              className={`${styles.metaChip} ${styles.metaClickable}`}
              onClick={goToTree}
            >
                {t('skills.label.tree')} <strong>{meta?.treeName ?? t('common.unknown')}</strong>
            </span>

            <span className={styles.metaChip}>
                {t('skill.label.tier')} <strong>{meta?.tier ?? "—"}</strong>
            </span>
            </div>
        )}
        <Section title={t('skills.title.base')} cost={skill?.req_points?.base ?? 0}>
            <div className={styles.textBlock}>{baseText}</div>
        </Section>

        <Section title={t('skills.title.aced')} cost={skill?.req_points?.aced ?? 0}>
            <div className={styles.textBlock}>{acedText}</div>
        </Section>
    </div>
  );
}

function Section({ title, cost, children }) {
  const { t } = useTranslation();
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionTitle}>{title}</span>
        <span className={styles.sectionCost}>{t('skills.label.cost')}{cost}</span>
      </div>

      {children}
    </div>
  );
}