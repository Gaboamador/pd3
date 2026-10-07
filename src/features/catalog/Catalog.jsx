import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import styles from "./Catalog.module.scss";
import { IoChevronBackCircleSharp } from "react-icons/io5";

import Section from "../../build/components/common/Section";
import WeaponTypeComparisonSection from "./components/WeaponTypeComparisonSection";
import PerksComparisonSection from "./components/PerksComparisonSection";
import { getWeaponsByTypeSelection } from "./components/utils/getWeaponsByTypeSelection";
import { buildCatalog } from "../../library/utils/buildCatalog";
import { getSuggestions } from "../../library/utils/getSuggestions";
import { buildWeaponTypeIndex } from "../../library/utils/buildWeaponTypeIndex";
import { buildSuggestionsWithDividers, formatKindLabel, formatWeaponSlotLabel, formatWeaponTypeWithSlot } from "../../utils/searchPresentation.utils";
import { searchSkillDescriptions } from "./components/utils/searchSkillDescriptions";

import skillsData from "../../data/payday3_skills.json";
import skillGroupsData from "../../data/payday3_skill_groups.json"
import loadoutData from "../../data/payday3_loadout_items.json";
import platesData from "../../data/payday3_armor_plates.json";
import perksData from "../../data/payday3_perks.json";

import CatalogDetails from "./components/CatalogDetails";
import SkillsEditor from "../../build/components/skills/SkillsEditor";
import SkillDescriptionResults from "./components/SkillDescriptionResults";
import ScrollArrow from "../../components/ScrollArrow";

export default function Catalog() {
  const { t } = useTranslation();
  const { key, slot, weaponType, weaponSlot, groupId, treeId, textQuery } = useParams();
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

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTree, setSelectedTree] = useState(null);
  const showPerksOverview = location.pathname === "/catalog/perks";
  const selectedWeaponSlot = ["primary", "secondary", "overkill"].includes(weaponSlot)
    ? weaponSlot
    : null;

  const selectedSlotWeapons = useMemo(() => {
    if (!selectedWeaponSlot) return [];
    return Object.values(loadoutData?.[selectedWeaponSlot] ?? {});
  }, [selectedWeaponSlot]);

  const selectedWeapons = useMemo(() => {
    if (!selectedWeaponType) return [];

    return getWeaponsByTypeSelection(
      loadoutData,
      selectedWeaponType,
      { onlyWithStats: true }
    );
  }, [selectedWeaponType]);

  const weaponTypeIndex = useMemo(() => {
    return buildWeaponTypeIndex(loadoutData);
  }, []);

  const catalog = useMemo(() => {
    return buildCatalog({
      skillsData,
      skillGroupsData,
      loadoutData,
      armorPlatesData: platesData,
      perksData,
      weaponTypesBySlot: weaponTypeIndex.typesBySlot,
      includeWeaponSlots: true,
    });
  }, [weaponTypeIndex]);

  const suggestions = useMemo(() => {
    const baseSuggestions = getSuggestions(query, catalog, [], {
      skillsData,
      enableDescriptionSearch: true,
    });

    const q = query.trim().toLowerCase();
    const showPerksSuggestion =
      q.length >= 3 && ("perk".startsWith(q) || "perks".startsWith(q));

    if (!showPerksSuggestion) return baseSuggestions;

    const perksOverviewSuggestion = {
      kind: "perk",
      key: "__all_perks__",
      label: "Perks Overview (open list)",
      searchText: "perk perks",
    };

    const nextSuggestions = [...baseSuggestions];
    const firstPerkIndex = nextSuggestions.findIndex((item) => item.kind === "perk");
    nextSuggestions.splice(firstPerkIndex >= 0 ? firstPerkIndex : 0, 0, perksOverviewSuggestion);

    return nextSuggestions;
  }, [query, catalog, skillsData]);

  const suggestionsWithDividers = useMemo(() => {
    return buildSuggestionsWithDividers(suggestions);
  }, [suggestions]);

  const decodedTextQuery = useMemo(() => {
  return textQuery ? decodeURIComponent(textQuery) : null;
}, [textQuery]);

  const skillDescriptionMatches = useMemo(() => {
  if (!decodedTextQuery) return [];

  return searchSkillDescriptions(decodedTextQuery, skillsData);

}, [decodedTextQuery]);

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

  useEffect(() => {
  if (!textQuery) return;

  setSelectedItem(null);
  setSelectedWeaponType(null);
  setSelectedCategory(null);
  setSelectedTree(null);
}, [textQuery]);

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>

        {fromCompare && (
            <Section >
              <div className={styles.backToComparisonWrapper}>
                <button onClick={() => navigate(-1)} className={styles.backBtn}>
                  <IoChevronBackCircleSharp />
                </button>
                <span>{t('nav.back-to-comparison')}</span>
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
              <span>{t('nav.back-to-explorer')}</span>
            </div>
          </Section>
        )}

        {!fromCompare && !fromExplorer &&
        <Section title={t('section.title.catalog')}>
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('title.placeholder.search')}
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
                      if (s.kind === "skillDescriptionSearch") {
                        navigate(`/catalog/skill-text/${encodeURIComponent(s.query)}`);
                        setQuery("");
                        return;
                      }
                      if (s.kind === "weaponSlot") {
                        navigate(`/catalog/weapons/${s.slot}`);
                        setQuery("");
                        return;
                      }
                      if (s.kind === "weaponType") {
                        navigate(
                          `/catalog/type/${s.slot}/${encodeURIComponent(s.weaponType)}`
                        );
                        setQuery("");
                        return;
                      }
                      if (s.kind === "perk" && s.key === "__all_perks__") {
                        navigate("/catalog/perks");
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
                      {s.kind === "weaponSlot"
                        ? s.label
                        : s.kind === "weaponType"
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
          
          {textQuery && (
            <Section title={`${t('section.title.skill-text-search')}"${decodeURIComponent(textQuery)}"`}>
              <SkillDescriptionResults
                skills={skillDescriptionMatches}
                query={decodeURIComponent(textQuery)}
              />
            </Section>
          )}
        </Section>
        }

        {showPerksOverview && (
          <Section title="//PERKS">
            <PerksComparisonSection
              perksData={perksData}
              loadoutData={loadoutData}
            />
          </Section>
        )}

        {selectedWeaponSlot && selectedSlotWeapons.length > 0 && (
          <Section
            title={`//${formatWeaponSlotLabel(selectedWeaponSlot).toUpperCase()} WEAPONS`}
          >
            {selectedWeaponSlot === "overkill" ? (
              <div className={styles.weaponSlotList}>
                {selectedSlotWeapons.map((weapon) => (
                  <button
                    key={weapon.key}
                    type="button"
                    className={styles.weaponSlotItem}
                    onClick={() => navigate(`/catalog/${weapon.key}`)}
                  >
                    <span>{weapon.name ?? weapon.key}</span>
                    <span className={styles.weaponSlotArrow}>›</span>
                  </button>
                ))}
              </div>
            ) : (
              <WeaponTypeComparisonSection weapons={selectedSlotWeapons} />
            )}
          </Section>
        )}

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
            <WeaponTypeComparisonSection
              weapons={selectedWeapons}
            />
          </Section>
        )}
      </div>
      <ScrollArrow/>
    </div>
  );
}