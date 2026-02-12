import { useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
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
import { BuildLibraryService } from "../services/buildLibraryService";
import { makeCopyNameIfNeeded } from "../utils/makeCopyNameIfNeeded";
import { requireAuthForAction } from "../utils/requireAuthForAction";

import LoadoutEditor from "./components/loadout/LoadoutEditor";
import SkillsEditor from "./components/skills/SkillsEditor";
import Section from "./components/common/Section";
import BuildLibrary from "./BuildLibrary";
import Spinner from "../components/Spinner";
import ShareQrModal from "../components/ShareQRModal";
import ScrollArrow from "../components/ScrollArrow";

export default function BuildEditor({mode}) {

  const { uid } = useAuth();
  const navigate = useNavigate();
  const { encoded } = useParams();
  const userHasEditedRef = useRef(false);

  const [shareUrl, setShareUrl] = useState(null);

  const [library, setLibrary] = useState([]);
  const [libraryLoading, setLibraryLoading] = useState(true);

  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  function normalizeOwnedBuild(build) {
  const clean = { ...build };
  delete clean.__shared;
  return clean;
}

useEffect(() => {
  let mounted = true;

  async function loadLibrary() {
    setLibraryLoading(true);
    const data = await BuildLibraryService.getAll(uid);
    
    if (mounted) {
      setLibrary(data);
      setLibraryLoading(false);
    }
  }

  loadLibrary();

  return () => {
    mounted = false;
  };
}, [uid]);

const [build, setBuild] = useState(() => {
  if (encoded) {
    const fromUrl = decodeBuildFromUrl(encoded);

    if (fromUrl) {
      if (mode === "share") {
        return {
          ...fromUrl,
          id: null,
          slot: null,
          __shared: true,
        };
      }

      return normalizeOwnedBuild(fromUrl);
    }
  }

  const fromSession = loadBuildFromSession();
    return fromSession ? normalizeOwnedBuild(fromSession) : createEmptyBuild();
  });

  function updateBuild(updater) {
    userHasEditedRef.current = true;
    setBuild(updater);
  }

  const isFirstRender = useRef(true);

  useEffect(() => {
    const clean = normalizeOwnedBuild(build);
    saveBuildToSession(clean);

    const nextEncoded = encodeBuildToUrl(clean);
    if (!nextEncoded) return;

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Si estamos en share y el usuario NO editó todavía → no navegar
    if (mode === "share" && !userHasEditedRef.current) {
      return;
    }

    navigate(`/build-editor/b/${nextEncoded}`, { replace: true });

  }, [build, navigate, mode]);


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


async function handleSaveBuild() {

  const ok = requireAuthForAction({
    uid,
    navigate,
    location,
    onAuthRequired: () => setShowAuthRequired(true),
    autoRedirect: false,
  });

  if (!ok) return;

  const isShared = Boolean(build.__shared);
  const isNew = !build.id;

  const nextRaw = {
    ...build,
    id: (isShared || isNew) ? nanoid() : build.id,
    slot: isShared ? null : build.slot ?? null,
  };

  const next = normalizeOwnedBuild(nextRaw);

  const updated = await BuildLibraryService.save(uid, next);
  setLibrary(updated);
  setBuild(next);

  const nextEncoded = encodeBuildToUrl(next);
  if (nextEncoded) {
    navigate(`/build-editor/b/${nextEncoded}`, { replace: true });
  }
}


async function handleSaveAs() {

  const ok = requireAuthForAction({
    uid,
    navigate,
    location,
    onAuthRequired: () => setShowAuthRequired(true),
    autoRedirect: false,
  });

  if (!ok) return;

  const nextName = makeCopyNameIfNeeded(build.name, library);

  const duplicatedRaw = {
    ...build,
    id: nanoid(),
    slot: null,
    name: nextName,
  };

  const duplicated = normalizeOwnedBuild(duplicatedRaw);

  const updated = await BuildLibraryService.save(uid, duplicated);
  setLibrary(updated);
  setBuild(duplicated);
}

async function handleDeleteBuild(id) {

  const nextLibrary = await BuildLibraryService.delete(uid, id);
  setLibrary(nextLibrary);


  if (id === build.id) {
    const fallback = nextLibrary[0] ?? loadBuildFromSession();
    setBuild(fallback);
  }
}

function handleNewBuild() {
  const draft = normalizeOwnedBuild(createEmptyBuild());
  setBuild(draft);
  saveBuildToSession(draft);
  navigate("/build-editor", { replace: true });
}

function handleShare() {
  const encoded = encodeBuildToUrl(normalizeOwnedBuild(build));
  if (!encoded) return;

  const url =
    `${window.location.origin}/build-editor/share/${encoded}`;

  setShareUrl(url);
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


async function handleAssignSlot(id, slot) {
  const next = await BuildLibraryService.assignSlot(uid, id, slot);
  setLibrary(next);
}

if (libraryLoading) {
  return <Spinner label="Loading builds…" />;
}


return (
    <div className={styles.page}>

  {mode === "share" && (
    <div className={styles.sharedBanner}>
      Viewing a shared build.  
      Save it to add it to your library.
    </div>
  )}


  {shareUrl && (
    <ShareQrModal
      url={shareUrl}
      onClose={() => setShareUrl(null)}
    />
  )}

    <Section title="//Manage_builds">
      <button
        className="secondary"
        onClick={() => setShowLibrary(v => !v)}
      >
        📁 BUILDS ({orderedLibrary.length})
      </button>

      <button onClick={handleNewBuild}>
        NEW BUILD
      </button>

      <button onClick={handleShare}>
        SHARE BUILD
      </button>

      <button onClick={handleSaveBuild}>
        SAVE
      </button>
      
      <button onClick={handleSaveAs}>
        SAVE AS
      </button>

      {showAuthRequired && (
        <>
          <span>Log in to save builds to your library</span>
          
          <button onClick={() => navigate("/auth")}>
            LOG IN
          </button>
        </>
      )}
    </Section>

    {showLibrary && (
      <BuildLibrary
        builds={orderedLibrary}
        currentBuildId={build.id}
        onLoadBuild={(b) => {
          const clean = normalizeOwnedBuild(b);
          userHasEditedRef.current = true;
          setBuild(clean);
          setShowLibrary(false);
          const nextEncoded = encodeBuildToUrl(clean);
          if (nextEncoded) {
            navigate(`/build-editor/b/${nextEncoded}`, { replace: true });
          }
        }}
        onDeleteBuild={handleDeleteBuild}
        onAssignSlot={handleAssignSlot}
      />
    )}

      <Section title="//BUILD_NAME">
        <input
          type="text"
          placeholder="Build name"
          className={styles.buildNameInput}
          value={build.name}
          onChange={(e) =>
            updateBuild(prev => ({
              ...prev,
              name: e.target.value,
            }))
          }
        />
      </Section>

      <Section title="//LOADOUT">
        <LoadoutEditor
          build={build}
          setBuild={updateBuild}
          loadoutNormalized={loadoutNormalized}
          platesData={platesData}
          loadoutData={loadoutData}
        />
      </Section>

      <Section title="//SKILLS">
        <SkillsEditor
          build={build}
          setBuild={updateBuild}
          skillTree={skillTree}
          skillsData={skillsData}
          usedPoints={usedPoints}
          skillGroupsData={skillGroupsData}
        />
      </Section>

      <ScrollArrow/>
    </div>
  );
}
