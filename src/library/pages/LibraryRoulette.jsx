import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/useAuth";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./LibraryRoulette.module.scss";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { IoMdOpen } from "react-icons/io";
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

const ROULETTE_DECK_KEY = "pd3_library_roulette_deck_v1";

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
  const [fromExplorerSearch] = useState(() => location.state?.fromExplorer ?? null);
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [manualMode, setManualMode] = useState("all");
  const [manualSelectedIds, setManualSelectedIds] = useState([]);

  const [rouletteDeck, setRouletteDeck] = useState(() => {
    try {
      const saved = sessionStorage.getItem(ROULETTE_DECK_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

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

  useEffect(() => {
    if (manualMode === "custom") {
      setManualSelectedIds(prev =>
        prev.filter(id => basePool.some(b => b.id === id))
      );
    }
  }, [basePool]);


  useEffect(() => {
    try {
      sessionStorage.setItem(
        ROULETTE_DECK_KEY,
        JSON.stringify(rouletteDeck)
      );
    } catch {}
  }, [rouletteDeck]);

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
          <div className={styles.backToExplorerAndPoolWrapper}>
            {fromExplorerSearch && (
              <div className={styles.backToExplorerWrapper}>
                <button
                  onClick={() => navigate(`/library-explorer${location.search}`)}
                  className={styles.backBtn}
                >
                  <IoChevronBackCircleSharp />
                </button>
                <span>{t('nav.back-to-explorer')}</span>
              </div>
            )}

            <div className={styles.poolHeader}>
              <div className={styles.resultsLength}>
                {pool.length} {t('library-roulette.msg.title1')}{pool.length !== 1 ? "s" : ""} {t('library-roulette.msg.title2')}
              </div>

              <div className={styles.switchWrapper}>
                <span className={styles.switchLabel}>
                  {manualMode === "all"
                    ? t('library-roulette.msg.filter-all')
                    : `${manualSelectedIds.length}/${basePool.length} ${t('library-roulette.msg.filter-some')}`}
                </span>

                <button
                  type="button"
                  className={`${styles.switch} ${
                    manualMode === "custom" ? styles.active : ""
                  }`}
                  onClick={() => {
                    if (manualMode === "all") {
                      // pasar a manual
                      const ids = basePool.map((b) => b.id);
                      setManualSelectedIds((prev) => (prev.length ? prev : ids));
                      setManualMode("custom");
                    } else {
                      // volver a all
                      setManualMode("all");
                    }
                  }}
                >
                  <span className={styles.thumb} />
                </button>
              </div>
            </div>
          </div>

          {/* EXPANSIÓN CONTROLADA SOLO POR manualMode */}
          <AnimatePresence initial={false}>
            {manualMode === "custom" && (
              <motion.div
                key="manual-panel"
                className={styles.manualPanel}
                initial={{ opacity: 0, y: -8, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -8, height: 0 }}
                transition={{
                  opacity: { duration: 0.18, ease: "easeOut" },
                  y: { duration: 0.18, ease: "easeOut" },
                  height: { duration: 0.25, ease: "easeOut" },
                }}
                style={{ overflow: "hidden" }}
              >
                <div className={styles.manualActions}>
                  <button
                    type="button"
                    onClick={() => setManualSelectedIds(basePool.map((b) => b.id))}
                  >
                    {t('common.actions.select-all')}
                  </button>

                  <button type="button" onClick={() => setManualSelectedIds([])}>
                    {t('common.actions.deselect-all')}
                  </button>
                </div>

                <div className={styles.manualList}>
                  {[...basePool]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((b) => {
                    const active = manualSelectedIds.includes(b.id);

                    return (
                      <label
                        key={b.id}
                        className={`${styles.toggleChip} ${active ? styles.on : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() =>
                            setManualSelectedIds((prev) =>
                              prev.includes(b.id)
                                ? prev.filter((id) => id !== b.id)
                                : [...prev, b.id]
                            )
                          }
                        />
                        <span className={styles.indicator} />
                        <span className={styles.labelText}>{b.name}</span>
                      </label>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Section>

        <Section title={t('section.title.library-roulette')}>
        <div className={styles.rouletteSection}>
          <div className={styles.controlAndResult}>
              <div>
                  <button
                      className={styles.spinBtn}
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
                    onClick={() => loadBuild(selected, {fromExplorer: location.search,})}
                    >
                      <IoMdOpen />
                    </button>
                  </div>
                  }
                  <div className={styles.result}>{selected?.name}</div>
              </div>
          </div>
          
          <BuildWheel
              builds={pool}
              rotation={rotation}
              selectedIndex={selectedIndex}
          />
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
