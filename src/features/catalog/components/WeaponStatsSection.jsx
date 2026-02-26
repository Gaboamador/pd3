// // import { useState, useMemo } from "react";
// // import StatsGrid from "./common/StatsGrid";
// // import styles from "./common/StatsGrid.module.scss";
// // import { computeWeaponStats } from "./utils/computeWeaponStats";
// // import WeaponModsPanel from "./WeaponModsPanel";

// // export default function WeaponStatsSection({ weapon }) {
// //   const [selectedMods, setSelectedMods] = useState({});

// //   const computed = useMemo(() => {
// //     return computeWeaponStats(weapon, selectedMods);
// //   }, [weapon, selectedMods]);

// //   if (!computed) return null;

// //   const rows = Object.entries(computed).map(([key, val]) => {
// //     const deltaClass =
// //       typeof val.delta === "string"
// //         ? val.delta.startsWith("+")
// //           ? styles.positive
// //           : val.delta.startsWith("-")
// //           ? styles.negative
// //           : ""
// //         : val.delta > 0
// //         ? styles.positive
// //         : val.delta < 0
// //         ? styles.negative
// //         : "";

// //     return [
// //       { value: key },
// //       { value: val.base },
// //       {
// //         value: val.delta !== 0 ? val.delta : "-",
// //         className: deltaClass,
// //       },
// //       { value: val.final },
// //     ];
// //   });

// //   return (
// //     <>
// //       <StatsGrid
// //         columns={["Stat", "Base", "Δ", "Final"]}
// //         rows={rows}
// //       />

// //       <WeaponModsPanel
// //         weaponDef={weapon}
// //         selectedMods={selectedMods}
// //         onChange={setSelectedMods}
// //       />
// //     </>
// //   );
// // }
// import { useState, useMemo } from "react";
// import StatsGrid from "./common/StatsGrid";
// import styles from "./common/StatsGrid.module.scss";
// import { computeWeaponStats } from "./utils/computeWeaponStats";
// import WeaponModsPanel from "./WeaponModsPanel";
// import { prettifyKey } from "./utils/prettifyKey";

// export default function WeaponStatsSection({ weapon }) {
//   const [selectedMods, setSelectedMods] = useState({});

//   const computed = useMemo(() => {
//     return computeWeaponStats(weapon, selectedMods);
//   }, [weapon, selectedMods]);

//   if (!computed) return null;

//   const rows = Object.entries(computed).map(([key, val]) => {
//     const deltaClass =
//       typeof val.delta === "string"
//         ? val.delta.startsWith("+")
//           ? styles.positive
//           : val.delta.startsWith("-")
//           ? styles.negative
//           : ""
//         : val.delta > 0
//         ? styles.positive
//         : val.delta < 0
//         ? styles.negative
//         : "";

//     return [
//       { value: prettifyKey(key) },
//       { value: val.final },   // 1️⃣ TOTAL
//       { value: val.base },    // 2️⃣ BASE
//       {
//         value: val.delta !== 0 ? val.delta : null, // 3️⃣ DELTA
//         className: deltaClass,
//       }
//     ];
//   });

//   return (
//     <>
//       <StatsGrid
//         columns={["Stat", "Total", "Base", "Δ"]}
//         rows={rows}
//       />

//       <WeaponModsPanel
//         weaponDef={weapon}
//         selectedMods={selectedMods}
//         onChange={setSelectedMods}
//       />
//     </>
//   );
// }
import { useState, useMemo, useEffect } from "react";
import StatsGrid from "./common/StatsGrid";
import styles from "./common/StatsGrid.module.scss";
import { computeWeaponStats } from "./utils/computeWeaponStats";
import { getWeaponModSlots, buildEmptyModsStateForWeapon } from "../../../build/utils/loadout.utils";
import WeaponModsPanel from "./WeaponModsPanel";
import { prettifyKey } from "./utils/prettifyKey";

export default function WeaponStatsSection({ weapon }) {
  const [modsState, setModsState] = useState({});

  // cuando cambia arma, resetear estado
  useEffect(() => {
    if (!weapon) return;
    setModsState(buildEmptyModsStateForWeapon(weapon));
  }, [weapon]);

  const computed = useMemo(() => {
    return computeWeaponStats(weapon, modsState);
  }, [weapon, modsState]);

  if (!computed) return null;

  const rows = Object.entries(computed).map(([key, val]) => {
    const deltaClass =
      typeof val.delta === "string"
        ? val.delta.startsWith("+")
          ? styles.positive
          : val.delta.startsWith("-")
          ? styles.negative
          : ""
        : val.delta > 0
        ? styles.positive
        : val.delta < 0
        ? styles.negative
        : "";

    return [
      { value: prettifyKey(key) },
      { value: val.final },
      { value: val.base },
      {
        value: val.delta !== 0 ? val.delta : null,
        className: deltaClass,
      },
    ];
  });

  return (
    <>
      <StatsGrid
        columns={["Stat", "Total", "Base", "Δ"]}
        rows={rows}
      />

      <WeaponModsPanel
        weaponDef={weapon}
        modsState={modsState}
        onChange={setModsState}
      />
    </>
  );
}