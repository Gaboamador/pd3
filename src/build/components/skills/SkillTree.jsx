import SkillTier from "./SkillTier";

export default function SkillTree({ tree, skillsData, selectedSkills, usedPoints, onChangeSkill }) {
  const tierNumbers = Object.keys(tree.tiers || {})
    .map(Number)
    .filter(n => Number.isFinite(n))
    .sort((a, b) => a - b);

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: 10 }}>
      <div style={{ fontWeight: 800, marginBottom: 10 }}>{tree.name}</div>

      <div style={{ display: "grid", gap: 12 }}>
        {tierNumbers.map(tier => (
          <SkillTier
            key={tier}
            tier={tier}
            skills={tree.tiers[tier]}
            skillsData={skillsData}
            selectedSkills={selectedSkills}
            usedPoints={usedPoints}
            onChangeSkill={onChangeSkill}
          />
        ))}
      </div>
    </div>
  );
}
