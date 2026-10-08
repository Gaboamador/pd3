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
import perksData from "../data/payday3_perks.json";

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
import useIsMobile from "../hooks/useIsMobile";
import { BREAKPOINTS } from "../constants/breakpoints";

export default function BuildEditor({mode}) {
  const { t } = useTranslation();
  const { uid } = useAuth();
  const navigate = useNavigate();
  const { encoded } = useParams();
  const userHasEditedRef = useRef(false);
  const location = useLocation();
  const [fromExplorerSearch] = useState(() => location.state?.fromExplorer ?? null);
  const [fromRoulette] = useState(() => location.state?.fromRoulette ?? null);
  const [fromComparison] = useState(() => location.state?.fromComparison ?? false);
  const [shareUrl, setShareUrl] = useState(null);

  // const [library, setLibrary] = useState([]);
  // const [libraryLoading, setLibraryLoading] = useState(true);
  const { library, loading, setLibrary } = useUserLibrary();

  const [showAuthRequired, setShowAuthRequired] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const mobileEditor = useIsMobile(BREAKPOINTS.mobile);
  const [mobileTab, setMobileTab] = useState("loadout");
  const [mobileNameDialog, setMobileNameDialog] = useState(null); // rename | saveAs
  const [mobileNameDraft, setMobileNameDraft] = useState("");
  const [mobileActionsOpen, setMobileActionsOpen] = useState(false);
  const mobileActionsRef = useRef(null);
  const libraryAnchorRef = useRef(null);
  const mobileSectionNavRef = useRef(null);
  function selectMobileTab(tab) {
    setMobileTab(tab);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function openNameDialog(kind) {
    setMobileActionsOpen(false);
    setMobileNameDraft(kind === "saveAs"
      ? makeCopyNameIfNeeded(build.name, library)
      : build.name ?? "");
    setMobileNameDialog(kind);
  }
  function submitMobileName(event) {
    event.preventDefault();
    const nextName = mobileNameDraft.trim();
    if (!nextName) return;
    const kind = mobileNameDialog;
    setMobileNameDialog(null);
    if (kind === "saveAs") {
      void handleSaveAs(nextName);
    } else if (kind === "rename" && nextName !== build.name) {
      updateBuild(prev => ({ ...prev, name: nextName }));
    }
  }
  function openBuildLibrary() {
    setMobileActionsOpen(false);
    setShowLibrary(wasOpen => !wasOpen);
  }
  useEffect(() => {
    if (!mobileEditor || !showLibrary) return;
    const frame = window.requestAnimationFrame(() => {
      const panel = libraryAnchorRef.current;
      const tabs = mobileSectionNavRef.current;
      if (!panel || !tabs) return;
      // Align below the actual sticky tabs, rather than using a large, fixed
      // scroll-margin that leaves an empty band above the library.
      const offset = panel.getBoundingClientRect().top - tabs.getBoundingClientRect().bottom - 8;
      if (Math.abs(offset) > 8) window.scrollBy({ top: offset, behavior: "smooth" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [mobileEditor, showLibrary]);
  useEffect(() => {
    if (!mobileActionsOpen) return;
    function onOutsidePointer(event) {
      if (!mobileActionsRef.current?.contains(event.target)) setMobileActionsOpen(false);
    }
    function onEscape(event) { if (event.key === 'Escape') setMobileActionsOpen(false); }
    document.addEventListener('pointerdown', onOutsidePointer);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('pointerdown', onOutsidePointer);
      document.removeEventListener('keydown', onEscape);
    };
  }, [mobileActionsOpen]);

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
      perksData,
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


  async function handleSaveAs(explicitName = null) {

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

      const nextName = makeCopyNameIfNeeded(typeof explicitName === "string" ? explicitName : build.name, library);

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
  setMobileTab("loadout");
  setShowLibrary(false);
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
    <div className={styles.page} data-mobile-build-editor="true">

    <nav ref={mobileSectionNavRef} className={styles.mobileSectionNav} aria-label="Build editor sections">
      <button type="button" className={styles.mobileNameTag}
        aria-label={t('mobile.editor.edit-name')}
        title={t('mobile.editor.edit-name')}
        onClick={() => openNameDialog("rename")}>
        <span className={styles.mobileNameText}>{build.name?.trim() || t('mobile.editor.unnamed')}</span>
        <span aria-hidden="true">✎</span>
      </button>
      <div className={styles.mobileTabButtons} role="group" aria-label="Editor tabs">
        <button type="button" aria-pressed={mobileTab === "loadout"}
          className={mobileTab === "loadout" ? styles.mobileTabActive : ""}
          onClick={() => selectMobileTab("loadout")}>{t('mobile.editor.loadout')}</button>
        <button type="button" aria-pressed={mobileTab === "skills"}
          className={mobileTab === "skills" ? styles.mobileTabActive : ""}
          onClick={() => selectMobileTab("skills")}>{t('mobile.editor.skills')}</button>
      </div>
    </nav>

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

    {(fromExplorerSearch !== null || fromRoulette !== null || fromComparison) && (
      <Section>
        <div className={styles.backToExplorerWrapper}>
          <button
          onClick={() => {
              if (fromComparison) {
                navigate(-1);
              } else if (fromRoulette !== null) {
                navigate(`/library-roulette${fromRoulette}`);
              } else if (fromExplorerSearch !== null) {
                navigate(`/library-explorer${fromExplorerSearch}`);
              }
            }}
            className={styles.backBtn}
          >
            <IoChevronBackCircleSharp />
          </button>

          <span>
            {/* {fromComparison ? t('nav.back-to-comparison') : t('nav.back-to-explorer')} */}
              {fromComparison
                ? t('nav.back-to-comparison')
                : fromRoulette !== null
                ? t('nav.back-to-roulette')
                : t('nav.back-to-explorer')
              }
          </span>
        </div>
      </Section>
    )}

    {!mobileEditor && (
    <div className={styles.editorSection}>
    <Section title={t('section.title.manage_builds')}>
      <div className={styles.manageBuildsWrapper}>
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
      </div>

      {showAuthRequired && (
        <>
        <div className={styles.handleLoginWrapper}>
          <span>{t('auth.msg.login-required.builds')}</span>
          
          <button onClick={() => navigate("/auth")}>
            {t('auth.actions.login')}
          </button>
        </div>
        </>
      )}
      
      {saving && <Spinner label={t('spinner.saving')} />}
    </Section>
    </div>
    )}
    {mobileEditor && showAuthRequired && (
      <div className={styles.mobileAuthMessage}>
        <span>{t('auth.msg.login-required.builds')}</span>
        <button type="button" onClick={() => navigate("/auth")}>{t('auth.actions.login')}</button>
      </div>
    )}
    {mobileEditor && saving && <Spinner label={t('spinner.saving')} />}

  <AnimatePresence>
    {showLibrary && (
      <motion.div
        ref={libraryAnchorRef}
        className={styles.libraryPanel}
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
            setMobileTab("loadout");
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

      {!mobileEditor && <div className={styles.editorSection}>
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
      </div>}

      <div className={`${styles.editorSection} ${mobileEditor && mobileTab !== "loadout" ? styles.mobileTabPanelHidden : ""}`}> 
      <Section title={t('section.title.loadout')}>
        <LoadoutEditor
          build={build}
          setBuild={updateBuild}
          loadoutNormalized={loadoutNormalized}
          platesData={platesData}
          loadoutData={loadoutData}
          perksData={perksData}
        />
      </Section>
      </div>

<div className={`${styles.editorSection} ${styles.backgroundImage} ${mobileEditor && mobileTab !== "skills" ? styles.mobileTabPanelHidden : ""}`}>
      <Section title={t('section.title.skills')} overrideBg>
        <SkillsEditor
          build={build}
          setBuild={updateBuild}
          skillTree={skillTree}
          isVisible={!mobileEditor || mobileTab === "skills"}
          skillsData={skillsData}
          usedPoints={usedPoints}
          skillGroupsData={skillGroupsData}
        />
      </Section>
</div>

      <Modal open={Boolean(mobileNameDialog)}
        onClose={() => setMobileNameDialog(null)}
        title={mobileNameDialog === "saveAs" ? t('mobile.editor.save-as-name') : t('mobile.editor.edit-name')}
        width="480px">
        <form className={styles.mobileNameForm} onSubmit={submitMobileName}>
          <label htmlFor="mobile-build-name">{t('mobile.editor.name-prompt')}</label>
          <input id="mobile-build-name" type="text" required maxLength={120}
            autoFocus placeholder={t('title.placeholder.build-name')}
            value={mobileNameDraft} onChange={event => setMobileNameDraft(event.target.value)} />
          <div className={styles.mobileNameActions}>
            <button type="button" className="secondary" onClick={() => setMobileNameDialog(null)}>
              {t('modal.actions.cancel')}
            </button>
            <button type="submit" disabled={!mobileNameDraft.trim() || saving}>
              {mobileNameDialog === "saveAs" ? t('build.actions.save-as') : t('mobile.editor.save-name')}
            </button>
          </div>
        </form>
      </Modal>

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

      <div className={`${styles.mobileActionsBar} ${showLibrary ? styles.mobileActionsBarLibraryOpen : ""}`}>
        <button type="button" onClick={handleSaveBuild} disabled={!canSave || saving}
          title={!canSave ? t('build.msg.save-disabled') : undefined}>
          {t('build.actions.save')}
        </button>
        <button type="button" onClick={() => openNameDialog("saveAs")} disabled={saving}>
          {t('build.actions.save-as')}
        </button>
        <div className={styles.mobileMoreWrapper} ref={mobileActionsRef}>
          {showLibrary ? (
            <button type="button" className={styles.mobileCloseLibraryButton}
              onClick={() => setShowLibrary(false)}>
              {t('mobile.editor.library-close')} ×
            </button>
          ) : (
          <>
          <button type="button" className={styles.mobileMoreButton}
            aria-expanded={mobileActionsOpen} aria-label={t('mobile.editor.more')}
            onClick={() => setMobileActionsOpen(value => !value)}>⋯</button>
          {mobileActionsOpen && (
            <div className={styles.mobileMoreMenu}>
              <button type="button" onClick={openBuildLibrary}>
                {showLibrary ? t('mobile.editor.library-close') : t('build.actions.open_library')} ({orderedLibrary.length})
              </button>
              <button type="button" onClick={() => { setMobileActionsOpen(false); handleNewBuild(); }}>{t('build.actions.new')}</button>
              <button type="button" onClick={() => { setMobileActionsOpen(false); handleShare(); }}>{t('build.actions.share')}</button>
            </div>
          )}
          </>
          )}
        </div>
      </div>

      <ScrollArrow editorToolbar/>
    </div>
  );
}
