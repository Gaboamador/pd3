import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { nanoid } from "nanoid";
import { useToast } from "../context/ToastContext";
import { AnimatePresence, motion } from "framer-motion";
import { FaFolder, FaFolderOpen } from "react-icons/fa";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import styles from "./BuildEditor.module.scss";
import skillsData from "../data/payday3_skills.json";
import skillGroupsData from "../data/payday3_skill_groups.json";
import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";

import { useUserLibrary } from "../library/hooks/useUserLibrary";
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
import Modal from "./components/common/Modal";

export default function BuildEditor({mode}) {
  const { t } = useTranslation();
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { encoded } = useParams();
  const userHasEditedRef = useRef(false);
  const location = useLocation();
  const [fromExplorerSearch] = useState(() => location.state?.fromExplorer ?? null);
  const [fromComparison] = useState(() => location.state?.fromComparison ?? false);
  const [shareUrl, setShareUrl] = useState(null);

  // const [library, setLibrary] = useState([]);
  // const [libraryLoading, setLibraryLoading] = useState(true);
  const { library, loading, setLibrary } = useUserLibrary();

  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);

  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  function normalizeOwnedBuild(build) {
  const clean = { ...build };
  delete clean.__shared;
  return clean;
}

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

    if (!canSave) return;

    const ok = requireAuthForAction({
      uid,
      navigate,
      location,
      onAuthRequired: () => setShowAuthRequired(true),
      autoRedirect: false,
    });

    if (!ok) return;

    try {
      setSaving(true);

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

        showToast({
        type: "success",
        message: isShared || isNew ? t('build.saved') : t('build.updated'),
        });
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          message: t('build.failed-to-save'),
        });
      } finally {
        setSaving(false);
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

    try {
      setSaving(true);

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

        showToast({
          type: "success",
          message: t('build.saved-as-new'),
        });
      } catch (err) {
        console.error(err);
        showToast({
          type: "error",
          message: t('builds.failed-save-as-new'),
        });
      } finally {
        setSaving(false);
      }
  }

  async function performDeleteBuild() {
    if (!pendingDeleteId) return;

    try {
      setSaving(true);

      const nextLibrary = await BuildLibraryService.delete(uid, pendingDeleteId);
      setLibrary(nextLibrary);

      if (pendingDeleteId === build.id) {
        const fallback = nextLibrary[0] ?? loadBuildFromSession();
        setBuild(fallback);
      }

      showToast({
        type: "success",
        message: t('build.deleted'),
      });

    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        message: t('build.failed-delete'),
      });
    } finally {
      setSaving(false);
      setConfirmDeleteOpen(false);
      setPendingDeleteId(null);
    }
  }

  function handleDeleteBuild(id) {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
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
    // `${window.location.origin}/build-editor/share/${encoded}`;
    `${window.location.origin}/s/${encoded}`;

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
    try {
      setSaving(true);

      const next = await BuildLibraryService.assignSlot(uid, id, slot);
      setLibrary(next);

      showToast({
        type: "success",
        message: t('build.slot-updated'),
      });
    } catch (err) {
      console.error(err);
      showToast({
        type: "error",
        message: t('build.failed-update-slot'),
      });
    } finally {
      setSaving(false);
    }
  }


if (loading) {
  return <Spinner label={t('spinner.loading')} />;
}

const canSave =
  Boolean(build.id) &&
  !build.__shared;


return (
    <div className={styles.page}>

    {mode === "share" && (
      <div className={styles.sharedBanner}>
        {t('build.shared_flag')}
      </div>
    )}

    {shareUrl && (
      <ShareQrModal
        url={shareUrl}
        onClose={() => setShareUrl(null)}
        sharedBuild={build}
      />
    )}

    {(fromExplorerSearch !== null || fromComparison) && (
      <Section>
        <div className={styles.backToExplorerWrapper}>
          <button
            onClick={() => {
              if (fromComparison) {
                navigate(-1);
              } else {
                navigate(`/library-explorer${fromExplorerSearch}`);
              }
            }}
            className={styles.backBtn}
          >
            <IoChevronBackCircleSharp />
          </button>

          <span>
            {fromComparison ? t('nav.back-to-comparison') : t('nav.back-to-explorer')}
          </span>
        </div>
      </Section>
    )}

    <Section title={t('section.title.manage_builds')}>
      <button
        className="secondary"
        onClick={() => setShowLibrary(v => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <div style={{ position: "relative", width: 18, height: 18 }}>
          <AnimatePresence mode="wait">
            {showLibrary ? (
              <motion.div
                key="open"
                initial={{ opacity: 0, rotate: -10, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 10, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                style={{ position: "absolute" }}
              >
                <FaFolderOpen size={18} className={styles.folderIcon}/>
              </motion.div>
            ) : (
              <motion.div
                key="closed"
                initial={{ opacity: 0, rotate: 10, scale: 0.85 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -10, scale: 0.85 }}
                transition={{ duration: 0.18 }}
                style={{ position: "absolute" }}
              >
                <FaFolder size={18} className={styles.folderIcon}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span>
          {t('build.actions.open_library')} ({orderedLibrary.length})
        </span>
      </button>

      <button onClick={handleNewBuild}>
        {t('build.actions.new')}
      </button>

      <button onClick={handleShare}>
        {t('build.actions.share')}
      </button>

      <div className={styles.handleSaveActionsWrapper}>
        <button className={!canSave ? styles.handleSaveActionBtn : ''} onClick={handleSaveBuild} disabled={!canSave || saving} title={!canSave ? t('build.msg.save-disabled') : ""}>
          {t('build.actions.save')}
        </button>
        <span className={styles.handleSaveActionsMessage}>{t('build.msg.update-current')}</span>
      </div>
      
      <div className={styles.handleSaveActionsWrapper}>
        <button className={!canSave ? styles.handleSaveActionBtn : ''} onClick={handleSaveAs} disabled={saving}>
          {t('build.actions.save-as')}
        </button>
        <span className={styles.handleSaveActionsMessage}>{t('build.msg.save-as-new')}</span>
      </div>

      {saving && <Spinner label={t('spinner.saving')} />}

      <div className={styles.handleLoginWrapper}>
        {showAuthRequired && (
          <>
            <span>{t('auth.msg.login-required.builds')}</span>
            
            <button onClick={() => navigate("/auth")}>
              {t('auth.actions.login')}
            </button>
          </>
        )}
      </div>

    </Section>

  <AnimatePresence>
    {showLibrary && (
      <motion.div
        key="build-library"
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        style={{ overflow: "hidden" }}
      >
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
      </motion.div>
    )}
  </AnimatePresence>

      <Section title={t('section.title.build_name')}>
        <input
          type="text"
          placeholder={t('title.placeholder.build-name')}
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

      <Section title={t('section.title.loadout')}>
        <LoadoutEditor
          build={build}
          setBuild={updateBuild}
          loadoutNormalized={loadoutNormalized}
          platesData={platesData}
          loadoutData={loadoutData}
        />
      </Section>

<div className={styles.backgroundImage}>
      <Section title={t('section.title.skills')} overrideBg>
        <SkillsEditor
          build={build}
          setBuild={updateBuild}
          skillTree={skillTree}
          skillsData={skillsData}
          usedPoints={usedPoints}
          skillGroupsData={skillGroupsData}
        />
      </Section>
</div>

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Modal
        open={confirmDeleteOpen}
        onClose={() => {
          if (!saving) {
            setConfirmDeleteOpen(false);
            setPendingDeleteId(null);
          }
        }}
        title={t('modal.title.delete-build')}
        width="520px"
      >
        <div style={{ marginBottom: "20px" }}>
          {t('modal.msg.delete-build')}
        </div>
        {saving && (
          <div style={{ marginBottom: 16 }}>
            <Spinner size="sm" label={t('spinner.deleting')} />
          </div>
        )}
        <div style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px"
        }}>
          <button
            className="secondary"
            onClick={() => {
              setConfirmDeleteOpen(false);
              setPendingDeleteId(null);
            }}
            disabled={saving}
          >
            {t('modal.actions.cancel')}
          </button>

          <button
            onClick={performDeleteBuild}
            disabled={saving}
          >
            {saving ? t('modal.actions.deleting') : t('modal.actions.delete')}
          </button>
        </div>
      </Modal>

      <ScrollArrow/>
    </div>
  );
}
