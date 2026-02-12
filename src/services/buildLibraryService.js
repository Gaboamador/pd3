import {
  getAllBuilds as getRemoteBuilds,
  getBuild as getRemoteBuild,
  saveBuild as saveRemoteBuild,
  deleteBuild as deleteRemoteBuild,
  assignBuildSlot as assignRemoteSlot,
  clearBuildSlot as clearRemoteSlot,
} from "../../firebaseUtils";

import {
  loadBuildLibrary,
  clearBuildLibrary,
  getBuildFromLibrary,
  saveBuildToLibrary,
  deleteBuildFromLibrary,
  assignBuildSlot as assignLocalSlot,
  clearBuildSlot as clearLocalSlot,
} from "../utils/buildLibrary.local";

/**
 * ===============================
 * SELECTOR DE BACKEND
 * ===============================
 */

const isRemote = (uid) => Boolean(uid);

/**
 * ===============================
 * API PÚBLICA
 * ===============================
 */

export const BuildLibraryService = {
  // async getAll(uid) {
  //   if (isRemote(uid)) {
  //     return await getRemoteBuilds(uid);
  //   }
  //   return loadBuildLibrary();
  // },
  async getAll(uid) {
    const local = loadBuildLibrary();
    if (!isRemote(uid)) {
      return local.map(b => ({
        ...b,
        isSynced: false,
      }));
    }
    const remote = await getRemoteBuilds(uid);
    // index remoto por id
    const remoteById = Object.fromEntries(
      remote.map(b => [b.id, { ...b, isSynced: true }])
    );
    // locales que no existen en remoto
    const localOnly = local
      .filter(b => !remoteById[b.id])
      .map(b => ({ ...b, isSynced: false }));
    return [...remoteById ? Object.values(remoteById) : [], ...localOnly];
  },

  async getById(uid, buildId) {
    if (isRemote(uid)) {
      return await getRemoteBuild(uid, buildId);
    }
    return getBuildFromLibrary(buildId);
  },

  async save(uid, build) {
    if (isRemote(uid)) {
      await saveRemoteBuild(uid, build);
      return await getRemoteBuilds(uid);
    }

    saveBuildToLibrary(build);
    return loadBuildLibrary();
  },

  async delete(uid, buildId) {
    if (isRemote(uid)) {
      await deleteRemoteBuild(uid, buildId);
      return await getRemoteBuilds(uid);
    }

    return deleteBuildFromLibrary(buildId);
  },

  async assignSlot(uid, buildId, slot) {
    if (isRemote(uid)) {
      return await assignRemoteSlot(uid, buildId, slot);
    }

    return assignLocalSlot(buildId, slot);
  },

  async clearSlot(uid, buildId) {
    if (isRemote(uid)) {
      return await clearRemoteSlot(uid, buildId);
    }

    return clearLocalSlot(buildId);
  },

  async migrateLocalBuilds(uid) {
    return migrateLocalBuildsToRemote(uid);
  },
};

// export async function migrateLocalBuildsToRemote(uid) {
//   if (!uid) {
//     throw new Error("UID requerido para migración");
//   }

//   const localBuilds = loadBuildLibrary();

//   if (!localBuilds.length) {
//     return { migrated: 0 };
//   }

//   // 🔑 subir build por build (NO pisar)
//   for (const build of localBuilds) {
//     await saveRemoteBuild(uid, {
//       ...build,
//       slot: null, // opcional: evitar conflictos
//     });
//   }

//   // 🔥 limpiar localStorage SOLO al final
//   clearBuildLibrary();

//   return { migrated: localBuilds.length };
// }
export async function migrateLocalBuildsToRemote(uid) {
  if (!uid) {
    throw new Error("UID requerido para migración");
  }

  const localBuilds = loadBuildLibrary();

  if (!localBuilds.length) {
    return { migrated: 0 };
  }

  const remoteBuilds = await getRemoteBuilds(uid);
  const remoteIds = new Set(remoteBuilds.map(b => b.id));

  const toMigrate = localBuilds.filter(
    b => !remoteIds.has(b.id)
  );

  for (const build of toMigrate) {
    await saveRemoteBuild(uid, {
      ...build,
      slot: null,
    });
  }

  if (toMigrate.length > 0) {
    clearBuildLibrary();
  }

  return { migrated: toMigrate.length };
}
