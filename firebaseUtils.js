import { db } from "./firebase";
import {
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
} from "firebase/firestore";

/**
 * ===============================
 * BUILDS
 * Path: users/{uid}/builds/{buildId}
 * ===============================
 */

/**
 * Guarda o actualiza un build
 */
export const saveBuild = async (uid, build) => {
  if (!uid) throw new Error("saveBuild: uid requerido");
  if (!build?.id) throw new Error("saveBuild: build.id requerido");

  const buildRef = doc(db, "users", uid, "builds", build.id);

  await setDoc(buildRef, build, { merge: true });
};

/**
 * Obtiene un build por id
 */
export const getBuild = async (uid, buildId) => {
  if (!uid) throw new Error("getBuild: uid requerido");
  if (!buildId) throw new Error("getBuild: buildId requerido");

  const buildRef = doc(db, "users", uid, "builds", buildId);
  const snap = await getDoc(buildRef);

  if (!snap.exists()) return null;

  return snap.data();
};

/**
 * Obtiene todos los builds del usuario
 */
export const getAllBuilds = async (uid) => {
  if (!uid) throw new Error("getAllBuilds: uid requerido");

  const buildsRef = collection(db, "users", uid, "builds");
  const snapshot = await getDocs(buildsRef);

  return snapshot.docs.map((doc) => doc.data());
};

/**
 * Elimina un build
 */
export const deleteBuild = async (uid, buildId) => {
  if (!uid) throw new Error("deleteBuild: uid requerido");
  if (!buildId) throw new Error("deleteBuild: buildId requerido");

  const buildRef = doc(db, "users", uid, "builds", buildId);
  await deleteDoc(buildRef);
};

/**
 * ===============================
 * HELPERS DE SLOT (opcional)
 * ===============================
 */

/**
 * Asigna un slot a un build y libera el slot si estaba ocupado
 * (misma lógica que tenías en localStorage)
 */
export const assignBuildSlot = async (uid, buildId, slot) => {
  if (!uid) throw new Error("assignBuildSlot: uid requerido");

  const builds = await getAllBuilds(uid);

  // liberar slot si ya estaba ocupado
  const updates = builds.map((b) => {
    if (b.slot === slot) {
      return { ...b, slot: null };
    }
    if (b.id === buildId) {
      return { ...b, slot };
    }
    return null;
  });

  const writes = updates
    .filter(Boolean)
    .map((b) => saveBuild(uid, b));

  await Promise.all(writes);

  return await getAllBuilds(uid);
};

/**
 * Limpia el slot de un build
 */
export const clearBuildSlot = async (uid, buildId) => {
  if (!uid) throw new Error("clearBuildSlot: uid requerido");

  const build = await getBuild(uid, buildId);
  if (!build) return null;

  await saveBuild(uid, { ...build, slot: null });
  return await getAllBuilds(uid);
};


// export async function markUserMigrated(uid) {
//   const userRef = doc(db, "users", uid);
//   await setDoc(
//     userRef,
//     { hasMigratedLocalBuilds: true },
//     { merge: true }
//   );
// }

// export async function getUserMigrationStatus(uid) {
//   const userRef = doc(db, "users", uid);
//   const snap = await getDoc(userRef);
//   return snap.exists()
//     ? snap.data().hasMigratedLocalBuilds === true
//     : false;
// }