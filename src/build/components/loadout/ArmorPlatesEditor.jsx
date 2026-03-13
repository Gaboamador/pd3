import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  getArmorByKey,
  getArmorMaxPlates,
  normalizePlateSlots,
} from "../../utils/armor.utils";
import PlateOrderEditor from "./PlateOrderEditor";

export default function ArmorPlatesEditor({
  value,
  platesData,
  loadoutData,
  onChange,
}) {
  const { t } = useTranslation();
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
    return <div style={{ opacity: 0.8 }}>{t('build.loadout.msg.no-armor-frame')}</div>;
  }

  if (maxPlates <= 0) {
    return <div style={{ opacity: 0.8 }}>{t('build.loadout.msg.no-plates-available')}</div>;
  }

  return (
    <PlateOrderEditor
      plates={normalizedPlates}
      platesData={platesData}
      onChangePlates={plates => onChange({ ...value, plates })}
    />
  );
}
