import { useMemo } from "react";
import SkillCard from "./SkillCard";
import styles from "./SkillTreeGrid.module.scss";

const AREA_BY_POSITION = {
  1: "p1",
  2: "p2",
  3: "p3",
  4: "p4",
  5: "p5",
  6: "p6",
};

export default function SkillTreeGrid({
  tree,
  skillsState,
  groupPoints,
  isTierUnlocked,
  getSkillTier,
  onCycleUpSkill,
  onCycleDownSkill,
  onSelectSkill,
  onOpenInfo,
  isMobile,
  getCycleUpDisabledReason,
}) {
  // =========================
  // Points spent in this tree
  // =========================
  const treePoints = useMemo(() => {
    if (!tree?.skills || !skillsState) return 0;

    return tree.skills.reduce((sum, skill) => {
      const state = skillsState[skill.key];
      if (!state) return sum;

      const base = skill.req_points?.base ?? 0;
      const aced = skill.req_points?.aced ?? 0;

      if (state.aced) return sum + base + aced;
      if (state.base) return sum + base;

      return sum;
    }, 0);
  }, [tree?.skills, skillsState]);

  return (
    <div className={styles.wrapper}>
      {/* =========================
         Title + points
      ========================= */}
      <div className={styles.titleBlock}>
        <div className={styles.title}>
          {tree.name?.toUpperCase()}
        </div>

        <div className={styles.treePoints}>
          [ {treePoints} POINT{treePoints === 1 ? "" : "S"} ACTIVE ]
        </div>
      </div>

      {/* =========================
         Skill grid
      ========================= */}
      <div className={styles.grid}>
        {/* Tier labels */}
        <div className={styles.tierLabel} style={{ gridArea: "t4" }}>
          <span className={styles.tierText}>TIER 4</span>
        </div>

        <div className={styles.tierLabel} style={{ gridArea: "t3" }}>
          <span className={styles.tierText}>TIER 3</span>
        </div>

        <div className={styles.tierLabel} style={{ gridArea: "t2" }}>
          <span className={styles.tierText}>TIER 2</span>
        </div>

        <div className={styles.tierLabel} style={{ gridArea: "t1" }}>
          <span className={styles.tierText}>TIER 1</span>
        </div>

        {/* Skills */}
        {tree.skills.map((skill) => {
          const area =
            AREA_BY_POSITION[Number(skill.position)] || "p1";

          const state = skillsState?.[skill.key];

          const reason =
            getCycleUpDisabledReason?.(skill, state) ?? null;

          const canCycleUp = !reason;

          const tier = getSkillTier(skill);
          const isLocked = !isTierUnlocked(tier, groupPoints);

          return (
            <div
              key={skill.key}
              className={styles.skillSlot}
              style={{ gridArea: area }}
            >
              <SkillCard
                skill={skill}
                state={state}
                isLocked={isLocked}
                isMobile={isMobile}
                canCycleUp={canCycleUp}
                cycleUpDisabledReason={reason}
                onCycleUp={() => onCycleUpSkill(skill)}
                onCycleDown={() => onCycleDownSkill(skill)}
                onSelectForDetails={() =>
                  onSelectSkill?.(skill)
                }
                onOpenInfo={() => onOpenInfo?.(skill)}
              />
            </div>
          );
        })}

        <div className={styles.tierDividerBottom} />
      </div>
    </div>
  );
}
