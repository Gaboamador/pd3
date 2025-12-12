import { GiShoulderArmor } from "react-icons/gi";
import styles from "../styles/ArmorValue.module.scss";
import { armorPlateCount } from "../data/armor.js";

const plateColors = {
  Resistant: "#249EF1",
  Adaptive:  "#3aab58",
  Impact:    "#fbbe0D"
};

// Abreviaciones según cantidad de plates
const abbrev4 = {
  Resistant: "Res.",
  Adaptive:  "Ada.",
  Impact:    "Imp."
};

const abbrev3 = {
  Resistant: "Resist.",
  Adaptive:  "Adapt.",
  Impact:    "Impact"
};

export default function ArmorValue({ type, plates }) {
  const iconCount = armorPlateCount[type] || 0;
  const count = plates.length;

  let textPieces;

  if (count >= 4) {
    // Versión ultra corta
    textPieces = plates.map(p => abbrev4[p] ?? p);
  } else if (count === 3) {
    // Versión media
    textPieces = plates.map(p => abbrev3[p] ?? p);
  } else {
    // 2 o menos: mostrar completo
    textPieces = plates;
  }

  const finalText = textPieces.map((p, i) => (
  <span key={i}>
    {p}
    {i < textPieces.length - 1 && (
      <span className={styles.separador}> | </span>
    )}
  </span>
));


  return (
    <span className={styles.armorSlot}>
      <div className={styles.armorType}>
        <span>{type}</span>

        <span className={styles.armorIcons}>
          {Array.from({ length: iconCount }).map((_, i) => {
            const plate = plates[i];
            const color = plateColors[plate] ?? "#ffffff";

            return (
              <GiShoulderArmor
                key={i}
                size={16}
                color={color}
              />
            );
          })}
        </span>
      </div>

      <span className={styles.armorPlates}>
        {finalText}
      </span>
    </span>
  );
}
