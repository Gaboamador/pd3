import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Catalog.module.scss";

import Section from "../../build/components/common/Section";
import WeaponTypeComparisonSection from "./components/WeaponTypeComparisonSection";
import { getWeaponsByTypeSelection } from "./components/utils/getWeaponsByTypeSelection";
import { buildCatalog } from "../../library/utils/buildCatalog";
import { getSuggestions } from "../../library/utils/getSuggestions";
import { buildWeaponTypeIndex } from "../../library/utils/buildWeaponTypeIndex";
import { buildSuggestionsWithDividers, formatKindLabel, formatWeaponTypeWithSlot } from "../../utils/searchPresentation.utils";

import skillsData from "../../data/payday3_skills.json";
import loadoutData from "../../data/payday3_loadout_items.json";
import platesData from "../../data/payday3_armor_plates.json";

import CatalogDetails from "./components/CatalogDetails";

export default function Catalog() {
  // const { key } = useParams();
  const { key, slot, weaponType } = useParams();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedWeaponType, setSelectedWeaponType] = useState(null);
  const [hidePresetVariants, setHidePresetVariants] = useState(false);

  // const selectedWeapons = useMemo(() => {
  //   if (!selectedWeaponType) return [];

  //   return getWeaponsByTypeSelection(
  //     loadoutData,
  //     selectedWeaponType,
  //     { onlyWithNewStats: true }
  //   );
  // }, [selectedWeaponType]);
  const selectedWeapons = useMemo(() => {
    if (!selectedWeaponType) return [];

    let weapons = getWeaponsByTypeSelection(
      loadoutData,
      selectedWeaponType,
      { onlyWithNewStats: true }
    );

    if (hidePresetVariants) {
      weapons = weapons.filter((w) => w.preset !== 1);
    }

    return weapons;
  }, [selectedWeaponType, hidePresetVariants]);

  const weaponTypeIndex = useMemo(() => {
    return buildWeaponTypeIndex(loadoutData);
  }, []);

  const catalog = useMemo(() => {
    return buildCatalog({
      skillsData,
      loadoutData,
      armorPlatesData: platesData,
      weaponTypesBySlot: weaponTypeIndex.typesBySlot,
    });
  }, [weaponTypeIndex]);

  const suggestions = useMemo(() => {
    return getSuggestions(query, catalog, []);
  }, [query, catalog]);

  const suggestionsWithDividers = useMemo(() => {
    return buildSuggestionsWithDividers(suggestions);
  }, [suggestions]);

  useEffect(() => {
    if (!key) {
      setSelectedItem(null);
      return;
    }

    const found = catalog.find((x) => x.key === key);
    setSelectedItem(found ?? null);

    setSelectedWeaponType(null);
  }, [key, catalog]);

  useEffect(() => {
    if (!slot || !weaponType) {
      setSelectedWeaponType(null);
      return;
    }

    setSelectedItem(null);

    setSelectedWeaponType({
      slot,
      weaponType: decodeURIComponent(weaponType),
    });
  }, [slot, weaponType]);

  useEffect(() => {
    if (slot && weaponType) {
      setSelectedItem(null);
      setSelectedWeaponType({
        slot,
        weaponType: decodeURIComponent(weaponType),
      });
    }
  }, [slot, weaponType]);

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <Section title="//Catalog_search">
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search catalog..."
          />
          {query && suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestionsWithDividers.map((entry, index) => {
                if (entry.__type === "divider") {
                  return (
                    <div
                      key={`divider-${entry.kind}-${index}`}
                      className={styles.suggestionDivider}
                    >
                      <span>{formatKindLabel(entry.kind)}</span>
                    </div>
                  );
                }
                const s = entry;
                return (
                  <div
                    key={`${s.kind}-${s.key}`}
                    className={styles.suggestion}
                    onClick={() => {
                      if (s.kind === "weaponType") {
                        navigate(
                          `/catalog/type/${s.slot}/${encodeURIComponent(s.weaponType)}`
                        );
                        setQuery("");
                        return;
                      }
                      navigate(`/catalog/${s.key}`);
                      setQuery("");
                    }}
                  >
                    <strong>
                      {s.kind === "weaponType"
                        ? formatWeaponTypeWithSlot(
                            s.slot,
                            s.weaponType ?? s.label
                          )
                        : s.label}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {selectedItem && (
          <CatalogDetails item={selectedItem} />
        )}

        {selectedWeaponType && selectedWeapons.length > 0 && (
          <Section
            title={`//${formatWeaponTypeWithSlot(
              selectedWeaponType.slot,
              selectedWeaponType.weaponType
            )}`}
          >
            <div className={styles.options}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={hidePresetVariants}
                  onChange={(e) => setHidePresetVariants(e.target.checked)}
                  className={styles.checkbox}
                />
                Hide preset variants
              </label>
            </div>
            <WeaponTypeComparisonSection
              weapons={selectedWeapons}
            />
          </Section>
        )}
      </div>
    </div>
  );
}