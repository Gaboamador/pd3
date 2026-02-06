import styles from "./ArmorPlatesPreview.module.scss";

export default function ArmorPlatesPreview({ plates = [], platesData }) {
  if (!plates.length) return null;

  return (
    <div className={styles.wrapper}>
      {plates.map((plateKey, idx) => {
        const plate = platesData?.[plateKey];
        if (!plate) return null;

        return (
          <div
            key={idx}
            className={styles.bar}
            style={{ backgroundColor: plate.color }}
            title={plate.name}
          />
        );
      })}
    </div>
  );
}
