import SkillCard from "./SkillCard";

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
  onCycleUpSkill,
  onCycleDownSkill,
  onSelectSkill,
  onOpenInfo,
  isMobile,
  getCycleUpDisabledReason, // (skill, state) => string|null
}) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontWeight: 900, fontSize: 14, opacity: 0.95 }}>
        {tree.name}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "auto auto auto auto",
          gridTemplateAreas: `
            "p6 p6"
            "p4 p5"
            "p2 p3"
            "p1 p1"
          `,
          gap: 10,
        }}
      >
        {tree.skills.map((skill) => {
          const area = AREA_BY_POSITION[Number(skill.position)] || "p1";
          const state = skillsState?.[skill.key];

          const reason = getCycleUpDisabledReason?.(skill, state) ?? null;
          const canCycleUp = !reason; // si hay reason, solo se bloquea el upgrade

          return (
            <div key={skill.key} style={{ gridArea: area }}>
              <SkillCard
                skill={skill}
                state={state}
                isMobile={isMobile}
                canCycleUp={canCycleUp}
                cycleUpDisabledReason={reason}
                onCycleUp={() => onCycleUpSkill(skill)}
                onCycleDown={() => onCycleDownSkill(skill)}
                onSelectForDetails={() => onSelectSkill?.(skill)}
                onOpenInfo={() => onOpenInfo?.(skill)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
