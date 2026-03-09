import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { BuildLibraryService } from "../../services/buildLibraryService";

// cache global del módulo
let libraryCache = null;
let cacheUid = null;

const STORAGE_KEY = "pd3_library_cache";
const STORAGE_UID_KEY = "pd3_library_cache_uid";

export function useUserLibrary() {
  const { uid } = useAuth();

  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  function updateLibrary(next) {
    libraryCache = next;
    cacheUid = uid;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      sessionStorage.setItem(STORAGE_UID_KEY, cacheUid ?? "");
    } catch {}

    setLibrary(next);
  }

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!uid) {
        libraryCache = [];
        cacheUid = null;

        try {
          sessionStorage.removeItem(STORAGE_KEY);
          sessionStorage.removeItem(STORAGE_UID_KEY);
        } catch {}

        setLibrary([]);
        setLoading(false);
        return;
      }

      // intentar restaurar cache desde sessionStorage
      if (!libraryCache) {
        try {
          const raw = sessionStorage.getItem(STORAGE_KEY);
          const cachedUid = sessionStorage.getItem(STORAGE_UID_KEY);

          if (raw && cachedUid === uid) {
            libraryCache = JSON.parse(raw);
            cacheUid = uid;
          }
        } catch {}
      }

      // si el cache pertenece al mismo usuario → usar cache
      if (libraryCache && cacheUid === uid) {
        setLibrary(libraryCache);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await BuildLibraryService.getAll(uid);

      if (!mounted) return;

      libraryCache = data ?? [];
      cacheUid = uid;

       // persistir en sessionStorage
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(libraryCache));
        sessionStorage.setItem(STORAGE_UID_KEY, uid);
      } catch {}

      setLibrary(libraryCache);
      setLoading(false);
    }

    load();

    return () => {
      mounted = false;
    };
  }, [uid]);

  return { library, loading, setLibrary: updateLibrary };
}
