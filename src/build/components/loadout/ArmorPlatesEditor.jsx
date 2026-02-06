import { useMemo } from "react";
import {
  getArmorByKey,
  getArmorMaxPlates,
  normalizePlateSlots,
} from "../../utils/armor.utils";
import PlateOrderEditor from "./PlateOrderEditor";

export default function ArmorPlatesEditor({
  value,        // { key, plates }
  platesData,
  loadoutData,
  onChange,
}) {
  const armorDef = useMemo(
    () => (value?.key ? getArmorByKey(loadoutData, value.key) : null),
    [loadoutData, value?.key]
  );

  const maxPlates = useMemo(() => getArmorMaxPlates(armorDef), [armorDef]);

  const normalizedPlates = useMemo(() => {
    if (!value?.key || maxPlates <= 0) return value?.plates ?? [];
    return normalizePlateSlots(value?.plates, maxPlates);
  }, [value?.key, value?.plates, maxPlates]);

  if (!value?.key) {
    return <div style={{ opacity: 0.8 }}>Select an armor frame first</div>;
  }

  if (maxPlates <= 0) {
    return <div style={{ opacity: 0.8 }}>No plates available for this armor</div>;
  }

  return (
    <PlateOrderEditor
      plates={normalizedPlates}
      platesData={platesData}
      onChangePlates={plates => onChange({ ...value, plates })}
    />
  );
}
