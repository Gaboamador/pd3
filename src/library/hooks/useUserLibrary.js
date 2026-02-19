import { useEffect, useState } from "react";
import { useAuth } from "../../auth/useAuth";
import { BuildLibraryService } from "../../services/buildLibraryService";

export function useUserLibrary() {
  const { uid } = useAuth();

  const [library, setLibrary] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!uid) {
        setLibrary([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await BuildLibraryService.getAll(uid);

      if (mounted) {
        setLibrary(data ?? []);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [uid]);

  return { library, loading };
}
