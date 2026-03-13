import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import HeistSprite from "../build/components/loadout/HeistSprite";
import { heists } from "../data/heists";
import styles from "./HeistDealer.module.scss";
import { FaCircleChevronDown } from "react-icons/fa6";

// ==============================
// utils (reutilizados del Randomizer)
// ==============================

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeck(items) {
  return shuffleArray(items.map(it => it.key));
}

// ==============================
// storage keys
// ==============================

const HEIST_DECK_KEY = "pd3_heist_deck_v1";
const HEIST_RESULT_KEY = "pd3_heist_result_v1";
const HEIST_FILTER_KEY = "pd3_heist_filters_v1";

export default function HeistDealer() {
  const { t } = useTranslation();

  const [deckShake, setDeckShake] = useState(false);

  // ==============================
  // heist definitions
  // ==============================

  const ALL_HEISTS = useMemo(
    () => heists.map(h => ({ key: h, name: h })),
    []
  );

  // ==============================
  // filters
  // ==============================

  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeHeists, setActiveHeists] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HEIST_FILTER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return ALL_HEISTS.map(h => h.key);
  });

  useEffect(() => {
    sessionStorage.setItem(
      HEIST_FILTER_KEY,
      JSON.stringify(activeHeists)
    );
  }, [activeHeists]);

  const filteredHeists = useMemo(() => {
    return ALL_HEISTS.filter(h => activeHeists.includes(h.key));
  }, [ALL_HEISTS, activeHeists]);

  // ==============================
  // deck
  // ==============================

  const [deck, setDeck] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HEIST_DECK_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return buildDeck(ALL_HEISTS);
  });

  useEffect(() => {
    sessionStorage.setItem(HEIST_DECK_KEY, JSON.stringify(deck));
  }, [deck]);

  // limpiar deck cuando cambian filtros
  useEffect(() => {
    setDeck(prev => {
      const validKeys = filteredHeists.map(h => h.key);

      const cleaned = prev.filter(k => validKeys.includes(k));

      if (cleaned.length === 0) {
        return buildDeck(filteredHeists);
      }

      return cleaned;
    });
  }, [filteredHeists]);

  // ==============================
  // result
  // ==============================

  const [result, setResult] = useState(() => {
    try {
      const saved = sessionStorage.getItem(HEIST_RESULT_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });

  useEffect(() => {
    sessionStorage.setItem(
      HEIST_RESULT_KEY,
      JSON.stringify(result)
    );
  }, [result]);

  const [isDealing, setIsDealing] = useState(false);

  // ==============================
  // deal logic
  // ==============================

  function dealHeist() {
    if (isDealing) return;
    if (!filteredHeists.length) return;

    let nextDeck = [...deck];

    if (nextDeck.length === 0) {
      nextDeck = buildDeck(filteredHeists);
    }

    const nextKey = nextDeck[0];

    setDeck(nextDeck.slice(1));

    setIsDealing(true);

    setDeckShake(true);
    setTimeout(() => setDeckShake(false), 300);

    setTimeout(() => {
      setResult(nextKey);
      setIsDealing(false);
    }, 900);
  }

  const heistDef = result
    ? { key: result, name: result }
    : null;

    // ==============================
    // reset
    // ==============================
    function resetHeistDealer() {

    sessionStorage.removeItem(HEIST_DECK_KEY);
    sessionStorage.removeItem(HEIST_RESULT_KEY);
    sessionStorage.removeItem(HEIST_FILTER_KEY);

    setDeck(buildDeck(ALL_HEISTS));

    setResult(null);

    setActiveHeists(ALL_HEISTS.map(h => h.key));
    }



  // ==============================
  // render
  // ==============================

  return (
    <div className={styles.wrapper}>

    <div className={styles.buttonsWrapper}>
        <button
            className={styles.dealButton}
            onClick={dealHeist}
        >
            {t("heistDealer.actions.deal")}
        </button>

        <button
            className={styles.secondaryButton}
            onClick={resetHeistDealer}
            >
            {t('common.actions.reset')}
        </button>
    </div>

    {/* HEIST FILTERS */}
        <div className={styles.filters}>
        
        {/* HEADER COLAPSABLE */}
            <button
                type="button"
                className={styles.filtersHeader}
                onClick={() => setFiltersOpen(prev => !prev)}
            >
                <span className={styles.filtersHeaderTitle}>
                {t('heistDealer.actions.filter')}
                </span>

                <motion.span
                className={styles.chevron}
                animate={{ rotate: filtersOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                >
                <FaCircleChevronDown />
                </motion.span>
            </button>

            <AnimatePresence>
                {filtersOpen && (
                <motion.div
                    className={styles.filtersContent}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    style={{ overflow: "hidden" }}
                >

                    {/* SELECT / DESELECT */}
                    <div className={styles.filterActions}>
                    <button
                        type="button"
                        onClick={() =>
                        setActiveHeists(ALL_HEISTS.map(h => h.key))
                        }
                    >
                        {t('common.actions.select-all')}
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveHeists([])}
                    >
                        {t('common.actions.deselect-all')}
                    </button>
                    </div>

                    {/* HEIST LIST */}
                    <div className={styles.filterList}>
                    {ALL_HEISTS.map(h => {
                        const active = activeHeists.includes(h.key);

                        return (
                        <label
                            key={h.key}
                            className={`${styles.toggleChip} ${active ? styles.on : ""}`}
                        >
                            <input
                            type="checkbox"
                            checked={active}
                            onChange={() =>
                                setActiveHeists(prev =>
                                prev.includes(h.key)
                                    ? prev.filter(k => k !== h.key)
                                    : [...prev, h.key]
                                )
                            }
                            />
                            <span className={styles.indicator} />
                            <span className={styles.labelText}>
                            {h.name}
                            </span>
                        </label>
                        );
                    })}
                    </div>
                </motion.div>
                )}
            </AnimatePresence>
        </div>

        <div className={styles.deckArea}>
            <motion.div
                className={styles.deck}
                animate={deckShake ? { rotate: [0, -3, 3, 0] } : {}}
                transition={{ duration: 0.25 }}>
                <div className={styles.deckCard} />
                <div className={styles.deckCard} />
                <div className={styles.deckCardTop} onClick={dealHeist}/>
            </motion.div>
        </div>
        
        <div className={styles.cardArea}>
            <AnimatePresence mode="wait">
                {isDealing ? (
                    <motion.div
                    key="dealing"
                    className={styles.cardBack}
                    initial={{
                        y: -160,
                        scale: 0.9,
                        rotate: -4,
                        opacity: 0
                    }}
                    animate={{
                        y: 0,
                        scale: 1,
                        rotate: 0,
                        opacity: 1
                    }}
                    exit={{
                        rotateY: 90,
                        opacity: 0
                    }}
                    transition={{
                        y: { type: "spring", stiffness: 160, damping: 16 },
                        scale: { duration: 0.25 },
                        rotate: { duration: 0.25 }
                    }}
                    />
                ) : (
                    <motion.div
                    key={heistDef?.key ?? "empty"}
                    className={styles.card}
                    initial={{ rotateY: 90, scale: 0.9, opacity: 0 }}
                    animate={{ rotateY: 0, scale: 1, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    >
                    <HeistSprite itemDef={heistDef} height="85%" />

                    <div className={styles.heistName}>
                        {heistDef?.name ?? t('heistDealer.label.deal')}
                    </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    </div>
  );
}