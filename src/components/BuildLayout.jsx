import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaCircleChevronDown } from "react-icons/fa6";
import styles from "./BuildLayout.module.scss";
import SlotMachineReel from "../randomizer/components/SlotMachineReel";
import WeaponCard from "../build/components/weapons/WeaponCard";
import LoadoutItemCard from "../build/components/loadout/LoadoutItemCard";
import WeaponSprite from "../build/components/weapons/WeaponSprite";
import OverkillSprite from "../build/components/loadout/OverkillSprite";
import ArmorSprite from "../build/components/loadout/ArmorSprite";
import DeployableSprite from "../build/components/loadout/DeployableSprite";
import ThrowableSprite from "../build/components/loadout/ThrowableSprite";
import ToolSprite from "../build/components/loadout/ToolSprite";

import { normalizeLoadoutData } from "../build/utils/loadout.utils";
import { buildWeaponTypeLabels, getWeaponTypeLabel, orderWeaponTypes } from "../build/utils/weaponTypeLabels";
import loadoutData from "../data/payday3_loadout_items.json";
import platesData from "../data/payday3_armor_plates.json";
import { heists } from "../data/heists";

import { getArmorMaxPlates, buildEmptyPlateSlots } from "../build/utils/armor.utils";
import ArmorPlatesPreview from "../build/components/loadout/ArmorPlatesPreview";

// ==============================
// Utils
// ==============================

function randomFromArray(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function BuildLayout() {
  const loadoutNormalized = useMemo(
    () => normalizeLoadoutData(loadoutData),
    []
  );

  const { primary, secondary, armors } = loadoutNormalized;

  const [build, setBuild] = useState({
    version: 1,
    loadout: {
      primary: null,
      secondary: null,
      overkill: null,
      armor: { key: null, plates: [] },
      throwable: null,
      deployable: null,
      tool: null,
      heist: null,
    },
  });

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
    if (!activeSpin) return;

    const { slot, resolve } = activeSpin;

    applyResult(slot, result);

    setActiveSpin(null);

    resolve?.(); // si venía de randomizeFullSequential
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

  const heistValue = build.loadout.heist;

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
    // const order = [
    //   "primary",
    //   "secondary",
    //   "overkill",
    //   "armor",
    //   "throwable",
    //   "deployable",
    //   "tool",
    //   "heist",
    // ];
    const order = [
      "tool",
      "deployable",
      "throwable",
      "armor",
      "overkill",
      "secondary",
      "primary",
      "heist",
    ];

    for (const slot of order) {
      await new Promise(res => spinSlot(slot, res));
    }
  }

  function spinSlot(slot, resolve) {
    let items = [];
    let SpriteComponent = null;

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
      case "heist":
        items = heists.map(h => ({ key: h, name: h })); // sin sprite
        SpriteComponent = null;
        break;
      default:
        break;
    }

    if (!items || items.length === 0) {
      resolve?.();
      return;
    }

    setActiveSpin({ slot, items, SpriteComponent, resolve });
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

      case "heist":
        next.heist = result.key;
        break;
    }

    return { ...prev, loadout: next };
  });
}


  // ==============================
  // RENDER
  // ==============================

  return (
  <div className={styles.page}>
    <div className={styles.wrapper}>
      <button
        className={styles.primaryButton}
        onClick={randomizeFullSequential}
      >
        RANDOMIZE COMPLETE BUILD
      </button>

      <div className={styles.weaponFilters}>

      {/* HEADER COLAPSABLE */}
      <button
        type="button"
        className={styles.filtersHeader}
        onClick={() => setFiltersOpen(prev => !prev)}
      >
        <span className={styles.filtersHeaderTitle}>Filter Weapon Types</span>
        <motion.span
          className={styles.chevron}
          animate={{ rotate: filtersOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <FaCircleChevronDown/>
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
            Primary Types ({primaryTypes.length})
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
            Secondary Types ({secondaryTypes.length})
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


      <div className={styles.grid}>

        <div className={`${styles.cell} ${styles.primary}`}>
          <WeaponCard
          slot="primary"
          weaponDef={primaryWeaponDef}
          onClick={() => spinSlot("primary")}
          showWeaponMods={false}
          isSpinning={activeSpin?.slot === "primary"}
          spinningLabel="RANDOMIZING..."
          spriteOverlay={
            activeSpin?.slot === "primary" && (
              <SlotMachineReel
                items={activeSpin.items}
                SpriteComponent={activeSpin.SpriteComponent}
                onFinish={handleSpinFinish}
              />
            )
          }
        />
        </div>

        {/* SECONDARY */}
        <div className={`${styles.cell} ${styles.secondary}`}>
          <WeaponCard
            slot="secondary"
            weaponDef={secondaryWeaponDef}
            onClick={() => spinSlot("secondary")}
            showWeaponMods={false}
            isSpinning={activeSpin?.slot === "secondary"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "secondary" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={activeSpin.SpriteComponent}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* OVERKILL */}
        <div className={`${styles.cell} ${styles.overkill}`}>
          <LoadoutItemCard
            slot="overkill"
            itemDef={overkillDef}
            SpriteComponent={OverkillSprite}
            onClick={() => spinSlot("overkill")}
            isSpinning={activeSpin?.slot === "overkill"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "overkill" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={activeSpin.SpriteComponent}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* ARMOR */}
        <div className={`${styles.cell} ${styles.armor}`}>
          <LoadoutItemCard
            slot="armor"
            itemDef={armorDef}
            SpriteComponent={ArmorSprite}
            onClick={() => spinSlot("armor")}
            isSpinning={activeSpin?.slot === "armor"}
            spinningLabel="RANDOMIZING..."
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
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* THROWABLE */}
        <div className={`${styles.cell} ${styles.throwable}`}>
          <LoadoutItemCard
            slot="throwable"
            itemDef={throwableDef}
            SpriteComponent={ThrowableSprite}
            onClick={() => spinSlot("throwable")}
            isSpinning={activeSpin?.slot === "throwable"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "throwable" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={activeSpin.SpriteComponent}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* DEPLOYABLE */}
        <div className={`${styles.cell} ${styles.deployable}`}>
          <LoadoutItemCard
            slot="deployable"
            itemDef={deployableDef}
            SpriteComponent={DeployableSprite}
            onClick={() => spinSlot("deployable")}
            isSpinning={activeSpin?.slot === "deployable"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "deployable" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={activeSpin.SpriteComponent}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* TOOL */}
        <div className={`${styles.cell} ${styles.tool}`}>
          <LoadoutItemCard
            slot="tool"
            itemDef={toolDef}
            SpriteComponent={ToolSprite}
            onClick={() => spinSlot("tool")}
            isSpinning={activeSpin?.slot === "tool"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "tool" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={activeSpin.SpriteComponent}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

        {/* HEIST */}
        <div className={`${styles.cell} ${styles.heist}`}>
          <LoadoutItemCard
            slot="heist"
            itemDef={
              heistValue
                ? { name: heistValue, key: heistValue }
                : null
            }
            SpriteComponent={null}
            onClick={() => spinSlot("heist")}
            isSpinning={activeSpin?.slot === "heist"}
            spinningLabel="RANDOMIZING..."
            spriteOverlay={
              activeSpin?.slot === "heist" && (
                <SlotMachineReel
                  items={activeSpin.items}
                  SpriteComponent={null}
                  onFinish={handleSpinFinish}
                />
              )
            }
          />
        </div>

      </div>
    </div>
</div>
  );
}
