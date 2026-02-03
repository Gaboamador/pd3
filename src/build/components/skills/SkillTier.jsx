import SkillToggle from "./SkillToggle";

export default function SkillTier({ tier, skills, skillsData, selectedSkills, usedPoints, onChangeSkill }) {
  return (
    <div style={{ padding: 10, borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
      <div style={{ fontWeight: 700, marginBottom: 10 }}>Tier {tier}</div>

      <div style={{ display: "grid", gap: 10 }}>
        {skills.map(skillDef => {
          const key = skillDef.key;
          const state = selectedSkills[key] ?? { base: false, aced: false };

          return (
            <SkillToggle
              key={key}
              skillDef={skillDef}
              state={state}
              usedPoints={usedPoints}
              onChange={next => onChangeSkill(key, next)}
            />
          );
        })}
      </div>
    </div>
  );
}
