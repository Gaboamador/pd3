import { useMemo } from "react";
import {
  getArmorByKey,
  getArmorMaxPlates,
  buildEmptyPlateSlots,
  normalizePlateSlots,
} from "../../utils/armor.utils";
import PlateOrderEditor from "./PlateOrderEditor";

export default function ArmorEditor({
  value,
  armors,
  platesData,
  loadoutData,
  onChange,
}) {
  const armorDef = useMemo(
    () => (value?.key ? getArmorByKey(loadoutData, value.key) : null),
    [loadoutData, value?.key]
  );

  const maxPlates = useMemo(() => getArmorMaxPlates(armorDef), [armorDef]);

  function setArmorKey(key) {
    if (!key) {
      onChange({ key: null, plates: [] });
      return;
    }

    // IMPORTANT: calcular según el key NUEVO, no con el memo anterior
    const nextArmorDef = getArmorByKey(loadoutData, key);
    const nextMaxPlates = getArmorMaxPlates(nextArmorDef);

    // Reset limpio (vacío)
    const nextPlates = buildEmptyPlateSlots(nextMaxPlates);

    onChange({
      key,
      plates: nextPlates,
    });
  }

  // Si por cualquier razón llega un plates con largo incorrecto, lo normalizamos
  const normalizedPlates = useMemo(() => {
    if (!value?.key || maxPlates <= 0) return value?.plates ?? [];
    return normalizePlateSlots(value?.plates, maxPlates);
  }, [value?.key, value?.plates, maxPlates]);

  return (
    <div
      style={{
        display: "grid",
        gap: 10,
        padding: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 10,
      }}
    >
      <label style={{ display: "grid", gap: 6 }}>
        <span style={{ fontWeight: 600 }}>Armor</span>
        <select
          value={value?.key ?? ""}
          onChange={e => setArmorKey(e.target.value)}
        >
          <option value="">—</option>
          {armors.map(a => (
            <option key={a.key} value={a.key}>
              {a.name ?? a.key}
            </option>
          ))}
        </select>
      </label>

      {value?.key && maxPlates > 0 && (
        <PlateOrderEditor
          plates={normalizedPlates}
          platesData={platesData}
          onChangePlates={plates => onChange({ ...value, plates })}
        />
      )}
    </div>
  );
}
