import { useMemo, useState, useEffect } from "react";
import styles from "./LibraryExplorer.module.scss";
import { useLocation, useNavigate, Link } from "react-router-dom";

import { useUserLibrary } from "../hooks/useUserLibrary";
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

  // const suggestions = useMemo(() => {
  //   return getSuggestions(query, catalog, activeChips);
  // }, [query, catalog, activeChips]);
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


  if (loading) return <Spinner label="Loading builds…" />;

  return (
    <div className={styles.wrapper}>
      <h1>Library Explorer</h1>

      <Link
  to={`/library-roulette${location.search}`}
  className={styles.rouletteBtn}
>
  🎡 Spin with current filters
</Link>

      {/* Chips */}
      <div className={styles.chips}>
        {activeChips.map((chip, i) => (
          <div key={`${chip.kind}-${chip.key}`} className={styles.chip}>
            <span>{chip.label}</span>

            {chip.kind === "skill" && (
              <select
                value={chip.state ?? "base"}
                onChange={(e) => {
                  const next = [...activeChips];
                  next[i] = { ...chip, state: e.target.value };
                  setActiveChips(next);
                }}
              >
                <option value="base">Base</option>
                <option value="aced">Ace</option>
              </select>
            )}

            <button
              onClick={() =>
                setActiveChips((prev) => prev.filter((c) => c !== chip))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
          {suggestions.map((s) => (
            <div
              key={`${s.kind}-${s.key}`}
              className={styles.suggestion}
              onClick={() => {
                // Armamos chip con todo lo necesario
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
                      label: `${capitalizeKind(s.kind)}: ${s.label}`,
                    },
                  ]);
                }

                setQuery("");
              }}
            >
              <strong>{s.label}</strong>
              <span className={styles.kind}>
                {s.kind === "weaponType" ? "Weapon Type" : s.kind}
              </span>
            </div>
          ))}
        </div>
      )}

      <p>{filteredBuilds.length} results</p>

      <div className={styles.results}>
        {filteredBuilds.map((build) => (
          <div key={build.id} className={styles.card}>
            <h3>{build.name || "(Unnamed Build)"}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

function capitalizeKind(k) {
  if (!k) return "";
  return k[0].toUpperCase() + k.slice(1);
}
