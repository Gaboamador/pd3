import { renderSkillText } from "../../utils/skillText.utils";

export default function SkillDetailsModal({ open, onClose, skill }) {
  if (!open || !skill) return null;

  const baseRendered = renderSkillText(skill.base_description, skill.values || {});
  const acedRendered = renderSkillText(skill.aced_description, skill.values || {});

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2000,
        background: "rgba(0,0,0,0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(760px, 100%)",
          maxHeight: "min(78vh, 780px)",
          overflow: "auto",
          borderRadius: 14,
          background: "rgba(20,20,20,0.98)",
          border: "1px solid rgba(255,255,255,0.14)",
          padding: 14,
          display: "grid",
          gap: 12,
          boxShadow: "0 18px 60px rgba(0,0,0,0.55)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
          <div style={{ fontWeight: 1000 }}>
            {skill.name}
            <div style={{ fontSize: 12, opacity: 0.75, fontWeight: 600 }}>
              Cost {skill?.req_points?.base ?? 0}/{skill?.req_points?.aced ?? 0}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "inherit",
              borderRadius: 10,
              padding: "6px 10px",
              cursor: "pointer",
            }}
          >
            Cerrar
          </button>
        </div>

        <Section title="Base">
          <pre style={preStyle}>{baseRendered}</pre>
        </Section>

        <Section title="Aced">
          <pre style={preStyle}>{acedRendered}</pre>
        </Section>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: 12 }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>{title}</div>
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
