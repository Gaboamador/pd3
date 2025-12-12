import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useBuildGenerator } from "../hooks/useBuildGenerator.js";
import CategoryCard from "./CategoryCard.jsx";
import ConfettiBurst from "./ConfettiBurst.jsx";
import HudNotification from "./HudNotification.jsx";
import ConfirmDialog from "./ConfirmDialog.jsx";
import ArmorValue from "./ArmorValue.jsx";
import styles from "../styles/BuildLayout.module.scss";
import { armorPlateCount } from "../data/armor.js";
import { GiShoulderArmor } from "react-icons/gi";

function BuildLayout() {
  const { build, generateFullBuild, rerollField, resetBuild } = useBuildGenerator();
const [collapsePrimaryFilters, setCollapsePrimaryFilters] = useState(false);
const [collapseSecondaryFilters, setCollapseSecondaryFilters] = useState(false);
const [confettiTrigger, setConfettiTrigger] = useState(0);
const [hudVisible, setHudVisible] = useState(false);
const randomizeBtnRef = useRef(null);
const [confettiOrigin, setConfettiOrigin] = useState({ x: 0, y: 0 });
const [confirmResetOpen, setConfirmResetOpen] = useState(false);
const [confirmRandomOpen, setConfirmRandomOpen] = useState(false);
const [editPanelOpen, setEditPanelOpen] = useState(false);


const initialCardCollapse = {
  primary: false,
  secondary: false,
  overkill: false,
  armor: false,
  throwable: false,
  deployable: false,
  tool: false,
  heist: false
};

const [cardCollapse, setCardCollapse] = useState(initialCardCollapse);


// Tipos disponibles
const ALL_PRIMARY_TYPES = ["Assault Rifle","LMG","Marksman Rifle","Shotgun","SMG"];
const ALL_SECONDARY_TYPES = ["Pistol","Revolver","Shotgun"];

// CARGA INICIAL ANTES DEL PRIMER RENDER
const [primaryTypes, setPrimaryTypes] = useState(() => {
  const saved = sessionStorage.getItem("pd3-primary-types");
  return saved ? JSON.parse(saved) : ALL_PRIMARY_TYPES;
});

const [secondaryTypes, setSecondaryTypes] = useState(() => {
  const saved = sessionStorage.getItem("pd3-secondary-types");
  return saved ? JSON.parse(saved) : ALL_SECONDARY_TYPES;
});


useEffect(() => {
  sessionStorage.setItem("pd3-primary-types", JSON.stringify(primaryTypes));
}, [primaryTypes]);

useEffect(() => {
  sessionStorage.setItem("pd3-secondary-types", JSON.stringify(secondaryTypes));
}, [secondaryTypes]);


function setAllCardsCollapsed(collapse) {
  setCardCollapse(() => {
    const updated = {};
    for (const key in initialCardCollapse) {
      updated[key] = collapse;
    }
    return updated;
  });
}

function toggleWeaponFilters() {
  const allCollapsed = collapsePrimaryFilters && collapseSecondaryFilters;
  const newState = !allCollapsed;   // si estaban todos colapsados → expandir, si no → colapsar
  setCollapsePrimaryFilters(newState);
  setCollapseSecondaryFilters(newState);
}

function toggleAllCards() {
  const values = Object.values(cardCollapse);
  const allCollapsed = values.every(v => v === true);
  const newState = !allCollapsed;

  setCardCollapse(Object.fromEntries(
    Object.keys(cardCollapse).map(key => [key, newState])
  ));
}


function toggleAllWeaponFilters(collapse) {
  setCollapsePrimaryFilters(collapse);
  setCollapseSecondaryFilters(collapse);
}

function togglePrimaryType(type) {
  setPrimaryTypes(t =>
    t.includes(type) ? t.filter(x => x !== type) : [...t, type]
  );
}

function toggleSecondaryType(type) {
  setSecondaryTypes(t =>
    t.includes(type) ? t.filter(x => x !== type) : [...t, type]
  );
}

  const categories = [
    { key: "primary", label: "Primary Weapon" },
    { key: "secondary", label: "Secondary Weapon" },
    { key: "overkill", label: "Overkill" },
    { key: "armor", label: "Armor Lining" },
    { key: "throwable", label: "Throwable" },
    { key: "deployable", label: "Deployable" },
    { key: "tool", label: "Tool" },
    { key: "heist", label: "Heist" }
  ];

  const plateAbbrev = {
  Impact: "Imp.",
  Resistant: "Resist.",
  Adaptive: "Adapt."
};


const getValueForKey = key => {
 if (key === "armor") {
  const type = build.armor.type?.trim();
  const plates = build.armor.plates;

  if (!type || !plates?.length) return "";

  return <ArmorValue type={type} plates={plates} />;
}

  if (key === "primary" || key === "secondary") {
    return build[key]?.name || "";
  }

  return build[key];
};


function triggerVisualFeedback() {
  if (randomizeBtnRef.current) {
    const rect = randomizeBtnRef.current.getBoundingClientRect();
    setConfettiOrigin({
      x: rect.left + rect.width / 2,   // centro horizontal del botón
      y: rect.top + rect.height / 2    // centro vertical del botón
    });
  }

  // Disparar confetti inmediatamente
  setConfettiTrigger(prev => prev + 1);

  // HUD notification después de animación de confetti
  setTimeout(() => {
    setHudVisible(true);
    setTimeout(() => setHudVisible(false), 1200);
  }, 650);
}


function isBuildEmpty(build) {
  return (
    !build.primary &&
    !build.secondary &&
    !build.overkill &&
    !build.throwable &&
    !build.deployable &&
    !build.tool &&
    !build.heist &&
    (!build.armor?.type || build.armor.type.trim() === "")
  );
}



  return (
    <div className={styles.page}>

              <ConfettiBurst trigger={confettiTrigger} origin={confettiOrigin} />
        <HudNotification visible={hudVisible} />

      <div className={styles.container}>

        <motion.div
          className={styles.actions}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.25 }}
        >
        
        <div className={styles.globalControls}>
          <button
            ref={randomizeBtnRef}
            type="button"
            className={styles.primaryButton}
            // onClick={() => setConfirmRandomOpen(true)}
            onClick={() => {
              if (isBuildEmpty(build)) {
                // No hay nada que sobrescribir → randomizar directamente
                triggerVisualFeedback();
                generateFullBuild({ primaryTypes, secondaryTypes });
              } else {
                // Hay datos → pedir confirmación
                setConfirmRandomOpen(true);
              }
            }}
          >
            Randomize Build
          </button>

          <button
            className={styles.secondaryButton}
            onClick={toggleAllCards}
          >
            {Object.values(cardCollapse).every(v => v) ? "Expand Items" : "Collapse Items"}
          </button>

          <button
            type="button"
            className={styles.resetButton}
            onClick={() => setConfirmResetOpen(true)}
          >
            Reset Build
          </button>
        </div>

        </motion.div>

      <div className={`${styles.globalControls} ${styles.weaponFilterPanel}`}>
        <button
          className={styles.secondaryButton}
          onClick={() => setEditPanelOpen(v => !v)}
        >
          Weapon Types {editPanelOpen ? "–" : "+"}
        </button>

        {editPanelOpen && (
        <div className={styles.weaponFilters}>
          <div className={styles.weaponTypeContainer}>
              <h4 onClick={() => setCollapsePrimaryFilters(v => !v)} className={styles.collapsibleTitle}>
                  Primary Weapons
              </h4>
              {!collapsePrimaryFilters && (
              <div className={styles.filterBlock}>
                  {ALL_PRIMARY_TYPES.map(type => (
                  <label key={type}>
                      <input
                      type="checkbox"
                      checked={primaryTypes.includes(type)}
                      onChange={() => togglePrimaryType(type)}
                      />
                      {type}
                  </label>
                  ))}
              </div>
              )}
          </div>

          <div className={styles.weaponTypeContainer}>
              <h4 onClick={() => setCollapseSecondaryFilters(v => !v)} className={styles.collapsibleTitle}>
                  Secondary Weapons
              </h4>
              {!collapseSecondaryFilters && (
              <div className={styles.filterBlock}>
                  {ALL_SECONDARY_TYPES.map(type => (
                  <label key={type}>
                      <input
                      type="checkbox"
                      checked={secondaryTypes.includes(type)}
                      onChange={() => toggleSecondaryType(type)}
                      />
                      {type}
                  </label>
                  ))}
              </div>
              )}
          </div>
        </div>
        )}
      </div>

        <motion.div
          className={styles.grid}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {categories.map(cat => {

            const displayValue = getValueForKey(cat.key);
            let animKey;
            if (cat.key === "armor") {
              const type = build.armor.type || "";
              const plates = Array.isArray(build.armor.plates)
                ? build.armor.plates.join("-")
                : "";
              animKey = `${type}-${plates}`;
            } else if (
              typeof displayValue === "string" ||
              typeof displayValue === "number"
            ) {
              animKey = displayValue;
            }

            return (
            <CategoryCard
              key={cat.key}
              label={cat.label}
              value={displayValue}
              animationKey={animKey}
              hasData={!!displayValue}
              collapsed={cardCollapse[cat.key]}
              onToggleCollapse={() =>
                setCardCollapse(prev => ({ ...prev, [cat.key]: !prev[cat.key] }))
              }
              onReroll={() => rerollField(cat.key, { primaryTypes, secondaryTypes })}
              highlight={cat.key === "heist"}
            />
            )}
          )}
        </motion.div>

        <ConfirmDialog
          open={confirmResetOpen}
          title="Reset Build"
          message="Reset current build?"
          onCancel={() => setConfirmResetOpen(false)}
          onConfirm={() => {
            resetBuild();
            setConfirmResetOpen(false);
          }}
        />

        <ConfirmDialog
          open={confirmRandomOpen}
          title="Randomize Build"
          message="Current build will be overwritten"
          onCancel={() => setConfirmRandomOpen(false)}
          onConfirm={() => {
            triggerVisualFeedback();
            generateFullBuild({ primaryTypes, secondaryTypes });
            setConfirmRandomOpen(false);
          }}
        />

      </div>
    </div>
  );
}

export default BuildLayout;
