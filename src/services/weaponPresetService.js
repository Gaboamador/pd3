import { db } from "../../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/**
 * ===============================
 * WEAPON PERSONAL PRESETS
 * Path: users/{uid}/weaponPresets/{weaponKey}
 * ===============================
 */
export const WeaponPresetService = {
  /**
   * Obtiene el preset de un arma
   */
  async get(uid, weaponKey) {
    if (!uid) throw new Error("WeaponPresetService.get: uid requerido");
    if (!weaponKey) throw new Error("WeaponPresetService.get: weaponKey requerido");

    const ref = doc(db, "users", uid, "weaponPresets", weaponKey);
    const snap = await getDoc(ref);

    if (!snap.exists()) return null;

    return snap.data();
  },

  /**
   * Guarda o reemplaza el preset de un arma
   */
  async save(uid, weaponKey, mods) {
    if (!uid) throw new Error("WeaponPresetService.save: uid requerido");
    if (!weaponKey) throw new Error("WeaponPresetService.save: weaponKey requerido");

    const ref = doc(db, "users", uid, "weaponPresets", weaponKey);

    await setDoc(ref, {
      weaponKey,
      mods: mods ?? {},
      updatedAt: serverTimestamp(),
    });

    return {
      weaponKey,
      mods: mods ?? {},
    };
  },
};
