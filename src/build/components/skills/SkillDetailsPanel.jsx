// src/components/skills/SkillDetailsPanel.jsx
import { renderSkillText } from "../../utils/skillText.utils";

export default function SkillDetailsPanel({ skill }) {
  if (!skill) {
    return (
      <div
        style={{
          border: "1px solid rgba(255,255,255,0.12)",
          borderRadius: 12,
          padding: 12,
          opacity: 0.85,
        }}
      >
        <div style={{ fontWeight: 900, marginBottom: 6 }}>Skill details</div>
        <div style={{ fontSize: 13 }}>
          Seleccioná una skill para ver la descripción.
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
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 12,
        padding: 12,
        display: "grid",
        gap: 12,
        alignContent: "start",
      }}
    >
      <div style={{ fontWeight: 1000 }}>
        {skill.name}
        <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>
          Cost {skill?.req_points?.base ?? 0}/{skill?.req_points?.aced ?? 0}
        </div>
      </div>

      <Section title="Base">
        <pre style={preStyle}>{baseRendered}</pre>
      </Section>

      <Section title="Aced">
        <pre style={preStyle}>{acedRendered}</pre>
      </Section>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div
      style={{
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 12,
        padding: 10,
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  );
}

const preStyle = {
  margin: 0,
  whiteSpace: "pre-wrap",
  fontFamily: "inherit",
  fontSize: 13,
  lineHeight: 1.35,
  opacity: 0.95,
};
