import { canToggleAced, canToggleBase } from "../../utils/skillPoints.utils";

export default function SkillToggle({ skillDef, state, usedPoints, onChange }) {
  const baseCost = Number(skillDef?.req_points?.base ?? 0);
  const acedCost = Number(skillDef?.req_points?.aced ?? 0);

  const canBase = canToggleBase({ current: state, skillDef, usedPoints });
  const canAced = canToggleAced({ current: state, skillDef, usedPoints });

  function toggleBase() {
    if (!canBase) return;

    // si se apaga base -> aced también off
    if (state.base) onChange({ base: false, aced: false });
    else onChange({ base: true, aced: false });
  }

  function toggleAced() {
    if (!canAced) return;

    if (state.aced) onChange({ ...state, aced: false });
    else onChange({ ...state, aced: true });
  }

  return (
    <div style={{ display: "grid", gap: 8, border: "1px solid rgba(255,255,255,0.10)", borderRadius: 10, padding: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 800 }}>{skillDef.name}</div>
        <div style={{ opacity: 0.8 }}>
          base {baseCost} / aced {acedCost}
        </div>
      </div>

      <div style={{ opacity: 0.9 }}>
        <div>{skillDef.base_description}</div>
        <div style={{ marginTop: 6 }}>{skillDef.aced_description}</div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button type="button" onClick={toggleBase} disabled={!canBase}>
          Base {state.base ? "✔" : ""}
        </button>
        <button type="button" onClick={toggleAced} disabled={!state.base || !canAced}>
          Aced {state.aced ? "✔" : ""}
        </button>
      </div>
    </div>
  );
}
