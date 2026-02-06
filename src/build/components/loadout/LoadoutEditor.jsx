import { useState, useMemo } from "react";
import styles from "./LoadoutEditor.module.scss";
import ArmorEditor from "./ArmorEditor";
import WeaponCard from "../weapons/WeaponCard";
import LoadoutItemPickerModal from "./LoadoutItemPickerModal";
import LoadoutItemCard from "./LoadoutItemCard";
import OverkillSprite from "./OverkillSprite";
import ArmorSprite from "./ArmorSprite";
import ArmorPlatesPreview from "./ArmorPlatesPreview";
import DeployableSprite from "./DeployableSprite";
import ThrowableSprite from "./ThrowableSprite";
import ToolSprite from "./ToolSprite";
import Modal from "../common/Modal";
import ArmorPlatesEditor from "./ArmorPlatesEditor";
import { getArmorByKey, getArmorMaxPlates, buildEmptyPlateSlots } from "../../utils/armor.utils";
import { useLoadoutItemController } from "../../../hooks/useLoadoutItemController";
import { createEmptyBuild } from "../../build.utils";

export default function LoadoutEditor({
  build,
  setBuild,
  loadoutNormalized,
  platesData,
  loadoutData,
}) {
  const {
    primary: weaponsPrimaryByType,
    secondary: weaponsSecondaryByType,
    armors,
  } = loadoutNormalized;

  const [openPicker, setOpenPicker] = useState(null);

  const [openArmorEditor, setOpenArmorEditor] = useState(false);

  function updateLoadout(patch) {
    setBuild(prev => ({
      ...prev,
      loadout: {
        ...prev.loadout,
        ...patch,
      },
    }));
  }

  // ✅ OJO: allowEdit: true para weapons
  const primaryCtrl = useLoadoutItemController({
    slotKey: "primary",
    build,
    updateLoadout,
    allowEdit: true,
  });

  const secondaryCtrl = useLoadoutItemController({
    slotKey: "secondary",
    build,
    updateLoadout,
    allowEdit: true,
  });

  const overkillCtrl = useLoadoutItemController({
    slotKey: "overkill",
    build,
    updateLoadout,
  });

  const armorCtrl = useLoadoutItemController({
    slotKey: "armor",
    build,
    updateLoadout,
  });

  const deployableCtrl = useLoadoutItemController({
    slotKey: "deployable",
    build,
    updateLoadout,
  });

  const throwableCtrl = useLoadoutItemController({
    slotKey: "throwable",
    build,
    updateLoadout,
  });

  const toolCtrl = useLoadoutItemController({
    slotKey: "tool",
    build,
    updateLoadout,
  });


  function findWeaponDef(itemsByType, weaponKey) {
    if (!weaponKey) return null;
    for (const weapons of Object.values(itemsByType)) {
      const found = weapons.find(w => w.key === weaponKey);
      if (found) return found;
    }
    return null;
  }

  const primaryWeaponDef = useMemo(
    () => findWeaponDef(weaponsPrimaryByType, build.loadout.primary?.weaponKey),
    [weaponsPrimaryByType, build.loadout.primary?.weaponKey]
  );

  const secondaryWeaponDef = useMemo(
    () =>
      findWeaponDef(
        weaponsSecondaryByType,
        build.loadout.secondary?.weaponKey
      ),
    [weaponsSecondaryByType, build.loadout.secondary?.weaponKey]
  );

    function findArmorDef(armors, armorKey) {
      if (!armorKey) return null;
      return armors.find(a => a.key === armorKey) ?? null;
    }

    const armorDef = useMemo(
      () =>
        findArmorDef(
          armors,
          build.loadout.armor?.key
        ),
      [armors, build.loadout.armor?.key]
    );

  function findItem(items, key) {
  return items.find(it => it.key === key) ?? null;
}

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

function setArmorFrame(key) {
  if (!key) {
    updateLoadout({ armor: { key: null, plates: [] } });
    return;
  }

  const nextArmorDef = getArmorByKey(loadoutData, key);
  const nextMaxPlates = getArmorMaxPlates(nextArmorDef);
  const nextPlates = buildEmptyPlateSlots(nextMaxPlates);

  updateLoadout({
    armor: {
      key,
      plates: nextPlates,
    },
  });
}

const armorPlates = build.loadout.armor?.plates ?? [];
const hasAnyPlateSelected = armorPlates.some(p => p != null);

return (
  <div className={styles.wrapper}>
    <div className={styles.title}>// LOADOUT</div>

    <div className={styles.grid}>
      {/* PRIMARY */}
      <div className={`${styles.cell} ${styles.primary}`}>
        <WeaponCard
          slot="primary"
          weaponDef={primaryWeaponDef}
          modsState={build.loadout.primary?.mods}
          onChangeMods={mods =>
            updateLoadout({
              primary: {
                ...build.loadout.primary,
                mods,
              },
            })
          }
          onClick={() => setOpenPicker("primary")}
          forceOpenMods={primaryCtrl.requestEdit}
          onModsOpened={primaryCtrl.consumeEditRequest}
        />

        <LoadoutItemPickerModal
          open={openPicker === "primary"}
          onClose={() => setOpenPicker(null)}
          title="Select Primary weapon"
          itemsByType={weaponsPrimaryByType}
          renderCard={def => (
            <WeaponCard
              key={def.key}
              slot="primary"
              weaponDef={def}
              onClick={() => {
                primaryCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
              onBeforeEdit={weaponDef => {
                primaryCtrl.handleEditItem(weaponDef);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>

      {/* SECONDARY */}
      <div className={`${styles.cell} ${styles.secondary}`}>
        <WeaponCard
          slot="secondary"
          weaponDef={secondaryWeaponDef}
          modsState={build.loadout.secondary?.mods}
          onChangeMods={mods =>
            updateLoadout({
              secondary: {
                ...build.loadout.secondary,
                mods,
              },
            })
          }
          onClick={() => setOpenPicker("secondary")}
          forceOpenMods={secondaryCtrl.requestEdit}
          onModsOpened={secondaryCtrl.consumeEditRequest}
        />

        <LoadoutItemPickerModal
          open={openPicker === "secondary"}
          onClose={() => setOpenPicker(null)}
          title="Select Secondary weapon"
          itemsByType={weaponsSecondaryByType}
          renderCard={def => (
            <WeaponCard
              key={def.key}
              slot="secondary"
              weaponDef={def}
              onClick={() => {
                secondaryCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
              onBeforeEdit={weaponDef => {
                secondaryCtrl.handleEditItem(weaponDef);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>

      {/* OVERKILL */}
      <div className={`${styles.cell} ${styles.overkill}`}>
        <LoadoutItemCard
          slot="overkill"
          itemDef={overkillDef}
          SpriteComponent={OverkillSprite}
          onClick={() => setOpenPicker("overkill")}
        />

        <LoadoutItemPickerModal
          open={openPicker === "overkill"}
          onClose={() => setOpenPicker(null)}
          title="Select Overkill Weapon"
          itemsByType={{ all: loadoutNormalized.overkill }}
          renderCard={def => (
            <LoadoutItemCard
              key={def.key}
              slot="overkill"
              itemDef={def}
              SpriteComponent={OverkillSprite}
              onClick={() => {
                overkillCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>

      {/* ARMOR */}
      <div className={`${styles.cell} ${styles.armor}`}>
        <LoadoutItemCard
          slot="armor"
          itemDef={armorDef}
          SpriteComponent={ArmorSprite}
          onClick={() => setOpenPicker("armor")}
          onEdit={() => setOpenArmorEditor(true)}
          // extraContent={
          //   hasAnyPlateSelected ? (
          //     <ArmorPlatesPreview plates={armorPlates} platesData={platesData} />
          //   ) : null
          // }
          headerExtra={
            hasAnyPlateSelected ? (
              <ArmorPlatesPreview
                plates={armorPlates}
                platesData={platesData}
              />
            ) : null
          }
        />

        <LoadoutItemPickerModal
          open={openPicker === "armor"}
          onClose={() => setOpenPicker(null)}
          title="Select Armor Frame"
          itemsByType={{ all: armors }}
          renderCard={def => (
            <LoadoutItemCard
              key={def.key}
              slot="armor"
              itemDef={def}
              SpriteComponent={ArmorSprite}
              onClick={() => {
                setArmorFrame(def.key);
                setOpenPicker(null);
              }}
              onEdit={() => {
                setArmorFrame(def.key);
                setOpenPicker(null);
                setOpenArmorEditor(true);
              }}
            />
          )}
        />

        <Modal
          open={openArmorEditor}
          onClose={() => setOpenArmorEditor(false)}
          title={`Edit Armor Plates${armorDef?.name ? ` – ${armorDef.name}` : ""}`}
          width="720px"
        >
          <ArmorPlatesEditor
            value={build.loadout.armor}
            platesData={platesData}
            loadoutData={loadoutData}
            onChange={armor => updateLoadout({ armor })}
          />
        </Modal>
      </div>

      {/* THROWABLE */}
      <div className={`${styles.cell} ${styles.throwable}`}>
        <LoadoutItemCard
          slot="throwable"
          itemDef={throwableDef}
          SpriteComponent={ThrowableSprite}
          onClick={() => setOpenPicker("throwable")}
        />

        <LoadoutItemPickerModal
          open={openPicker === "throwable"}
          onClose={() => setOpenPicker(null)}
          title="Select Throwable"
          itemsByType={{ all: loadoutNormalized.throwable }}
          renderCard={def => (
            <LoadoutItemCard
              key={def.key}
              slot="throwable"
              itemDef={def}
              SpriteComponent={ThrowableSprite}
              onClick={() => {
                throwableCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>

      {/* DEPLOYABLE */}
      <div className={`${styles.cell} ${styles.deployable}`}>
        <LoadoutItemCard
          slot="deployable"
          itemDef={deployableDef}
          SpriteComponent={DeployableSprite}
          onClick={() => setOpenPicker("deployable")}
        />

        <LoadoutItemPickerModal
          open={openPicker === "deployable"}
          onClose={() => setOpenPicker(null)}
          title="Select Deployable"
          itemsByType={{ all: loadoutNormalized.deployable }}
          renderCard={def => (
            <LoadoutItemCard
              key={def.key}
              slot="deployable"
              itemDef={def}
              SpriteComponent={DeployableSprite}
              onClick={() => {
                deployableCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>

      {/* TOOL */}
      <div className={`${styles.cell} ${styles.tool}`}>
        <LoadoutItemCard
          slot="tool"
          itemDef={toolDef}
          SpriteComponent={ToolSprite}
          onClick={() => setOpenPicker("tool")}
        />

        <LoadoutItemPickerModal
          open={openPicker === "tool"}
          onClose={() => setOpenPicker(null)}
          title="Select Tool"
          itemsByType={{ all: loadoutNormalized.tool }}
          renderCard={def => (
            <LoadoutItemCard
              key={def.key}
              slot="tool"
              itemDef={def}
              SpriteComponent={ToolSprite}
              onClick={() => {
                toolCtrl.handleSelectItem(def);
                setOpenPicker(null);
              }}
            />
          )}
        />
      </div>
    </div>
  </div>
);

//   return (
//     <div style={{ display: "grid", gap: 16 }}>
//       <div style={{ display: "grid", gap: 10 }}>
//         <div style={{ fontWeight: 700 }}>// LOADOUT</div>

//         {/* PRIMARY */}
//         <WeaponCard
//           slot="primary"
//           weaponDef={primaryWeaponDef}
//           modsState={build.loadout.primary?.mods}
//           onChangeMods={mods =>
//             updateLoadout({
//               primary: {
//                 ...build.loadout.primary,
//                 mods,
//               },
//             })
//           }
//           onClick={() => setOpenPicker("primary")}
//           forceOpenMods={primaryCtrl.requestEdit}
//           onModsOpened={primaryCtrl.consumeEditRequest}
//         />

//         <LoadoutItemPickerModal
//           open={openPicker === "primary"}
//           onClose={() => setOpenPicker(null)}
//           title="Select Primary weapon"
//           itemsByType={weaponsPrimaryByType}
//           renderCard={def => (
//           <WeaponCard
//             key={def.key}
//             slot="primary"
//             weaponDef={def}
//             onClick={() => {
//               primaryCtrl.handleSelectItem(def);
//               setOpenPicker(null);
//             }}
//             onBeforeEdit={weaponDef => {
//               primaryCtrl.handleEditItem(weaponDef);
//               setOpenPicker(null);
//             }}
//           />
//           )}
//         />

//         {/* SECONDARY */}
//         <WeaponCard
//           slot="secondary"
//           weaponDef={secondaryWeaponDef}
//           modsState={build.loadout.secondary?.mods}
//           onChangeMods={mods =>
//             updateLoadout({
//               secondary: {
//                 ...build.loadout.secondary,
//                 mods,
//               },
//             })
//           }
//           onClick={() => setOpenPicker("secondary")}
//           forceOpenMods={secondaryCtrl.requestEdit}
//           onModsOpened={secondaryCtrl.consumeEditRequest}
//         />

//         <LoadoutItemPickerModal
//           open={openPicker === "secondary"}
//           onClose={() => setOpenPicker(null)}
//           title="Select Secondary weapon"
//           itemsByType={weaponsSecondaryByType}
//           renderCard={def => (
//             <WeaponCard
//               key={def.key}
//               slot="secondary"
//               weaponDef={def}
//               onClick={() => {
//                 secondaryCtrl.handleSelectItem(def);
//                 setOpenPicker(null);
//               }}
//               onBeforeEdit={weaponDef => {
//                 secondaryCtrl.handleEditItem(weaponDef);
//                 setOpenPicker(null);
//               }}
//             />
//           )}
//         />
//       </div>


// {/* OVERKILL */}
//   <LoadoutItemCard
//     slot="overkill"
//     itemDef={overkillDef}
//     SpriteComponent={OverkillSprite}
//     onClick={() => setOpenPicker("overkill")}
//   />

//   <LoadoutItemPickerModal
//     open={openPicker === "overkill"}
//     onClose={() => setOpenPicker(null)}
//     title="Select Overkill Weapon"
//     itemsByType={{ all: loadoutNormalized.overkill }}
//     renderCard={def => (
//       <LoadoutItemCard
//         key={def.key}
//         slot="overkill"
//         itemDef={def}
//         SpriteComponent={OverkillSprite}
//         onClick={() => {
//           overkillCtrl.handleSelectItem(def);
//           setOpenPicker(null);
//         }}
//       />
//     )}
//   />

// {/* ARMOR */}
// <LoadoutItemCard
//   slot="armor"
//   itemDef={armorDef}
//   SpriteComponent={ArmorSprite}
//   onClick={() => setOpenPicker("armor")}
//   onEdit={() => setOpenArmorEditor(true)}
//   extraContent={
//       hasAnyPlateSelected ? (
//         <ArmorPlatesPreview
//           plates={armorPlates}
//           platesData={platesData}
//         />
//       ) : null
//     }
// />

// <LoadoutItemPickerModal
//   open={openPicker === "armor"}
//   onClose={() => setOpenPicker(null)}
//   title="Select Armor Frame"
//   itemsByType={{ all: armors }}
//   renderCard={def => (
//     <LoadoutItemCard
//       key={def.key}
//       slot="armor"
//       itemDef={def}
//       SpriteComponent={ArmorSprite}
//       onClick={() => {
//         setArmorFrame(def.key);
//         setOpenPicker(null);
//       }}
//       // opcional: permitir ⚙ también dentro del picker (igual que weapons)
//       onEdit={() => {
//         setArmorFrame(def.key);
//         setOpenPicker(null);
//         setOpenArmorEditor(true);
//       }}
//     />
//   )}
// />

// <Modal
//   open={openArmorEditor}
//   onClose={() => setOpenArmorEditor(false)}
//   title={`Edit Armor Plates${armorDef?.name ? ` – ${armorDef.name}` : ""}`}
//   width="720px"
// >
//   <ArmorPlatesEditor
//     value={build.loadout.armor}
//     platesData={platesData}
//     loadoutData={loadoutData}
//     onChange={armor => updateLoadout({ armor })}
//   />
// </Modal>


//   {/* DEPLOYABLE */}
//   <LoadoutItemCard
//     slot="deployable"
//     itemDef={deployableDef}
//     SpriteComponent={DeployableSprite}
//     onClick={() => setOpenPicker("deployable")}
//   />

//   <LoadoutItemPickerModal
//     open={openPicker === "deployable"}
//     onClose={() => setOpenPicker(null)}
//     title="Select Deployable"
//     itemsByType={{ all: loadoutNormalized.deployable }}
//     renderCard={def => (
//       <LoadoutItemCard
//         key={def.key}
//         slot="deployable"
//         itemDef={def}
//         SpriteComponent={DeployableSprite}
//         onClick={() => {
//           deployableCtrl.handleSelectItem(def);
//           setOpenPicker(null);
//         }}
//       />
//     )}
//   />

//   {/* THROWABLES */}
//   <LoadoutItemCard
//     slot="throwable"
//     itemDef={throwableDef}
//     SpriteComponent={ThrowableSprite}
//     onClick={() => setOpenPicker("throwable")}
//   />

//   <LoadoutItemPickerModal
//     open={openPicker === "throwable"}
//     onClose={() => setOpenPicker(null)}
//     title="Select Throwable"
//     itemsByType={{ all: loadoutNormalized.throwable }}
//     renderCard={def => (
//       <LoadoutItemCard
//         key={def.key}
//         slot="throwable"
//         itemDef={def}
//         SpriteComponent={ThrowableSprite}
//         onClick={() => {
//           throwableCtrl.handleSelectItem(def);
//           setOpenPicker(null);
//         }}
//       />
//     )}
//   />

// {/* TOOLS */}
//   <LoadoutItemCard
//     slot="tool"
//     itemDef={toolDef}
//     SpriteComponent={ToolSprite}
//     onClick={() => setOpenPicker("tool")}
//   />

//   <LoadoutItemPickerModal
//     open={openPicker === "tool"}
//     onClose={() => setOpenPicker(null)}
//     title="Select Tool"
//     itemsByType={{ all: loadoutNormalized.tool }}
//     renderCard={def => (
//       <LoadoutItemCard
//         key={def.key}
//         slot="tool"
//         itemDef={def}
//         SpriteComponent={ToolSprite}
//         onClick={() => {
//           toolCtrl.handleSelectItem(def);
//           setOpenPicker(null);
//         }}
//       />
//     )}
//   />


//     </div>
//   );
}
