import styles from "./PlateOrderEditor.module.scss";

export default function PlateOrderEditor({ plates, platesData, onChangePlates }) {
  const plateKeys = Object.keys(platesData || {});

  function setPlateAt(index, key) {
    const next = plates.slice();
    next[index] = key;
    onChangePlates(next);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <span>Armor plates</span>
        <span className={styles.count}>{plates.length}</span>
      </div>

      <div className={styles.list}>
        {plates.map((activeKey, slotIndex) => (
          <div key={slotIndex} className={styles.row}>
            <div className={styles.slotIndex}>{slotIndex + 1}</div>
            {plateKeys.map(plateKey => {
              const plate = platesData[plateKey];
              const isActive = plateKey === activeKey;

              return (
                <button
                  key={plateKey}
                  type="button"
                  className={`${styles.option} ${
                    isActive ? styles.optionActive : ""
                  }`}
                  style={{ borderColor: plate.color }}
                  onClick={() => setPlateAt(slotIndex, plateKey)}
                >
                  <span
                    className={isActive ? styles.dot : styles.dotInactive}
                    style={{ background: plate.color }}
                  />
                  <span className={styles.optionLabel}>
                    {plate.name}
                  </span>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
