// useLoadoutItemController.js
import { buildInitialModsStateForWeapon } from "../build/utils/loadout.utils";
import { useState } from "react";

export function useLoadoutItemController({
  slotKey,
  build,
  updateLoadout,
  allowEdit = false,
}) {
  const [requestEdit, setRequestEdit] = useState(false);

  function handleSelectItem(def) {
    if (allowEdit) {
      
      const initialMods = buildInitialModsStateForWeapon(def);
      // const emptyMods = {};
      // if (def.mods) {
      //   Object.keys(def.mods).forEach(s => {
      //     emptyMods[s] = null;
      //   });
      // }

      updateLoadout({
        [slotKey]: {
          weaponKey: def.key,
          preset: def.preset ?? 0,
          // mods: emptyMods,
          mods: initialMods,
        },
      });
    } else {
      updateLoadout({ [slotKey]: def.key });
    }
  }

  function handleEditItem(def) {
    handleSelectItem(def);
    if (allowEdit) {
      setRequestEdit(true); // 👈 señal, no modal
    }
  }

  function consumeEditRequest() {
    setRequestEdit(false);
  }

  return {
    handleSelectItem,
    handleEditItem,
    requestEdit,
    consumeEditRequest,
  };
}
