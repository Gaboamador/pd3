import { useMemo, useState, useEffect } from "react";
import styles from "./LibraryExplorer.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaRandom } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
import { LuTarget } from "react-icons/lu";
import Section from "../../build/components/common/Section";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { useLoadBuild } from "../../hooks/useLoadBuild";
import { attachSearchIndexToBuilds } from "../utils/buildSearchIndex";
import { filterBuilds } from "../utils/librarySearchEngine";
import { buildCatalog } from "../utils/buildCatalog";
import { getSuggestions } from "../utils/getSuggestions";
import { buildWeaponTypeIndex } from "../utils/buildWeaponTypeIndex";
import { normalize } from "../utils/normalize";
import { encodeFilters, decodeFilters } from "../utils/filterSerialization";
import { formatWeaponTypeWithSlot, getChipLabel, getChipKindLabel, getChipKindColor, formatKindLabel, buildSuggestionsWithDividers } from "../../utils/searchPresentation.utils";

import skillsData from "../../data/payday3_skills.json";
import loadoutData from "../../data/payday3_loadout_items.json";
import platesData from "../../data/payday3_armor_plates.json";
import Spinner from "../../components/Spinner";

  const NAME_BY_KEY = buildNameByKey(skillsData, loadoutData, platesData);

  function buildNameByKey(skillsData, loadoutData, platesData) {
    const map = {};

    // skillsData (es un diccionario plano key -> skill)
    Object.values(skillsData || {}).forEach((skill) => {
      if (skill?.key && skill?.name) map[skill.key] = skill.name;
    });

    // loadoutData: sections (primary/secondary/overkill/throwable/deployable/tool/armor)
    Object.values(loadoutData || {}).forEach((section) => {
      Object.values(section || {}).forEach((item) => {
        if (item?.key && item?.name) map[item.key] = item.name;
      });
    });

    // platesData
    Object.values(platesData || {}).forEach((plate) => {
      if (plate?.key && plate?.name) map[plate.key] = plate.name;
    });

    return map;
  }

export default function LibraryExplorer() {
  const { library, loading } = useUserLibrary();
  const { loadBuild } = useLoadBuild();

  const [query, setQuery] = useState("");
  const [activeChips, setActiveChips] = useState([]);

  const location = useLocation();
  const navigate = useNavigate();

  const indexedBuilds = useMemo(
    () => attachSearchIndexToBuilds(library ?? []),
    [library]
  );

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
  const baseSuggestions = getSuggestions(query, catalog, activeChips);

    const q = query.trim().toLowerCase();
    if (!q) return baseSuggestions;

    const buildSuggestions = library
      .filter(b => b.name && b.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map(b => ({
        kind: "buildName",
        key: b.id,
        label: b.name,
        searchText: b.name.toLowerCase(),
        __score: 200, // prioridad alta
      }));

    return [...buildSuggestions, ...baseSuggestions];
  }, [query, catalog, activeChips, library]);

  // Chips → filtros reales
  const filters = useMemo(() => {
    return activeChips.map((chip) => {
      if (chip.kind === "skill") {
        return {
          type: "skill",
          key: chip.key,
          state: chip.state ?? "base", // base = baseOnly
        };
      }

      if (chip.kind === "weaponType") {
        return {
          type: "weaponType",
          slot: chip.slot, // primary|secondary
          weaponType: chip.weaponType, // NORMALIZADO
        };
      }

      if (chip.kind === "buildName") {
        return {
          type: "buildName",
          // value: chip.label.toLowerCase(),
          value: normalize(chip.label.replace(/^buildname:\s*/i, "")),
        };
      }

      return { type: chip.kind, key: chip.key };
    });
  }, [activeChips]);

  // const filteredBuilds = useMemo(() => {
  //   return filterBuilds(indexedBuilds, filters, {
  //     weaponTypeByKey: weaponTypeIndex.weaponTypeByKey,
  //   });
  // }, [indexedBuilds, filters, weaponTypeIndex]);
  const filteredBuilds = useMemo(() => {
  const result = filterBuilds(indexedBuilds, filters, {
    weaponTypeByKey: weaponTypeIndex.weaponTypeByKey,
  });

  return result.sort((a, b) => {
    const slotA = a.slot ?? Infinity;
    const slotB = b.slot ?? Infinity;

    return slotA - slotB;
  });
}, [indexedBuilds, filters, weaponTypeIndex]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("filters");
    if (!raw) return;

    const decoded = decodeFilters(raw);

    // Reconstruimos chips mínimos
    const rebuilt = decoded.map((f) => {
      switch (f.k) {
        case "skill":
          return {
            kind: "skill",
            key: f.key,
            state: f.state,
          };

        case "weaponType":
          return {
            kind: "weaponType",
            slot: f.slot,
            weaponType: f.weaponType,
            key: `${f.slot}:${f.weaponType}`,
          };

        case "buildName":
          return {
            kind: "buildName",
            rawValue: f.value,
            label: f.value,
          };

        default:
          return {
            kind: f.k,
            key: f.key,
          };
      }
    });

    setActiveChips(rebuilt);
  }, []);

  useEffect(() => {
    const serialized = encodeFilters(activeChips);

    const params = new URLSearchParams(location.search);

    if (serialized) {
      params.set("filters", serialized);
    } else {
      params.delete("filters");
    }

    navigate(
      {
        pathname: location.pathname,
        search: params.toString(),
      },
      { replace: true }
    );
  }, [activeChips]);

const suggestionsWithDividers = useMemo(() => {
  return buildSuggestionsWithDividers(suggestions);
}, [suggestions]);

  if (loading) return <Spinner label="Loading builds…" />;

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>
        <Section>
          <div className={styles.btnWrapper}>
          <button
            className={styles.btn}
            onClick={() => navigate({pathname: "/library-roulette",search: location.search,},{state: { fromExplorer: true },})}
          >
            <LuTarget />
          </button>
          <div className={styles.rouletteBtnText}>Spin roulette with current filtered builds</div>
        </div>

        </Section>

        <Section title="//Input_search_query">
          {/* Input */}
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
          />

          {/* Suggestions */}
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
                        setActiveChips((prev) => [
                          ...prev,
                          {
                            kind: "weaponType",
                            key: s.key,
                            slot: s.slot,
                            weaponType: s.weaponType,
                          },
                        ]);
                      } else if (s.kind === "buildName") {
                        setActiveChips((prev) => [
                          ...prev,
                          { kind: "buildName", key: s.key, label: s.label },
                        ]);
                      } else {
                        setActiveChips((prev) => [
                          ...prev,
                          { kind: s.kind, key: s.key },
                        ]);
                      }
                      setQuery("");
                    }}
                  >
                    <strong>
                      {s.kind === "weaponType"
                        ? formatWeaponTypeWithSlot(s.slot, s.weaponType ?? s.label)
                        : s.label}
                    </strong>
                  </div>
                );
              })}
            </div>
          )}
        </Section>

        {activeChips?.length >= 1 &&
          <Section title="//Applied_filters">
            {/* Chips */}
            <div className={styles.chips}>
              {activeChips.map((chip, i) => (
                <div key={`${chip.kind}-${chip.key}`} className={styles.chip}>
                  <div className={styles.chipContent}>
                    <span className={styles.chipLabel}>
                      {getChipLabel(chip, NAME_BY_KEY)}
                    </span>
                    <span className={styles.chipKindBadge} style={{ background: getChipKindColor(chip.kind) }}>
                      {getChipKindLabel(chip)}
                    </span>
                  </div>

                  {chip.kind === "skill" && (
                    <select
                      value={chip.state ?? "base"}
                      onChange={(e) => {
                        const next = [...activeChips];
                        next[i] = { ...chip, state: e.target.value };
                        setActiveChips(next);
                      }}
                      className={styles.skillStateSelect}
                    >
                      <option value="base">Base</option>
                      <option value="aced">Ace</option>
                    </select>
                  )}

                  <button
                    onClick={() =>
                      setActiveChips((prev) => prev.filter((c) => c !== chip))
                    }
                    className={styles.removeChipBtn}
                  >
                    <IoClose />
                  </button>
                </div>
              ))}
            </div>
          </Section>
        }
        <Section title="//Results">
          <div className={styles.resultsWrapper}>
            <div className={styles.resultsLength}>{filteredBuilds.length} results</div>

            <div className={styles.results}>
              {filteredBuilds.map((build) => (
                <div key={build.id} className={styles.card}>
                  <div className={styles.buildNameWrapper}>
                    <span className={styles.slotNumber}>{build.slot ?? "—"}</span>
                    <span className={styles.buildName}>{build.name || "(Unnamed Build)"}</span>
                  </div>

                  <div className={styles.btnWrapper}>
                    <button
                      className={styles.btn}
                      onClick={() =>
                        loadBuild(build, {
                          fromExplorer: location.search,
                        })
                      }
                    >
                      <IoMdOpen />
                    </button>
                    <div>OPEN</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}