import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./Catalog.module.scss";
import { IoChevronBackCircleSharp } from "react-icons/io5";

import Section from "../../build/components/common/Section";
import WeaponTypeComparisonSection from "./components/WeaponTypeComparisonSection";
import { getWeaponsByTypeSelection } from "./components/utils/getWeaponsByTypeSelection";
import { buildCatalog } from "../../library/utils/buildCatalog";
import { getSuggestions } from "../../library/utils/getSuggestions";
import { buildWeaponTypeIndex } from "../../library/utils/buildWeaponTypeIndex";
import { buildSuggestionsWithDividers, formatKindLabel, formatWeaponTypeWithSlot } from "../../utils/searchPresentation.utils";

import skillsData from "../../data/payday3_skills.json";
import skillGroupsData from "../../data/payday3_skill_groups.json"
import loadoutData from "../../data/payday3_loadout_items.json";
import platesData from "../../data/payday3_armor_plates.json";

import CatalogDetails from "./components/CatalogDetails";
import SkillsEditor from "../../build/components/skills/SkillsEditor";
import SkillTreeGrid from "../../build/components/skills/SkillTreeGrid";

export default function Catalog() {
  const { key, slot, weaponType, groupId, treeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const highlightSkill = location.state?.highlightSkill ?? null;
  const highlightTree = location.state?.highlightTree ?? null;

  const fromCompare = location.state?.fromCompare;
  const fromExplorer = location.state?.fromExplorer;
  const explorerQuery = location.state?.explorerQuery;

  const [query, setQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedWeaponType, setSelectedWeaponType] = useState(null);
  const [hidePresetVariants, setHidePresetVariants] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);

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
      skillGroupsData,
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

  const emptyBuild = { skills: {} };

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

  // hook que detecta category
  useEffect(() => {
  if (!groupId) {
    setSelectedCategory(null);
    return;
  }

  const group = skillGroupsData?.[groupId];
  if (!group) {
    setSelectedCategory(null);
    return;
  }

  setSelectedItem(null);
  setSelectedWeaponType(null);
  setSelectedTree(null);

  setSelectedCategory(group);
}, [groupId]);

// hook que detecta tree
useEffect(() => {
  if (!treeId) {
    setSelectedTree(null);
    return;
  }

  let foundTree = null;

  Object.values(skillGroupsData ?? {}).forEach((group) => {
    const tree = group.trees?.[treeId];
    if (tree) {
      foundTree = { ...tree, group };
    }
  });

  if (!foundTree) {
    setSelectedTree(null);
    return;
  }

  setSelectedItem(null);
  setSelectedWeaponType(null);
  setSelectedCategory(null);

  setSelectedTree(foundTree);
}, [treeId]);

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

        {fromCompare && (
            <Section >
              <div className={styles.backToComparisonWrapper}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                  <IoChevronBackCircleSharp />
                </button>
                <span>BACK TO COMPARISON</span>
              </div>
          </Section>
        )}

        {fromExplorer && (
          <Section>
            <div className={styles.backToExplorerWrapper}>
              <button
                  onClick={() =>
                    navigate("/library-explorer", {
                      state: { restoreQuery: explorerQuery, restoreScroll: true }
                    })
                  }
                className={styles.backBtn}
              >
                <IoChevronBackCircleSharp />
              </button>
              <span>BACK TO EXPLORER</span>
            </div>
          </Section>
        )}

        {!fromCompare && !fromExplorer &&
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
                      if (s.kind === "category") {
                        navigate(`/catalog/category/${s.groupId}`);
                        setQuery("");
                        return;
                      }

                      if (s.kind === "tree") {
                        navigate(`/catalog/tree/${s.treeId}`);
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
        }

        {selectedItem && (
          <CatalogDetails item={selectedItem} />
        )}

        {selectedCategory && (
          <Section title={`//${selectedCategory.name.toUpperCase()}`}>
            <SkillsEditor
              build={emptyBuild}
              setBuild={() => {}}
              skillsData={skillsData}
              skillGroupsData={skillGroupsData}
              catalogMode={true}
              forcedGroupId={selectedCategory.id}
              highlightSkillKey={highlightSkill}
              highlightTreeId={highlightTree}
            />
          </Section>
        )}

        {selectedTree && (
          <Section title={`//${selectedTree.name.toUpperCase()}`}>
            <SkillsEditor
              build={emptyBuild}
              setBuild={() => {}}
              skillsData={skillsData}
              skillGroupsData={skillGroupsData}
              catalogMode={true}
              forcedGroupId={selectedTree.group.id}
              forcedTreeId={selectedTree.id}
              highlightSkillKey={highlightSkill}
              highlightTreeId={highlightTree}
            />
          </Section>
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