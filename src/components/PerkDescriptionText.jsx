import { renderSkillTextWithTotals } from "../build/utils/skillScaling.utils.jsx";
import styles from "./SkillSection.module.scss";

/**
 * Mismo resaltado de valores que SkillSection.
 * La descripción ya se resolvió en perksData.js: aquí solo cambia la vista,
 * manteniendo intacto el string para búsqueda, tooltips y persistencia.
 */
export default function PerkDescriptionText({ description }) {
  if (!description) return null;

  return renderSkillTextWithTotals({
    description,
    valuesMap: {},
    highlightClass: styles.skillValueHighlight,
    showTotals: false,
  });
}
