import { useMemo, useState } from "react";
import Modal from "../common/Modal";
import styles from "./LoadoutItemPickerModal.module.scss";
import {
  buildWeaponTypeLabels,
  getWeaponTypeLabel,
  orderWeaponTypes,
} from "../../utils/weaponTypeLabels";

/**
 * Modal genérico para pickers con sprite
 */
export default function LoadoutItemPickerModal({
  open,
  onClose,
  title,
  itemsByType,
  renderCard,
}) {
  const [filterType, setFilterType] = useState("");

  const itemTypes = useMemo(
    () => Object.keys(itemsByType),
    [itemsByType]
  );

  const orderedTypes = useMemo(
    () => orderWeaponTypes(itemTypes),
    [itemTypes]
  );

  const labelsMap = useMemo(
    () => buildWeaponTypeLabels(itemTypes),
    [itemTypes]
  );

  const itemsToShow = useMemo(() => {
    if (!filterType) {
      return orderedTypes.flatMap(t => itemsByType[t] ?? []);
    }
    return itemsByType[filterType] ?? [];
  }, [filterType, orderedTypes, itemsByType]);

  function handleClose() {
    setFilterType("");
    onClose();
  }

  return (
  <Modal open={open} onClose={handleClose} title={title}>
    <div className={styles.wrapper}>
      {itemTypes.length > 1 && (
        <div className={styles.selectWrapper}>
          <span className={styles.selectLabel}>Weapon Type</span>
          <select
            className={styles.filter}
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All</option>
            {orderedTypes.map(type => (
              <option key={type} value={type}>
                {getWeaponTypeLabel(type, labelsMap)}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.grid}>
        {itemsToShow.map(def => (
          <div key={def.key} className={styles.cell}>
            {renderCard(def)}
          </div>
        ))}
      </div>
    </div>
  </Modal>
);
}
