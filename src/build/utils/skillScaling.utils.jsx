// // src/utils/skillScaling.utils.js
// import React from "react";
// import { renderSkillText } from "./skillText.utils";

// /**
//  * Extrae tokens {Key} usados en el template.
//  * OJO: incluye ComputedX si aparece, pero abajo filtramos esos.
//  */
// function getTemplateTokenKeys(template) {
//   if (!template) return [];
//   const keys = [];
//   template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, k) => {
//     keys.push(k);
//     return _;
//   });
//   return keys;
// }

// /**
//  * Entries que escalan: tienen "compute" y además están usados en el template.
//  * Esto evita:
//  * - que Bullseye base tome AcedIncreasedAccuracy (compute) y te muestre 3
//  * - que base tome valores compute del aced, y viceversa
//  */
// function getScalingEntriesUsedByTemplate(valuesMap, template) {
//   if (!valuesMap) return [];
//   const usedKeys = new Set(getTemplateTokenKeys(template));

//   return Object.entries(valuesMap)
//     .filter(([key, v]) => {
//       if (!v) return false;
//       if (v.compute == null) return false;
//       if (!usedKeys.has(key)) return false;
//       if (key.startsWith("Computed")) return false; // nunca escalar estos
//       return true;
//     })
//     .map(([key, v]) => ({ key, ...v }));
// }

// function formatTotal(total, type) {
//   if (type === "rate") {
//     const pct = total * 100;

//     // hasta 2 decimales pero sin ceros innecesarios
//     return `${parseFloat(pct.toFixed(2))}%`;
//   }

//   return parseFloat(total.toFixed(2));
// }

// function computeScaledValue({
//   baseValue,
//   compute,
//   skipFirst = 0,
//   maxKey,
//   valuesMap,
//   equippedCount,
// }) {
//   if (!compute) return null;

//   let effectiveCount = equippedCount;

//   if (skipFirst) {
//     effectiveCount = Math.max(0, equippedCount - skipFirst);
//   }

//   const multiplier = compute === 2 ? Math.floor(effectiveCount / 2) : effectiveCount;

//   let total = baseValue * multiplier;

//   // max puede apuntar a otra key en values (ej MaxRuntimeCount)
//   if (maxKey && valuesMap?.[maxKey]) {
//     const maxVal = Number(valuesMap[maxKey].value);
//     if (!Number.isNaN(maxVal)) total = Math.min(total, maxVal);
//   }

//   return total;
// }

// /**
//  * Wrapper: renderiza el texto base y, si corresponde, agrega (Total: X) al final.
//  * - NO rompe si valuesMap es null
//  * - NO muestra totals si no hay tokens compute usados en ese template
//  */
// export function renderSkillTextWithTotals({
//   description,
//   valuesMap,
//   equippedCount,
// }) {
//   const safeValues = valuesMap || {};
//   const baseText = renderSkillText(description, safeValues);

//   const scalingEntries = getScalingEntriesUsedByTemplate(safeValues, description);
//   if (!scalingEntries.length) return baseText;

//   const totals = scalingEntries
//     .map(entry => {
//       const total = computeScaledValue({
//         baseValue: Number(entry.value),
//         compute: entry.compute,
//         skipFirst: entry.skip_first,
//         maxKey: entry.max,
//         valuesMap: safeValues,
//         equippedCount: Number(equippedCount || 0),
//       });

//       if (total == null || Number.isNaN(total)) return null;
//       return formatTotal(total, entry.type);
//     })
//     .filter(Boolean);

//   if (!totals.length) return baseText;

//   const label = totals.length > 1 ? "Totals" : "Total";
//   /**
//    * Caso especial: Bullseye base
//    */
//   if (
//     totals.length === 2 &&
//     description?.includes("unmarked targets") &&
//     description?.includes("marked targets")
//   ) {
//     return `${baseText} (${label}: ${totals[0]} Unmarked | ${totals[1]} Marked)`;
//   }

//   return `${baseText} (${label}: ${totals.join(" | ")})`;
// }
// src/utils/skillScaling.utils.js

// src/utils/skillScaling.utils.jsx
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

  let effectiveCount = equippedCount;

  if (skipFirst) {
    effectiveCount = Math.max(0, equippedCount - skipFirst);
  }

  const multiplier =
    compute === 2 ? Math.floor(effectiveCount / 2) : effectiveCount;

  let total = Number(baseValue) * Number(multiplier);

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
}) {
  const safeValues = valuesMap || {};
  const baseText = renderSkillText(description, safeValues);

  const highlight = (content, key) => (
    <span key={key} className={highlightClass}>
      {content}
    </span>
  );

  const renderStyledNumbers = text => {
    if (!text) return text;

    // const parts = text.split(/(\d+(\.\d+)?%?)/g);
    const parts = text.split(/(\d+(?:\.\d+)?%?)/g);

    return parts.map((part, index) => {
      if (/^\d+(\.\d+)?%?$/.test(part)) {
        return highlight(part, index);
      }

      return <React.Fragment key={index}>{part}</React.Fragment>;
    });
  };

  const scalingEntries =
    getScalingEntriesUsedByTemplate(safeValues, description);

  if (!scalingEntries.length) {
    return renderStyledNumbers(baseText);
  }

  const totals = scalingEntries
    .map(entry => {
      const total = computeScaledValue({
        baseValue: Number(entry.value),
        compute: entry.compute,
        skipFirst: entry.skip_first,
        maxKey: entry.max,
        valuesMap: safeValues,
        equippedCount: Number(equippedCount || 0),
      });

      if (total == null || Number.isNaN(total)) return null;

      return formatTotal(total, entry.type);
    })
    .filter(Boolean);

  if (!totals.length) {
    return renderStyledNumbers(baseText);
  }

  const label = totals.length > 1 ? "Totals" : "Total";

  const isBullseye =
    totals.length === 2 &&
    description?.includes("unmarked targets") &&
    description?.includes("marked targets");

  return (
    <>
      {renderStyledNumbers(baseText)}{" "}
      (
      {label}:{" "}
      {isBullseye ? (
        <>
          {highlight(totals[0], "u1")}{" "}
          {highlight("Unmarked", "u2")}
          {" | "}
          {highlight(totals[1], "m1")}{" "}
          {highlight("Marked", "m2")}
        </>
      ) : (
        totals.map((t, i) => (
          <React.Fragment key={i}>
            {i > 0 && " | "}
            {highlight(t, i)}
          </React.Fragment>
        ))
      )}
      )
    </>
  );
}