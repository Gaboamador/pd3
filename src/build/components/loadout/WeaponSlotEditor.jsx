import { useMemo, useState } from "react";
import WeaponCard from "../weapons/WeaponCard";
import Modal from "../common/Modal";
import {
  buildWeaponTypeLabels,
  getWeaponTypeLabel,
  orderWeaponTypes,
} from "../../utils/weaponTypeLabels";
import styles from "./WeaponSlotEditor.module.scss";

export default function WeaponSlotEditor({
  label,
  itemsByType,
  value,
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState("");

  // tipos reales disponibles
  const weaponTypes = useMemo(
    () => Object.keys(itemsByType),
    [itemsByType]
  );

  const orderedTypes = useMemo(
    () => orderWeaponTypes(weaponTypes),
    [weaponTypes]
  );

  const labelsMap = useMemo(
    () => buildWeaponTypeLabels(weaponTypes),
    [weaponTypes]
  );

  // arma actualmente seleccionada (si hay)
  const weaponDef = useMemo(() => {
    if (!value.weaponKey) return null;
    for (const weapons of Object.values(itemsByType)) {
      const found = weapons.find(w => w.key === value.weaponKey);
      if (found) return found;
    }
    return null;
  }, [value.weaponKey, itemsByType]);

  function handleSelectWeapon(def) {
    const emptyMods = {};
    if (def.mods) {
      Object.keys(def.mods).forEach(slot => {
        emptyMods[slot] = null;
      });
    }

    onChange({
      weaponKey: def.key,
      preset: def.preset ?? 0,
      mods: emptyMods,
    });

    setOpen(false);
    setFilterType("");
  }

  const weaponsToShow = useMemo(() => {
    if (!filterType) {
      return orderedTypes.flatMap(type => itemsByType[type] ?? []);
    }
    return itemsByType[filterType] ?? [];
  }, [filterType, orderedTypes, itemsByType]);

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{label}</div>

      {/* Slot clickable */}
      <div
        className={styles.slotButton}
        onClick={() => setOpen(true)}
      >
        {weaponDef ? weaponDef.name : "Select weapon…"}
      </div>

      {/* Modal selector de armas */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={`Select ${label} weapon`}
      >
        <div className={styles.filterRow}>
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
        </div>

        <div className={styles.weaponGrid}>
          {weaponsToShow.map(w => (
            <WeaponCard
              key={w.key}
              weaponDef={w}
              modsState={value.mods}
              onChangeMods={mods =>
                onChange({
                  ...value,
                  mods,
                })
              }
              onClick={() => handleSelectWeapon(w)}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
