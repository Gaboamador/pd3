import { MAX_SKILL_POINTS } from "../../build.constants";

export default function PointsCounter({ used }) {
  const over = used > MAX_SKILL_POINTS;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontWeight: 600 }}>Points:</span>
      <span>
        {used} / {MAX_SKILL_POINTS}
      </span>
      {over && (
        <span style={{ color: "tomato", fontWeight: 700 }}>
          Excede el máximo
        </span>
      )}
    </div>
  );
}
