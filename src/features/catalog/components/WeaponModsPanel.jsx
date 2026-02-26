// import styles from "./WeaponModsPanel.module.scss";

// export default function WeaponModsPanel({
//   weaponDef,
//   selectedMods,
//   onChange,
// }) {
//   if (!weaponDef?.mods) return null;

//   function selectMod(slotKey, mod) {
//     onChange({
//       ...selectedMods,
//       [slotKey]: mod,
//     });
//   }

//   return (
//     <div className={styles.wrapper}>
//       {Object.entries(weaponDef.mods).map(([slotKey, mods]) => (
//         <div key={slotKey} className={styles.slotBlock}>
//           <h4>{slotKey}</h4>
//           <div className={styles.modsRow}>
//             {Object.values(mods).map((mod) => (
//               <button
//                 key={mod.id}
//                 className={
//                   selectedMods?.[slotKey]?.id === mod.id
//                     ? styles.modActive
//                     : styles.modBtn
//                 }
//                 onClick={() => selectMod(slotKey, mod)}
//               >
//                 {mod.name}
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
import { getWeaponModSlots } from "../../../build/utils/loadout.utils";
import styles from "./WeaponModsPanel.module.scss";

export default function WeaponModsPanel({
  weaponDef,
  modsState,
  onChange,
}) {
  const modSlots = getWeaponModSlots(weaponDef);

  function setMod(slot, opt) {
    const nextValue = opt?.isDefault ? null : opt?.id ?? null;

    onChange({
      ...modsState,
      [slot]: nextValue,
    });
  }

  return (
    <div className={styles.wrapper}>
      {modSlots.map(ms => {
        const activeId = modsState?.[ms.slot] ?? null;

        return (
          <div key={ms.slot} className={styles.slotBlock}>
            <h4>{ms.slot}</h4>

            <div className={styles.modsRow}>
              {ms.options.map(opt => {
                const isActive = opt.isDefault
                  ? activeId == null
                  : activeId === opt.id;

                return (
                  <button
                    key={String(opt.id)}
                    className={
                      isActive ? styles.modActive : styles.modBtn
                    }
                    onClick={() => setMod(ms.slot, opt)}
                  >
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}