import { useMemo, useState } from "react";
import Modal from "../common/Modal";
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
      <div style={{ display: "grid", gap: 12 }}>
        {itemTypes.length > 1 && (
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
          >
            <option value="">All types</option>
            {orderedTypes.map(type => (
              <option key={type} value={type}>
                {getWeaponTypeLabel(type, labelsMap)}
              </option>
            ))}
          </select>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: 12,
          }}
        >
          {itemsToShow.map(def => renderCard(def))}
        </div>
      </div>
    </Modal>
  );
}
