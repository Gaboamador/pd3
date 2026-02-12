import { useEffect, useState } from "react";
import styles from "./MigrationPrompt.module.scss";
import { useAuth } from "../auth/useAuth";
import { BuildLibraryService } from "../services/buildLibraryService";
import { loadBuildLibrary } from "../utils/buildLibrary.local";
// import { getUserMigrationStatus, markUserMigrated } from "../../firebaseUtils";
import Spinner from "./Spinner";

export default function MigrationPrompt() {
  const { uid } = useAuth();

  const [checking, setChecking] = useState(true);
  const [show, setShow] = useState(false);
  const [localCount, setLocalCount] = useState(0);
  const [migrating, setMigrating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
  const dismissed = sessionStorage.getItem(
    "pd3_migration_prompt_dismissed"
  );

  if (dismissed) {
    setChecking(false);
    setShow(false);
    return;
  }

  const localBuilds = loadBuildLibrary();

  if (!localBuilds.length) {
    setChecking(false);
    setShow(false);
    return;
  }

  if (!uid) {
    setChecking(false);
    setShow(false);
    return;
  }

  async function check() {
    setChecking(true);

    const remoteBuilds = await BuildLibraryService.getAll(uid);

    const remoteIds = new Set(
      remoteBuilds
        .filter(b => b.isSynced)
        .map(b => b.id)
    );

    const notMigrated = localBuilds.filter(
      b => !remoteIds.has(b.id)
    );

    if (notMigrated.length > 0) {
      setLocalCount(notMigrated.length);
      setShow(true);
    }

    setChecking(false);
  }

  check();
}, [uid]);


  async function handleMigrate() {
    try {
      setMigrating(true);
      setError("");

      await BuildLibraryService.migrateLocalBuilds(uid);
      // await markUserMigrated(uid);

      setShow(false);
    } catch (err) {
      console.error("Migration error:", err);
      setError("Failed to migrate builds. Please try again.");
    } finally {
      setMigrating(false);
    }
  }

  function handleClose() {
    sessionStorage.setItem(
      "pd3_migration_prompt_dismissed",
      "1"
    );
    setShow(false);
  }


  if (checking || !show) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        
        <button
          className={styles.close}
          onClick={handleClose}
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className={styles.title}>
          Migrate your local builds
        </h3>

        <p className={styles.text}>
          We found <strong>{localCount}</strong>{" "}
          build{localCount > 1 ? "s" : ""} saved locally.
          <br />
          You can add them to your online library.
        </p>

        {error && (
          <div className={styles.error}>
            {error}
          </div>
        )}

        {migrating ? (
          <Spinner label="Migrating builds…" />
        ) : (
          <div className={styles.actions}>
            <button
              className={styles.primary}
              onClick={handleMigrate}
            >
              Migrate builds
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
