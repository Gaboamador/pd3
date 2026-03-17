import { useMemo, useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { FaCircleChevronDown } from "react-icons/fa6";
import styles from "./Randomizer.module.scss";
import Section from "../build/components/common/Section";
import SlotMachineReel from "./components/SlotMachineReel";
import WeaponCard from "../build/components/weapons/WeaponCard";
import LoadoutItemCard from "../build/components/loadout/LoadoutItemCard";
import WeaponSprite from "../build/components/weapons/WeaponSprite";
import OverkillSprite from "../build/components/loadout/OverkillSprite";
import ArmorSprite from "../build/components/loadout/ArmorSprite";
import DeployableSprite from "../build/components/loadout/DeployableSprite";
import ThrowableSprite from "../build/components/loadout/ThrowableSprite";
import ToolSprite from "../build/components/loadout/ToolSprite";
import HeistDealer from "../heistDealer/HeistDealer";
import TreeSprite from "../build/components/skills/TreeSprite";

import { normalizeLoadoutData } from "../build/utils/loadout.utils";
import { buildWeaponTypeLabels, getWeaponTypeLabel, orderWeaponTypes } from "../build/utils/weaponTypeLabels";
import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";
import skillGroupsData from "../data/payday3_skill_groups.json";

import { getArmorMaxPlates, buildEmptyPlateSlots } from "../build/utils/armor.utils";
import { buildTreePool } from "./utils/buildTreePool";
import ArmorPlatesPreview from "../build/components/loadout/ArmorPlatesPreview";

// ==============================
// Utils
// ==============================

function randomFromArray(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildDeckFromItems(items) {
  // deck = lista de keys en orden random
  // items acá son objetos { key, ... }
  return shuffleArray(items.map(it => it.key));
}


const RANDOMIZER_SESSION_KEY = "pd3_randomizer_build_v1";
const RANDOMIZER_DECKS_KEY = "pd3_randomizer_decks_v1";

export default function Randomizer() {
  const { t } = useTranslation();
  const heistDealerRef = useRef(null);
  const loadoutNormalized = useMemo(
    () => normalizeLoadoutData(loadoutData),
    []
  );

  const { primary, secondary, armors } = loadoutNormalized;

  const { primary: primaryTrees, secondary: secondaryTrees } = useMemo(
    () => buildTreePool(skillGroupsData),
    []
  );

  const [build, setBuild] = useState(() => {
  try {
    const saved = sessionStorage.getItem(RANDOMIZER_SESSION_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {}

  return {
    version: 1,
    loadout: {
      primary: null,
      secondary: null,
      overkill: null,
      armor: { key: null, plates: [] },
      throwable: null,
      deployable: null,
      tool: null,
    },
      trees: [null, null, null, null],
    };
  });

  const [randomTrees, setRandomTrees] = useState(() => {
    try {
      const saved = sessionStorage.getItem(RANDOMIZER_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.trees ?? [null, null, null, null];
      }
    } catch {}
    return [null, null, null, null];
  });

  useEffect(() => {
    try {
      if (build?.loadout) {
        sessionStorage.setItem(
          RANDOMIZER_SESSION_KEY,
          JSON.stringify(build)
        );
      }
    } catch (e) {
      console.error("Randomizer persistence error:", e);
    }
  }, [build]);

  const [decksBySlot, setDecksBySlot] = useState(() => {
    try {
      const saved = sessionStorage.getItem(RANDOMIZER_DECKS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {}; // { [slot]: [key1, key2, ...] }
  });

  useEffect(() => {
    try {
      sessionStorage.setItem(RANDOMIZER_DECKS_KEY, JSON.stringify(decksBySlot));
    } catch (e) {
      console.error("Randomizer decks persistence error:", e);
    }
  }, [decksBySlot]);

  const ALL_PRIMARY_TYPES = Object.keys(primary);
  const ALL_SECONDARY_TYPES = Object.keys(secondary);

  const [primaryTypes, setPrimaryTypes] = useState(ALL_PRIMARY_TYPES);
  const [secondaryTypes, setSecondaryTypes] = useState(ALL_SECONDARY_TYPES);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [activeSpin, setActiveSpin] = useState(null);

  const orderedPrimaryTypes = useMemo(
    () => orderWeaponTypes(ALL_PRIMARY_TYPES),
    []
  );
  const orderedSecondaryTypes = useMemo(
    () => orderWeaponTypes(ALL_SECONDARY_TYPES),
    []
  );
  const primaryLabelsMap = useMemo(
    () => buildWeaponTypeLabels(orderedPrimaryTypes),
    [orderedPrimaryTypes]
  );
  const secondaryLabelsMap = useMemo(
    () => buildWeaponTypeLabels(orderedSecondaryTypes),
    [orderedSecondaryTypes]
  );

  function handleSpinFinish(result) {
    // usamos setActiveSpin functional para evitar estados stale
    setActiveSpin(prev => {
      if (!prev) return prev;

      const { slot, resolve, treeIndex } = prev;

    if (slot === "tree") {
      setRandomTrees(current => {
        const next = [...current];
        next[treeIndex] = result;
        
        setBuild(prev => ({
          ...prev,
          trees: next
        
        }));
        return next;
      });
    } else {
      applyResult(slot, result);
    }

    resolve?.();
    return null;
  });
  }

  // ==============================
  // RESOLVERS (idénticos al editor)
  // ==============================

  function findWeaponDef(itemsByType, weaponKey) {
    if (!weaponKey) return null;
    for (const weapons of Object.values(itemsByType)) {
      const found = weapons.find(w => w.key === weaponKey);
      if (found) return found;
    }
    return null;
  }

  function findItem(items, key) {
    return items.find(it => it.key === key) ?? null;
  }

  const primaryWeaponDef = useMemo(
    () => findWeaponDef(primary, build.loadout.primary?.weaponKey),
    [primary, build.loadout.primary?.weaponKey]
  );

  const secondaryWeaponDef = useMemo(
    () => findWeaponDef(secondary, build.loadout.secondary?.weaponKey),
    [secondary, build.loadout.secondary?.weaponKey]
  );

  const overkillDef = useMemo(
    () => findItem(loadoutNormalized.overkill, build.loadout.overkill),
    [loadoutNormalized.overkill, build.loadout.overkill]
  );

  const deployableDef = useMemo(
    () => findItem(loadoutNormalized.deployable, build.loadout.deployable),
    [loadoutNormalized.deployable, build.loadout.deployable]
  );

  const throwableDef = useMemo(
    () => findItem(loadoutNormalized.throwable, build.loadout.throwable),
    [loadoutNormalized.throwable, build.loadout.throwable]
  );

  const toolDef = useMemo(
    () => findItem(loadoutNormalized.tool, build.loadout.tool),
    [loadoutNormalized.tool, build.loadout.tool]
  );

  const armorDef = useMemo(
    () =>
      armors.find(a => a.key === build.loadout.armor?.key) ?? null,
    [armors, build.loadout.armor?.key]
  );

  const armorPlates = build.loadout.armor?.plates ?? [];
  const hasAnyPlateSelected = armorPlates.some(p => p != null);

  const filteredPrimaryWeapons = useMemo(() => {
  return Object.entries(primary)
    .filter(([type]) => primaryTypes.includes(type))
    .flatMap(([, weapons]) => weapons);
}, [primary, primaryTypes]);

const filteredSecondaryWeapons = useMemo(() => {
  return Object.entries(secondary)
    .filter(([type]) => secondaryTypes.includes(type))
    .flatMap(([, weapons]) => weapons);
}, [secondary, secondaryTypes]);


  // ==============================
  // RANDOMIZERS
  // ==============================

  async function randomizeFullSequential() {
    const order = [
      "tool",
      "deployable",
      "throwable",
      "armor",
      "overkill",
      "secondary",
      "primary",
    ];

    for (const slot of order) {
      await new Promise(res => spinSlot(slot, res));
    }
  }

    async function randomizeTreesSequential() {
      const primaryDeck = shuffleArray(primaryTrees);
      const secondaryDeck = shuffleArray(secondaryTrees);

      const selection = [
        primaryDeck[0],
        primaryDeck[1],
        primaryDeck[2],
        secondaryDeck[0],
      ];

      for (let i = 0; i < 4; i++) {
        await new Promise(res => {
          setActiveSpin({
            slot: "tree",
            items: i === 3 ? secondaryTrees : primaryTrees,
            SpriteComponent: TreeSprite,
            resolve: res,
            forcedKey: selection[i].key,
            treeIndex: i,
          });
        });
      }
    }

  function spinSlot(slot, resolve, treeIndex = null) {
    let items = [];
    let SpriteComponent = null;
    let deckKey = slot;

    switch (slot) {
      case "primary":
        items = filteredPrimaryWeapons;
        SpriteComponent = WeaponSprite;
        break;
      case "secondary":
        items = filteredSecondaryWeapons;
        SpriteComponent = WeaponSprite;
        break;
      case "overkill":
        items = loadoutNormalized.overkill;
        SpriteComponent = OverkillSprite;
        break;
      case "armor":
        items = armors;
        SpriteComponent = ArmorSprite;
        break;
      case "throwable":
        items = loadoutNormalized.throwable;
        SpriteComponent = ThrowableSprite;
        break;
      case "deployable":
        items = loadoutNormalized.deployable;
        SpriteComponent = DeployableSprite;
        break;
      case "tool":
        items = loadoutNormalized.tool;
        SpriteComponent = ToolSprite;
        break;
      case "tree":
      const isSecondarySlot = treeIndex === 3;
      const basePool = isSecondarySlot ? secondaryTrees : primaryTrees;
      const usedTreeKeys = randomTrees
        .filter(Boolean)
        .map(t => t.key);
        items = basePool.filter(it => !usedTreeKeys.includes(it.key));
        if (items.length === 0) {
          resolve?.();
          return;
        }
        SpriteComponent = TreeSprite;
        deckKey = isSecondarySlot ? "treeSecondary" : "treePrimary";
        break;

      default:
        break;
    }

    if (!items || items.length === 0) {
      resolve?.();
      return;
    }


    // ------------
    // DECK LOGIC (no repeat until pool is exhausted)
    // ------------
    const validKeys = items.map(it => it.key);

    // tomamos deck actual del slot
    // let deck = Array.isArray(decksBySlot[slot]) ? decksBySlot[slot] : [];
    let deck = Array.isArray(decksBySlot[deckKey]) ? decksBySlot[deckKey] : [];

    // filtramos keys que ya no existan (por filtros, etc.)
    deck = deck.filter(k => validKeys.includes(k));

    // si se vació, regeneramos deck nuevo desde items actuales
    if (deck.length === 0) {
      deck = buildDeckFromItems(items);
    }

    // elegimos el próximo key a consumir
    const nextKey = deck[0];

    // persistimos deck consumido (quitamos el primero)
    setDecksBySlot(prev => ({
      ...prev,
      [deckKey]: deck.slice(1),
    }));

    // buscamos el itemDef para ese key (el Reel necesita items, pero también necesitamos forzar el final)
    const forcedItem = items.find(it => it.key === nextKey) ?? null;

    // fallback ultra defensivo
    if (!forcedItem) {
      resolve?.();
      return;
    }

    setActiveSpin({
      slot,
      items,
      SpriteComponent,
      resolve,
      forcedKey: forcedItem.key,
      treeIndex,
    });

  }

function applyResult(slot, result) {
  setBuild(prev => {
    const next = { ...prev.loadout };

    switch (slot) {
      case "primary":
        next.primary = {
          weaponKey: result.key,
          preset: 0,
          mods: {},
        };
        break;

      case "secondary":
        next.secondary = {
          weaponKey: result.key,
          preset: 0,
          mods: {},
        };
        break;

      case "overkill":
        next.overkill = result.key;
        break;

      case "throwable":
        next.throwable = result.key;
        break;

      case "deployable":
        next.deployable = result.key;
        break;

      case "tool":
        next.tool = result.key;
        break;

      case "armor": {
        const maxPlates = getArmorMaxPlates(result);
        const plates = buildEmptyPlateSlots(maxPlates).map(
          () => randomFromArray(Object.keys(platesData))
        );
        next.armor = { key: result.key, plates };
        break;
      }
    }

    return { ...prev, loadout: next };
  });
}

  function resetRandomizer() {
    sessionStorage.removeItem(RANDOMIZER_SESSION_KEY);
    sessionStorage.removeItem(RANDOMIZER_DECKS_KEY);

    setDecksBySlot({});

    setRandomTrees([null, null, null, null]);

    setBuild({
      version: 1,
      loadout: {
        primary: null,
        secondary: null,
        overkill: null,
        armor: { key: null, plates: [] },
        throwable: null,
        deployable: null,
        tool: null,
      },
        trees: [null, null, null, null],
    });

    heistDealerRef.current?.reset();
  }

  function resetBuild() {
    setDecksBySlot(prev => {
      const next = { ...prev };

      delete next.primary;
      delete next.secondary;
      delete next.overkill;
      delete next.armor;
      delete next.throwable;
      delete next.deployable;
      delete next.tool;

      return next;
    });

    setBuild(prev => ({
      ...prev,
      loadout: {
        primary: null,
        secondary: null,
        overkill: null,
        armor: { key: null, plates: [] },
        throwable: null,
        deployable: null,
        tool: null,
      }
    }));
  }

    function resetTrees() {    
      setRandomTrees([null, null, null, null]);

      setBuild(prev => ({
        ...prev,
        trees: [null, null, null, null]
      }));

      setDecksBySlot(prev => {
        const next = { ...prev };
        delete next.treePrimary;
        delete next.treeSecondary;
        return next;
      });
    }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className={styles.page}>
      <div className={styles.wrapper}>

        <Section>
          <div className={styles.buttonsWrapper}>
            <button
              className={styles.resetRandomizerBtn}
              onClick={resetRandomizer}
            >
              {t('randomizer.actions.reset-randomizer')}
            </button>
          </div>
        </Section>

        <Section title={t('section.title.randomize-build')}>
          <div className={styles.weaponFilters}>

            {/* HEADER COLAPSABLE */}
            <button
              type="button"
              className={styles.filtersHeader}
              onClick={() => setFiltersOpen(prev => !prev)}
            >
              <span className={styles.filtersHeaderTitle}>{t('randomizer.label.filter')}</span>
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
                  {/* PRIMARY */}
                  <div className={styles.filterGroup}>
                    <div className={styles.filterTitle}>
                      {t('randomizer.label.filter.primary')} ({primaryTypes.length})
                    </div>

                    <div className={styles.filterList}>
                      {ALL_PRIMARY_TYPES.map(type => {
                        const active = primaryTypes.includes(type);

                        return (
                          <label
                            key={type}
                            className={`${styles.toggleChip} ${active ? styles.on : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() =>
                                setPrimaryTypes(prev =>
                                  prev.includes(type)
                                    ? prev.filter(t => t !== type)
                                    : [...prev, type]
                                )
                              }
                            />
                            <span className={styles.indicator} />
                            <span className={styles.labelText}>
                              {getWeaponTypeLabel(type, primaryLabelsMap)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* SECONDARY */}
                  <div className={styles.filterGroup}>
                    <div className={styles.filterTitle}>
                      {t('randomizer.label.filter.secondary')} ({secondaryTypes.length})
                    </div>

                    <div className={styles.filterList}>
                      {ALL_SECONDARY_TYPES.map(type => {
                        const active = secondaryTypes.includes(type);

                        return (
                          <label
                            key={type}
                            className={`${styles.toggleChip} ${active ? styles.on : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={active}
                              onChange={() =>
                                setSecondaryTypes(prev =>
                                  prev.includes(type)
                                    ? prev.filter(t => t !== type)
                                    : [...prev, type]
                                )
                              }
                            />
                            <span className={styles.indicator} />
                            <span className={styles.labelText}>
                              {getWeaponTypeLabel(type, secondaryLabelsMap)}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>


          <div className={styles.buttonsWrapper}>
            <button
              className={styles.primaryButton}
              onClick={randomizeFullSequential}
            >
              {t('randomizer.actions.randomize')}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={resetBuild}
            >
              {t('common.actions.reset')}
            </button>
          </div>

          <div className={styles.grid}>
            <div className={`${styles.cell} ${styles.primary}`}>
              <WeaponCard
                use='randomizer'
                slot="primary"
                weaponDef={primaryWeaponDef}
                onClick={() => spinSlot("primary")}
                showWeaponMods={false}
                isSpinning={activeSpin?.slot === "primary"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "primary" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* SECONDARY */}
            <div className={`${styles.cell} ${styles.secondary}`}>
              <WeaponCard
                use='randomizer'
                slot="secondary"
                weaponDef={secondaryWeaponDef}
                onClick={() => spinSlot("secondary")}
                showWeaponMods={false}
                isSpinning={activeSpin?.slot === "secondary"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "secondary" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* OVERKILL */}
            <div className={`${styles.cell} ${styles.overkill}`}>
              <LoadoutItemCard
                use='randomizer'
                slot="overkill"
                itemDef={overkillDef}
                SpriteComponent={OverkillSprite}
                onClick={() => spinSlot("overkill")}
                isSpinning={activeSpin?.slot === "overkill"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "overkill" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* ARMOR */}
            <div className={`${styles.cell} ${styles.armor}`}>
              <LoadoutItemCard
                use='randomizer'
                slot="armor"
                itemDef={armorDef}
                SpriteComponent={ArmorSprite}
                onClick={() => spinSlot("armor")}
                isSpinning={activeSpin?.slot === "armor"}
                spinningLabel={t('randomizer.label.randomizing')}
                headerExtra={
                  hasAnyPlateSelected ? (
                    <ArmorPlatesPreview
                      plates={armorPlates}
                      platesData={platesData}
                    />
                  ) : null
                }
                spriteOverlay={
                  activeSpin?.slot === "armor" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* THROWABLE */}
            <div className={`${styles.cell} ${styles.throwable}`}>
              <LoadoutItemCard
                use='randomizer'
                slot="throwable"
                itemDef={throwableDef}
                SpriteComponent={ThrowableSprite}
                onClick={() => spinSlot("throwable")}
                isSpinning={activeSpin?.slot === "throwable"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "throwable" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* DEPLOYABLE */}
            <div className={`${styles.cell} ${styles.deployable}`}>
              <LoadoutItemCard
                use='randomizer'
                slot="deployable"
                itemDef={deployableDef}
                SpriteComponent={DeployableSprite}
                onClick={() => spinSlot("deployable")}
                isSpinning={activeSpin?.slot === "deployable"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "deployable" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>

            {/* TOOL */}
            <div className={`${styles.cell} ${styles.tool}`}>
              <LoadoutItemCard
                use='randomizer'
                slot="tool"
                itemDef={toolDef}
                SpriteComponent={ToolSprite}
                onClick={() => spinSlot("tool")}
                isSpinning={activeSpin?.slot === "tool"}
                spinningLabel={t('randomizer.label.randomizing')}
                spriteOverlay={
                  activeSpin?.slot === "tool" && (
                    <SlotMachineReel
                      items={activeSpin.items}
                      SpriteComponent={activeSpin.SpriteComponent}
                      forcedKey={activeSpin.forcedKey}
                      onFinish={handleSpinFinish}
                    />
                  )
                }
              />
            </div>
          </div>
        </Section>

        {/* SKILL TREES */}
        <Section title={t('section.title.randomize-tree')}>

          <div className={styles.buttonsWrapper}>
            <button
              className={styles.primaryButton}
              onClick={randomizeTreesSequential}
            >
              {t('randomizer.actions.randomize')}
            </button>
            <button
              className={styles.secondaryButton}
              onClick={resetTrees}
            >
              {t('common.actions.reset')}
            </button>
          </div>


          <div className={styles.treeGrid}>
            {[0, 1, 2, 3].map(index => {

              const tree = randomTrees[index];

              return (
                <LoadoutItemCard
                  key={index}
                  use="randomizer"
                  slot="tree"
                  itemDef={tree}
                  SpriteComponent={TreeSprite}
                  onClick={() => spinSlot("tree", null, index)}
                  isSpinning={
                    activeSpin?.slot === "tree" &&
                    activeSpin?.treeIndex === index
                  }
                  spinningLabel={t('randomizer.label.randomizing')}
                  spriteOverlay={
                    activeSpin?.slot === "tree" &&
                    activeSpin?.treeIndex === index && (
                      <SlotMachineReel
                        items={activeSpin.items}
                        SpriteComponent={activeSpin.SpriteComponent}
                        forcedKey={activeSpin.forcedKey}
                        onFinish={handleSpinFinish}
                      />
                    )
                  }
                />
              );
            })}
          </div>
        </Section>

        <Section title={t('section.title.heist-dealer')}>
          <HeistDealer ref={heistDealerRef}/>
        </Section>

      </div>
    </div>
  );
}
