import { useMemo, useState, useEffect } from "react";
import styles from "./LibraryExplorer.module.scss";
import { useLocation, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { FaRandom } from "react-icons/fa";
import { IoMdOpen } from "react-icons/io";
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

import skillsData from "../../data/payday3_skills.json";
import loadoutData from "../../data/payday3_loadout_items.json";
import platesData from "../../data/payday3_armor_plates.json";
import Spinner from "../../components/Spinner";

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

  const filteredBuilds = useMemo(() => {
    return filterBuilds(indexedBuilds, filters, {
      weaponTypeByKey: weaponTypeIndex.weaponTypeByKey,
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
            label: f.key, // temporal, luego podemos enriquecer con name real
          };

        case "weaponType":
          return {
            kind: "weaponType",
            slot: f.slot,
            weaponType: f.weaponType,
            key: `${f.slot}:${f.weaponType}`,
            label: `Weapon Type: ${f.weaponType}`,
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
            label: f.key,
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

  function buildSuggestionsWithDividers(list) {
  if (!Array.isArray(list) || list.length === 0) return [];

  const result = [];
  let lastKind = null;

  for (const item of list) {
    if (item.kind !== lastKind) {
      result.push({
        __type: "divider",
        kind: item.kind,
      });
      lastKind = item.kind;
    }

    result.push({
      __type: "item",
      ...item,
    });
  }

  return result;
}

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
            <FaRandom />
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
                            label: s.label,
                          },
                        ]);
                      } else {
                        setActiveChips((prev) => [
                          ...prev,
                          {
                            kind: s.kind,
                            key: s.key,
                            label: s.label,
                          },
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
                    {/* <span className={styles.kind}>
                      {s.kind === "weaponType" ? "Weapon Type" : s.kind}
                    </span> */}
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
                  {/* <span>{formatChipLabel(chip)}</span> */}
                  <div className={styles.chipContent}>
                    <span className={styles.chipLabel}>
                      {getChipLabel(chip)}
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
                  <div className={styles.buildName}>{build.name || "(Unnamed Build)"}</div>

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

function capitalizeKind(k) {
  if (!k) return "";
  return k[0].toUpperCase() + k.slice(1);
}

function capitalizeFirst(str) {
  if (!str || typeof str !== "string") return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function formatWeaponSlotLabel(slot) {
  if (!slot) return "";

  const map = {
    primary: "Primary",
    secondary: "Secondary",
    overkill: "Overkill"
  };

  return map[slot] ?? capitalizeFirst(slot);
}

function formatWeaponTypeWithSlot(slot, type) {
  const typeLabel = formatWeaponTypeLabel(type);
  const slotLabel = formatWeaponSlotLabel(slot);

  if (!slotLabel) return typeLabel;

  // return `${slotLabel} ${typeLabel}`;
  return `${typeLabel} (${slotLabel})`;
}

function formatWeaponTypeLabel(type) {
  if (!type) return "";

  const map = {
    assaultrifle: "Assault Rifle",
    smg: "SMG",
    lmg: "LMG",
    shotgun: "Shotgun",
    handgun: "Handgun",
    marksmanrifle: "Marksman Rifle",
    sniper: "Sniper Rifle",
    overkill: "Overkill"
  };

  if (map[type]) return map[type];

  // fallback genérico por si agregás más tipos
  return type
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([a-z])([0-9])/g, "$1 $2")
    .replace(/^./, s => s.toUpperCase());
}

function getChipLabel(chip) {
  if (!chip) return "";

  if (chip.kind === "weaponType") {
    return formatWeaponTypeWithSlot(
    chip.slot,
    chip.weaponType
  );
  }

  return capitalizeFirst(chip.label);;
}

function getChipKindLabel(chip) {
  if (!chip) return "";

  switch (chip.kind) {
    case "skill":
      return "Skill";
    case "weaponType":
      return "Weapon Type";
    case "buildName":
      return "Build";
    default:
      return capitalizeKind(chip.kind);
  }
}

function getChipKindColor(kind) {
  switch (kind) {
    case "skill": return "var(--color-skill)";
    case "weaponType": return "var(--color-weapon)";
    case "primary": return "var(--color-weapon)";
    case "secondary": return "var(--color-weapon)";
    case "overkill": return "var(--color-weapon)";
    case "armor": return "var(--color-armor)";
    case "plate": return "var(--color-armor)";
    case "throwable": return "var(--color-throwable)";
    case "deployable": return "var(--color-deployable)";
    case "tool": return "var(--color-tool)";
    case "buildName": return "var(--color-build)";
    default: return "rgba(255,255,255,0.08)";
  }
}

function formatKindLabel(kind) {
  const map = {
    buildName: "Builds",
    skill: "Skills",
    weaponType: "Weapons",
    overkill: "Overkill Weapon",
    armor: "Armor",
    plate: "Plates",
    throwable: "Throwables",
    deployable: "Deployables",
    tool: "Tools"
  };

  return map[kind] ?? capitalizeKind(kind);
}