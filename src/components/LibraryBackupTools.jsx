import { useAuth } from "../auth/useAuth";
import { useUserLibrary } from "../library/hooks/useUserLibrary";
import { BuildLibraryService } from "../services/buildLibraryService";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { useState } from "react";

function exportLibraryBackup(library, uid) {
  if (!library || library.length === 0) {
    alert("Library is empty or not loaded");
    return;
  }

  const payload = {
    version: "pd3_library_backup_v1",
    exportedAt: new Date().toISOString(),
    uid,
    builds: library
  };

  const json = JSON.stringify(payload, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `pd3_library_backup_${uid}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

async function restoreLibraryBackup({
  file,
  uid,
  library,
  setLibrary,
  mode
}) {
  if (!file) return;

  const text = await file.text();

  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    alert("Invalid JSON file");
    return;
  }

  if (!parsed.builds || !Array.isArray(parsed.builds)) {
    alert("Backup format invalid");
    return;
  }

  const backupBuilds = parsed.builds;
  const existingIds = new Set(library.map(b => b.id));

  const buildsToRestore = [];

  for (const build of backupBuilds) {
    const exists = existingIds.has(build.id);

    if (mode === "MERGE") {
      if (!exists) buildsToRestore.push(build);
    }

    if (mode === "OVERWRITE") {
      buildsToRestore.push(build);
    }

    if (mode === "REPLACE_ALL") {
      buildsToRestore.push(build);
    }
  }

  const confirmText = `
Restore mode: ${mode}

Backup builds: ${backupBuilds.length}
Current builds: ${library.length}
To restore: ${buildsToRestore.length}

Continue?
`;

  if (!confirm(confirmText)) return;

  try {

    let nextLibrary = [...library];

    if (mode === "REPLACE_ALL") {

      for (const build of library) {
        await deleteDoc(doc(db, "users", uid, "builds", build.id));
      }

      nextLibrary = [];
    }

    for (const build of buildsToRestore) {
      nextLibrary = await BuildLibraryService.save(uid, build);
    }

    setLibrary(nextLibrary);

    alert("Library restore completed");

  } catch (err) {
    console.error(err);
    alert("Restore failed");
  }
}

export default function LibraryBackupTools() {
  const { uid } = useAuth();
  const { library, setLibrary } = useUserLibrary();

  const [mode, setMode] = useState("MERGE");

  async function handleRestore(e) {
    const file = e.target.files?.[0];

    await restoreLibraryBackup({
      file,
      uid,
      library,
      setLibrary,
      mode
    });

    e.target.value = "";
  }

  return (
    <div style={{
      display: "flex",
      gap: "10px",
      alignItems: "center",
      flexWrap: "wrap"
    }}>

      <button
        onClick={() => exportLibraryBackup(library, uid)}
      >
        EXPORT LIBRARY
      </button>

      <select
        value={mode}
        onChange={(e) => setMode(e.target.value)}
      >
        <option value="MERGE">MERGE</option>
        <option value="OVERWRITE">OVERWRITE</option>
        <option value="REPLACE_ALL">REPLACE ALL</option>
      </select>

      <label style={{ cursor: "pointer" }}>
        <input
          type="file"
          accept="application/json"
          style={{ display: "none" }}
          onChange={handleRestore}
        />
        RESTORE BACKUP
      </label>

    </div>
  );
}