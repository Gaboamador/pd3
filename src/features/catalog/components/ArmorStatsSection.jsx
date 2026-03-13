import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import StatsGrid from "./common/StatsGrid";
import { computeArmorStats } from "./utils/computeArmorStats";
import { resolveDescription } from "../../../utils/resolveDescription";
import platesData from "../../../data/payday3_armor_plates.json";
import { prettifyKey } from "./utils/prettifyKey";
import { formatArmorStat } from "./utils/formatters";

export default function ArmorStatsSection({ armor, item }) {
  const { t } = useTranslation();
  const plateDef = item?.plateKey
    ? platesData[item.plateKey]
    : null;

  const plateCount = item?.plateCount;

  const computed = useMemo(() => {
    return computeArmorStats(armor, plateDef, plateCount);
  }, [armor, plateDef, plateCount]);

  if (!computed) return null;

  const rows = Object.entries(computed)
    .filter(([_, v]) => v != null)
    .map(([key, value]) => [
      { value: prettifyKey(key) },
      { value: formatArmorStat(key, value) },
    ]);

  return (
    <StatsGrid
      description={
        armor.description
          ? resolveDescription(
              armor.description,
              armor.desc_values
            )
          : null
      }
      columns={[t('catalog.header-stat'), t('catalog.header-value')]}
      rows={rows}
    />
  );
}