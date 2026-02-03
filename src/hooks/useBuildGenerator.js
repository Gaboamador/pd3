// src/hooks/useBuildGenerator.js

import { useEffect, useState, useRef } from "react";
import { r, sourceMap, randomArmor } from "../data";

const STORAGE_KEY = "pd3-random-build-v1";
const RECENT_LIMIT = 3;

// Helper: evitar repetir recientes, con fallback si se agotan
function pickWithoutRecent(list, recent, rng = Math.random) {
  const candidates = list.filter(item => !recent.includes(item));
  if (candidates.length === 0) {
    // Si todos están en recientes, permitimos volver a elegir cualquiera
    return r(list, rng);
  }
  return r(candidates, rng);
}

export function useBuildGenerator() {
  const [build, setBuild] = useState({
    primary: null,   // objeto { name, type, category } o null
    secondary: null, // idem
    overkill: "",
    armor: { type: "", plates: [] },
    throwable: "",
    deployable: "",
    tool: "",
    heist: ""
  });

  // Recientes por categoría (solo guardamos nombres de armas, no objetos)
  const recentRef = useRef({
    primary: [],
    secondary: [],
    overkill: [],
    throwable: [],
    deployable: [],
    tool: [],
    heist: []
  });

  const [initialized, setInitialized] = useState(false);

  // Devuelve la lista de armas de una categoría (primary / secondary),
  // filtrando por tipos si se pasan en filters
  function getFilteredWeapons(category, filters) {
    const list = sourceMap[category];
    if (!Array.isArray(list)) return [];

    if (!filters || filters.length === 0) {
      return list;
    }
    return list.filter(w => filters.includes(w.type));
  }

  // Elige un arma de una categoría, con filtros de tipo y sin repetir recientes
  function pickAndTrack(category, filters) {
    const allWeapons = getFilteredWeapons(category, filters);
    if (allWeapons.length === 0) return null;

    const names = allWeapons.map(w => w.name);
    const recentNames = recentRef.current[category] || [];

    const chosenName = pickWithoutRecent(names, recentNames);

    const updatedRecent = [
      chosenName,
      ...recentNames.filter(n => n !== chosenName)
    ].slice(0, RECENT_LIMIT);

    recentRef.current[category] = updatedRecent;

    return allWeapons.find(w => w.name === chosenName) || null;
  }

  function generateFullBuild(options = {}) {

    const { primaryTypes, secondaryTypes } = options;

    setBuild({
      primary: pickAndTrack("primary", primaryTypes),
      secondary: pickAndTrack("secondary", secondaryTypes),
      overkill: r(sourceMap.overkill),
      armor: randomArmor(),
      throwable: r(sourceMap.throwable),
      deployable: r(sourceMap.deployable),
      tool: r(sourceMap.tool),
      heist: r(sourceMap.heist)
    });
  }

  function rerollField(category, options = {}) {
    const { primaryTypes, secondaryTypes } = options;

    if (category === "armor") {
      setBuild(b => ({
        ...b,
        armor: randomArmor()
      }));
    } else if (category === "primary") {
      setBuild(b => ({
        ...b,
        primary: pickAndTrack("primary", primaryTypes)
      }));
    } else if (category === "secondary") {
      setBuild(b => ({
        ...b,
        secondary: pickAndTrack("secondary", secondaryTypes)
      }));
    } else {
      // categorías simples: overkill, throwable, deployable, tool, heist
      setBuild(b => ({
        ...b,
        [category]: r(sourceMap[category])
      }));
    }
  }

  function resetBuild() {
  setBuild({
    primary: null,
    secondary: null,
    overkill: "",
    armor: { type: "", plates: [] },
    throwable: "",
    deployable: "",
    tool: "",
    heist: ""
  });
}


  // Carga inicial desde sessionStorage
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setBuild(parsed);
          setInitialized(true);
          return;
        }
      }
    } catch (e) {
      console.error("Error reading build from sessionStorage", e);
    }

    // Si no había nada, generamos una build inicial
    generateFullBuild();
    setInitialized(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guardar en sessionStorage cuando cambie el build
  useEffect(() => {
    if (!initialized) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch (e) {
      console.error("Error saving build to sessionStorage", e);
    }
  }, [build, initialized]);

  return {
    build,
    generateFullBuild,
    rerollField,
    resetBuild,
    sourceMap
  };
}
