import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./LibraryRoulette.module.scss";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { IoMdOpen } from "react-icons/io";
import { FaCircleChevronDown } from "react-icons/fa6";
import Section from "../../build/components/common/Section";
import { useLoadBuild } from "../../hooks/useLoadBuild";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { attachSearchIndexToBuilds } from "../utils/buildSearchIndex";
import { filterBuilds } from "../utils/librarySearchEngine";
import { decodeFilters } from "../utils/filterSerialization";
import { buildWeaponTypeIndex } from "../utils/buildWeaponTypeIndex";

import HeistDealer from "../../heistDealer/HeistDealer";
import loadoutData from "../../data/payday3_loadout_items.json";
import Spinner from "../../components/Spinner";
import BuildWheel from "../components/BulidWheel";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LibraryRoulette() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { library, loading } = useUserLibrary();
  const { loadBuild } = useLoadBuild();
  const location = useLocation();
  const navigate = useNavigate();
  const fromExplorerSearch = location.search || null;
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const indexedBuilds = useMemo(
    () => attachSearchIndexToBuilds(library ?? []),
    [library]
  );

  const weaponTypeIndex = useMemo(() => {
    return buildWeaponTypeIndex(loadoutData);
  }, []);

  // 1️⃣ Leer filtros desde URL
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("filters");
    if (!raw) return [];

    const decoded = decodeFilters(raw);

    return decoded.map((f) => {
      switch (f.k) {
        case "skill":
          return {
            type: "skill",
            key: f.key,
            state: f.state ?? "base",
          };

        case "weaponType":
          return {
            type: "weaponType",
            slot: f.slot,
            weaponType: f.weaponType,
          };

        case "buildName":
          return {
            type: "buildName",
            value: f.value.toLowerCase(),
          };

        default:
          return { type: f.k, key: f.key };
      }
    });
  }, [location.search]);

  // 2️⃣ Filtrar pool
  const basePool = useMemo(() => {
    return filterBuilds(indexedBuilds, filters, {
      weaponTypeByKey: weaponTypeIndex.weaponTypeByKey,
    });
  }, [indexedBuilds, filters, weaponTypeIndex]);

  const basePoolSignature = useMemo(() => {
    return basePool.map(b => b.id).sort().join("|");
  }, [basePool]);

  // PERSISTENCIA DE FILTROS
  const ROULETTE_STATE_KEY = `pd3_library_roulette_state_v1_${basePoolSignature}`;
  
  const [manualMode, setManualMode] = useState("all");
  const [manualSelectedIds, setManualSelectedIds] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(ROULETTE_STATE_KEY));

      if (saved) {
        setManualMode(saved.manualMode ?? "all");
        setManualSelectedIds(saved.manualSelectedIds ?? []);
      } else {
        setManualMode("all");
        setManualSelectedIds([]);
      }
    } catch {
      setManualMode("all");
      setManualSelectedIds([]);
    }
  }, [ROULETTE_STATE_KEY]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        ROULETTE_STATE_KEY,
        JSON.stringify({
          manualMode,
          manualSelectedIds,
        })
      );
    } catch {}
  }, [manualMode, manualSelectedIds, ROULETTE_STATE_KEY]);
  // ----------------------- //

  // PERSISTENCIA DE DECK
  const [rouletteDeck, setRouletteDeck] = useState([]);

  const ROULETTE_DECK_KEY = `pd3_library_roulette_deck_v1_${basePoolSignature}`;

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(ROULETTE_DECK_KEY);

      if (saved) {
        setRouletteDeck(JSON.parse(saved));
      } else {
        setRouletteDeck([]);
      }
    } catch {
      setRouletteDeck([]);
    }
  }, [ROULETTE_DECK_KEY]);

  useEffect(() => {
    try {
      sessionStorage.setItem(
        ROULETTE_DECK_KEY,
        JSON.stringify(rouletteDeck)
      );
    } catch {}
  }, [rouletteDeck, ROULETTE_DECK_KEY]);
  // ----------------------- //

  const pool = useMemo(() => {
    if (manualMode === "all") return basePool;

    return basePool.filter(b => manualSelectedIds.includes(b.id));
  }, [basePool, manualMode, manualSelectedIds]);

  const poolSignature = useMemo(() => {
    return pool
      .map(b => b.id)
      .sort()
      .join("|");
  }, [pool]);

  // PERSISTENCIA DE RESULTADO ACTUAL
  const ROULETTE_UI_KEY = `pd3_library_roulette_ui_v1_${basePoolSignature}`;
  const [uiHydrated, setUiHydrated] = useState(false);
  
  useEffect(() => {
    if (!uiHydrated) return;

    try {
      sessionStorage.setItem(
        ROULETTE_UI_KEY,
        JSON.stringify({
          selectedId: selected?.id ?? null,
          rotation,
        })
      );
    } catch {}
  }, [selected, rotation, ROULETTE_UI_KEY, uiHydrated]);

  useEffect(() => {
    if (!pool.length) return;

    try {
      const saved = JSON.parse(sessionStorage.getItem(ROULETTE_UI_KEY));

      if (saved) {
        const { selectedId, rotation } = saved;

        const idx = pool.findIndex(b => b.id === selectedId);

        if (idx !== -1) {
          setSelected(pool[idx]);
          setSelectedIndex(idx);
          setRotation(rotation ?? 0);
        } else {
          setSelected(null);
          setSelectedIndex(null);
        }
      }

      setSpinning(false);
      setUiHydrated(true); // 👈 clave

    } catch {
      setUiHydrated(true);
    }
  }, [ROULETTE_UI_KEY, pool]);
  // ----------------------- //

  useEffect(() => {
    if (manualMode === "custom") {
      setManualSelectedIds(prev =>
        prev.filter(id => basePool.some(b => b.id === id))
      );
    }
  }, [basePool]);

  useEffect(() => {
    const ids = pool.map(b => b.id);

    if (!ids.length) {
      setRouletteDeck([]);
      return;
    }

    setRouletteDeck(shuffleArray(ids));

  }, [poolSignature]);


    function spin() {
    if (!pool.length) return;
    setSpinning(true);

    // =========================
    // DECK LOGIC (ex randomIndex)
    // =========================
    const validIds = pool.map(b => b.id);

    // deck actual
    let deck = Array.isArray(rouletteDeck) ? rouletteDeck : [];

    // eliminar builds que ya no estén en pool (por filtros)
    deck = deck.filter(id => validIds.includes(id));

    // si se vació, regenerar
    if (deck.length === 0) {
      deck = shuffleArray(validIds);
    }

    // siguiente id a consumir
    const nextId = deck[0];

    // persistir deck consumido
    setRouletteDeck(deck.slice(1));

    // encontrar índice real en pool
    const randomIndex = pool.findIndex(b => b.id === nextId);

    // fallback defensivo
    if (randomIndex === -1) {
      return;
    }
    // =========================

    const segmentAngle = 360 / pool.length;

    const centerAngle =
        randomIndex * segmentAngle + segmentAngle / 2;

    const spins = 4 + Math.floor(Math.random() * 3);

    setRotation(prev => {
        const normalizedPrev = prev % 360;

        const delta =
        spins * 360 +
        (360 - centerAngle - normalizedPrev);

        return prev + delta;
    });

    setSelectedIndex(randomIndex);

    setTimeout(() => {
        setSelected(pool[randomIndex]);
        setSpinning(false);
    }, 4000);
    }

    const [sortMode, setSortMode] = useState("alpha"); // "alpha" | "library"
    const sortedBasePool = useMemo(() => {
      if (!Array.isArray(basePool)) return [];

      if (sortMode === "library") {
        return [...basePool].sort((a, b) => {
          const slotA = a.slot ?? Infinity;
          const slotB = b.slot ?? Infinity;

          if (slotA !== slotB) return slotA - slotB;
          return a.name.localeCompare(b.name);
        });
      }

      return [...basePool].sort((a, b) => a.name.localeCompare(b.name));
    }, [basePool, sortMode]);

  if (loading) return <Spinner label={t('spinner.loading')} />;

  return (
    <div className={styles.page}>
        <div className={styles.wrapper}>

{!user && (
  <div className={styles.loginHint}>
    {t("home.library-roulette.desc.not-auth")}
  </div>
)}        
{user && (<>
        <Section>
          {/* HEADER (back + results) */}
          <div className={styles.backToExplorerAndPoolWrapper}>
            
            {fromExplorerSearch && (
              <div className={styles.backToExplorerWrapper}>
                <button
                  onClick={() => navigate(`/library-explorer${fromExplorerSearch}`)}
                  className={styles.backBtn}
                >
                  <IoChevronBackCircleSharp />
                </button>
                <span>{t('nav.back-to-explorer')}</span>
              </div>
            )}

            <div className={styles.poolHeader}>
              <div className={styles.resultsLength}>
                {pool.length} {t('library-roulette.msg.title1')}
                {pool.length !== 1 ? "s" : ""} {t('library-roulette.msg.title2')}
              </div>
            </div>

          </div>

          {/* FILTERS COMO BLOQUE SEPARADO */}
          <div className={styles.filters}>
            
            <button
              type="button"
              className={styles.filtersHeader}
              onClick={() => setFiltersOpen(prev => !prev)}
            >
              <span className={styles.filtersHeaderTitle}>
                {`${manualMode === "all" ? basePool.length : manualSelectedIds.length}/${basePool.length} ${t('library-roulette.msg.filter-some')}`}
              </span>

              <motion.span
                className={styles.chevron}
                animate={{ rotate: filtersOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <FaCircleChevronDown />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {filtersOpen && (
                <motion.div
                  className={styles.filtersContent}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  style={{ overflow: "hidden" }}
                >
                  <div className={styles.filterActions}>
                    <div className={styles.filterButtons}>
                      <button
                        type="button"
                        onClick={() => {
                          setManualMode("custom");
                          setManualSelectedIds(basePool.map((b) => b.id));
                        }}
                      >
                        {t('common.actions.select-all')}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setManualMode("custom");
                          setManualSelectedIds([]);
                        }}
                      >
                        {t('common.actions.deselect-all')}
                      </button>
                    </div>
                    <div>
                      <div
                        className={styles.sortToggle}
                        data-mode={sortMode}
                      >
                        <label className={styles.option}>
                          <input
                            type="radio"
                            name="sortMode"
                            value="alpha"
                            checked={sortMode === "alpha"}
                            onChange={() => setSortMode("alpha")}
                          />
                          <span>A-Z</span>
                        </label>

                        <label className={styles.option}>
                          <input
                            type="radio"
                            name="sortMode"
                            value="library"
                            checked={sortMode === "library"}
                            onChange={() => setSortMode("library")}
                          />
                          <span>Library</span>
                        </label>

                        <div className={styles.slider} />
                      </div>
                    </div>
                  </div>

{/* <div className={styles.sortToggle}>
  <button
    type="button"
    className={sortMode === "alpha" ? styles.activeSort : ""}
    onClick={() => setSortMode("alpha")}
  >
    A-Z
  </button>

  <button
    type="button"
    className={sortMode === "library" ? styles.activeSort : ""}
    onClick={() => setSortMode("library")}
  >
    Library
  </button>
</div> */}

                  <div className={styles.filterList}>
                    {
                    // [...basePool]
                    //   .sort((a, b) => a.name.localeCompare(b.name))
                    //   .map((b) => {
                      sortedBasePool.map((b) => {
                        const active =
                          manualMode === "all" ||
                          manualSelectedIds.includes(b.id);

                        return (
                          <label
                            key={b.id}
                            className={`${styles.toggleChip} ${active ? styles.on : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() => {
                                if (manualMode === "all") {
                                  setManualMode("custom");
                                  setManualSelectedIds(
                                    basePool
                                      .map((item) => item.id)
                                      .filter((id) => id !== b.id)
                                  );
                                  return;
                                }

                                setManualSelectedIds((prev) =>
                                  prev.includes(b.id)
                                    ? prev.filter((id) => id !== b.id)
                                    : [...prev, b.id]
                                );
                              }}
                            />
                            <span className={styles.indicator} />
                            <span className={styles.labelText}>
                              {sortMode === "library" && (
                                <span className={styles.slotBadge}>
                                  {b.slot !== null ? `${b.slot} · ` : ""}
                                </span>
                              )}
                              {b.name}
                            </span>
                          </label>
                        );
                      })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Section>

        <Section title={t('section.title.library-roulette')}>
        <div className={styles.rouletteSection}>
          <div className={styles.controlAndResult}>
              <div>
                  <button
                      className={`${styles.spinBtn} ${!pool.length ? styles.disabled : ""}`}
                      disabled={!pool.length || spinning}
                      onClick={spin}
                  >
                      {spinning ? t('library-roulette.label.spinning') : t('library-roulette.label.spin')}
                  </button>
              </div>

              <div className={styles.resultWrapper}>
                  {selected &&
                  <div className={styles.btnWrapper}>
                    <div>{t('library-explorer.actions.open')}</div>
                    <button 
                    className={styles.btn}
                    onClick={() => loadBuild(selected, {fromRoulette: location.search,})}
                    >
                      <IoMdOpen />
                    </button>
                  </div>
                  }
                  <div className={styles.result}>{selected?.name}</div>
              </div>
          </div>

            {uiHydrated && pool.length > 0 ? (
              <BuildWheel
                builds={pool}
                rotation={rotation}
                selectedIndex={selectedIndex}
              />
            ) : (
              !pool.length ? (
                <div className={styles.noSelectedBuilds}>
                  {t('library-roulette.msg.no-results')}
                </div>
              ) : (
              <Spinner label={t('spinner.loading')} />
            ))}
          
        </div>
        </Section>

</>)}
        <Section title={t('section.title.heist-dealer')}>
          <HeistDealer />
        </Section>

        </div>
    </div>
  );
}
