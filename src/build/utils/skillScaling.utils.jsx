import React from "react";
import { renderSkillText } from "./skillText.utils";

/* =============================
   Helpers internos
============================= */

function getTemplateTokenKeys(template) {
  if (!template) return [];
  const keys = [];
  template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, k) => {
    keys.push(k);
    return _;
  });
  return keys;
}

function getScalingEntriesUsedByTemplate(valuesMap, template) {
  if (!valuesMap) return [];
  const usedKeys = new Set(getTemplateTokenKeys(template));

  return Object.entries(valuesMap)
    .filter(([key, v]) => {
      if (!v) return false;
      if (v.compute == null) return false;
      if (!usedKeys.has(key)) return false;
      if (key.startsWith("Computed")) return false;
      return true;
    })
    .map(([key, v]) => ({ key, ...v }));
}

function formatTotal(total, type) {
  if (type === "rate") {
    const pct = total * 100;
    return `${parseFloat(pct.toFixed(2))}%`;
  }

  return parseFloat(total.toFixed(2));
}

  function computeScaledValue({
    baseValue,
    compute,
    skipFirst = 0,
    maxKey,
    valuesMap,
    equippedCount,
  }) {
    if (!compute) return null;

    let multiplier = 0;

    if (compute === 1) {
      multiplier = equippedCount - skipFirst;
    }

    if (compute === 2) {
      multiplier = Math.floor((equippedCount - skipFirst) / 2);
    }

    multiplier = Math.max(0, multiplier);

    let total = Number(baseValue) * multiplier;

    if (maxKey && valuesMap?.[maxKey]) {
      const maxVal = Number(valuesMap[maxKey].value);
      if (!Number.isNaN(maxVal)) {
        total = Math.min(total, maxVal);
      }
    }

    return total;
  }

/* =============================
   Public API
============================= */

export function renderSkillTextWithTotals({
  description,
  valuesMap,
  equippedCount,
  highlightClass,
  showTotals = true,
  enemyClass
}) {
  const safeValues = valuesMap || {};
  const baseText = renderSkillText(description, safeValues);
  const hasEnemyTags = enemyClass && baseText.includes("<Enemy>");

  const highlight = (content, key) => (
    <span key={key} className={highlightClass}>
      {content}
    </span>
  );

const renderEnemyTags = (text) => {
  if (!text) return text;

  const parts = [];
  let lastIndex = 0;

  const regex = /<Enemy>(.*?)<\/>/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    const start = match.index;
    const end = regex.lastIndex;

    // texto antes del tag
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    // enemigo coloreado
    parts.push(
      <span key={parts.length} className={enemyClass}>
        {match[1]}
      </span>
    );

    lastIndex = end;
  }

  // resto del texto
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
};
  const renderStyledNumbers = text => {
    if (!text) return text;

    const parts = text.split(/(\d+(?:\.\d+)?%?)/g);

    return parts.map((part, index) => {
      if (/^\d+(\.\d+)?%?$/.test(part)) {
        return highlight(part, index);
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const renderStyledNumbersFromNodes = (node) => {

    if (typeof node === "string") {
      return renderStyledNumbers(node);
    }

    if (Array.isArray(node)) {
      return node.map((child, idx) => (
        <React.Fragment key={idx}>
          {renderStyledNumbersFromNodes(child)}
        </React.Fragment>
      ));
    }

    return node;
  };

  const scalingEntries =
    getScalingEntriesUsedByTemplate(safeValues, description);

  if (!scalingEntries.length || !showTotals) {
    const baseNode = hasEnemyTags ? renderEnemyTags(baseText) : baseText;
    return renderStyledNumbersFromNodes(baseNode);
  }

const totals = scalingEntries
  .map(entry => {
    const extraRaw = computeScaledValue({
      baseValue: Number(entry.value),
      compute: entry.compute,
      skipFirst: entry.skip_first,
      maxKey: entry.max,
      valuesMap: safeValues,
      equippedCount: Number(equippedCount || 0),
    });

    if (extraRaw == null || Number.isNaN(extraRaw)) return null;

    // ============================
    // Caso especial: "for every two skills ... beyond the first"
    // Total = BaseToken + Extra (y el max aplica al TOTAL)
    // ============================
    const lower = (description || "").toLowerCase();
    const isEveryTwoBeyondFirst =
      entry.compute === 2 &&
      Number(entry.skip_first || 0) === 1 &&
      lower.includes("for every two skills") &&
      lower.includes("beyond the first");

    let finalRaw = extraRaw;

    if (isEveryTwoBeyondFirst) {
      // Tomamos el token inmediatamente anterior en el template (BonusRuntime / GainHostageCount)
      const orderedKeys = getTemplateTokenKeys(description).filter(
        k => !k.startsWith("Computed")
      );

      const idx = orderedKeys.indexOf(entry.key);
      const baseKey = idx > 0 ? orderedKeys[idx - 1] : null;

      const baseVal = baseKey ? Number(safeValues?.[baseKey]?.value) : NaN;

      if (Number.isFinite(baseVal)) {
        finalRaw = baseVal + extraRaw;

        // Si hay max, en estas skills el max es cap del TOTAL (Security Expert)
        if (entry.max && safeValues?.[entry.max]) {
          const maxVal = Number(safeValues[entry.max].value);
          if (Number.isFinite(maxVal)) {
            finalRaw = Math.min(finalRaw, maxVal);
          }
        }
      }
    }

    return {
      key: entry.key,
      raw: finalRaw,
      text: formatTotal(finalRaw, entry.type),
      unit: entry.unit || null
    };
  })
  .filter(v => v !== null && v !== undefined);

  const computedMatch = description?.match(/\{(Computed[A-Za-z0-9_]+)\}/);
  const hasComputedMarker = Boolean(computedMatch);
  let beforeComputed = baseText;
  let afterComputed = "";

  if (hasComputedMarker) {
    const parts = baseText.split("\n");

    const idx = parts.findIndex(line => line.trim() === "");

    if (idx !== -1) {
      beforeComputed = parts.slice(0, idx).join("\n");
      afterComputed = parts.slice(idx).join("\n");
    }
  }


  if (!totals.length || !showTotals) {
    return renderStyledNumbers(baseText);
  }

  const label = totals.length > 1 ? "Totals" : "Total";

  const isBullseye =
    totals.length === 2 &&
    description?.includes("unmarked targets") &&
    description?.includes("marked targets");

  return (
    <>
      {hasEnemyTags ? renderStyledNumbersFromNodes(renderEnemyTags(beforeComputed)) : renderStyledNumbers(beforeComputed)}{" "}
      (
      {label}:{" "}
      {isBullseye ? (
        <>
          {highlight(totals[0].text, "u1")}{" "}
          {highlight("Unmarked", "u2")}
          {" | "}
          {highlight(totals[1].text, "m1")}{" "}
          {highlight("Marked", "m2")}
        </>
      ) : (
        totals.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && " | "}
            {highlight(t.text, i)}
            {t.unit && <> {highlight(t.unit, `u-${i}`)}</>}
          </React.Fragment>
        ))
      )}
      )

      {afterComputed && (
      <>
        {"\n"}
        {
          hasEnemyTags
            ? renderStyledNumbersFromNodes(renderEnemyTags(afterComputed))
            : renderStyledNumbers(afterComputed)
        }
      </>
    )}
    </>
  );
}