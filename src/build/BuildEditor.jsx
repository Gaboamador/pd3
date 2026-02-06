import { useMemo, useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { nanoid } from "nanoid";
import styles from "./BuildEditor.module.scss";
import skillsData from "../data/payday3_skills.json";
import skillGroupsData from "../data/payday3_skill_groups.json";
import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";

import { loadBuildFromSession, saveBuildToSession, createEmptyBuild } from "./build.utils";
import { encodeBuildToUrl, decodeBuildFromUrl } from "./build.buildUrl.utils";
import { selectUsedSkillPoints } from "./build.selectors";
import { buildSkillTree } from "./utils/skillTree.utils";
import { normalizeLoadoutData } from "./utils/loadout.utils";
import { validateBuild } from "./build.validators";
import { loadBuildLibrary, saveBuildToLibrary, deleteBuildFromLibrary, assignBuildSlot } from "./buildLibrary.utils";
import { makeCopyNameIfNeeded } from "../utils/makeCopyNameIfNeeded";

import LoadoutEditor from "./components/loadout/LoadoutEditor";
import SkillsEditor from "./components/skills/SkillsEditor";
import Section from "./components/common/Section";
import PointsCounter from "./components/common/PointsCounter";
import BuildLibrary from "./BuildLibrary";

export default function BuildEditor() {

  const [searchParams, setSearchParams] = useSearchParams();
  
  const [library, setLibrary] = useState(() => {
  const lib = loadBuildLibrary();
  return Array.isArray(lib) ? lib : [];
});


  const [build, setBuild] = useState(() => {
    const encoded = searchParams.get("b");
    if (encoded) {
      const fromUrl = decodeBuildFromUrl(encoded);
      if (fromUrl) return fromUrl;
    }

    return loadBuildFromSession();
  });

  const isFirstRender = useRef(true);

useEffect(() => {
  saveBuildToSession(build);

  const encoded = encodeBuildToUrl(build);
  if (!encoded) return;

  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }

  const current = searchParams.get("b");
  if (current === encoded) return; // 🔑 CLAVE

  setSearchParams({ b: encoded }, { replace: true });
}, [build, searchParams, setSearchParams]);


  const usedPoints = useMemo(
    () => selectUsedSkillPoints(build, skillsData),
    [build]
  );

  const skillTree = useMemo(
    () => buildSkillTree(skillsData, skillGroupsData),
    []
  );

  const loadoutNormalized = useMemo(
    () => normalizeLoadoutData(loadoutData),
    []
  );

  const validation = useMemo(() => {
    return validateBuild(build, {
      skillsData,
      loadoutData,
      platesData,
    });
  }, [build]);

  function handleSaveBuild() {
  const next = {
    ...build,
    id: build.id ?? nanoid(),
  };

  saveBuildToLibrary(next);
  setLibrary(loadBuildLibrary());
  setBuild(next);
}

function handleSaveAs() {
  const library = loadBuildLibrary();

  const nextName = makeCopyNameIfNeeded(build.name, library);

  const duplicated = {
    ...build,
    id: nanoid(),
    slot: null,
    name: nextName,
  };

  saveBuildToLibrary(duplicated);
  setLibrary(loadBuildLibrary());
  setBuild(duplicated);
}

function handleDeleteBuild(id) {
  const nextLibrary = deleteBuildFromLibrary(id);
  setLibrary(nextLibrary);

  // opcional: si borrás el build activo
  if (id === build.id) {
    const fallback = nextLibrary[0] ?? loadBuildFromSession();
    setBuild(fallback);
  }
}

function handleNewBuild() {
  const draft = createEmptyBuild();
  setBuild(draft);
  saveBuildToSession(draft);

  // opcional: limpiar la URL
  setSearchParams({}, { replace: true });
}

const orderedLibrary = useMemo(() => {
  if (!Array.isArray(library)) return [];

  return [...library].sort((a, b) => {
    if (a.slot == null && b.slot == null) return 0;
    if (a.slot == null) return 1;
    if (b.slot == null) return -1;
    return a.slot - b.slot;
  });
}, [library]);


function handleAssignSlot(id, slot) {
  const next = assignBuildSlot(id, slot);
  setLibrary(next);
}

  return (
    <div className={styles.page}>

  <BuildLibrary
    builds={orderedLibrary}
    currentBuildId={build.id}
    onLoadBuild={setBuild}
    onDeleteBuild={handleDeleteBuild}
    onAssignSlot={handleAssignSlot}
  />

<button onClick={handleNewBuild}>
  New build
</button>


      <Section title="// BUILD NAME">
        <input
          type="text"
          placeholder="Build name"
          value={build.name}
          onChange={(e) =>
            setBuild(prev => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </Section>

      {/* <Section title="Build Editor">
        <PointsCounter used={usedPoints} />
        {!validation.ok && (
          <div style={{ marginTop: 8 }}>
            <strong>Issues:</strong>
            <ul>
              {validation.issues.map((i, idx) => (
                <li key={idx}>
                  [{i.code}] {i.message}
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section> */}

      <Section>
        <LoadoutEditor
          build={build}
          setBuild={setBuild}
          loadoutNormalized={loadoutNormalized}
          platesData={platesData}
          loadoutData={loadoutData}
        />
      </Section>

      <Section>
        <SkillsEditor
          build={build}
          setBuild={setBuild}
          skillTree={skillTree}
          skillsData={skillsData}
          usedPoints={usedPoints}
          skillGroupsData={skillGroupsData}
        />
      </Section>

      <button onClick={handleSaveBuild}>
        Save build (guardar cambios)
      </button>
      
      <button onClick={handleSaveAs}>
        Save as (crear una copia)
      </button>


    </div>
  );
}
