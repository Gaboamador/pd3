import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./LibraryRoulette.module.scss";
import { IoChevronBackCircleSharp } from "react-icons/io5";
import { IoMdOpen } from "react-icons/io";
import Section from "../../build/components/common/Section";
import { useLoadBuild } from "../../hooks/useLoadBuild";
import { useUserLibrary } from "../hooks/useUserLibrary";
import { attachSearchIndexToBuilds } from "../utils/buildSearchIndex";
import { filterBuilds } from "../utils/librarySearchEngine";
import { decodeFilters } from "../utils/filterSerialization";
import { buildWeaponTypeIndex } from "../utils/buildWeaponTypeIndex";

import loadoutData from "../../data/payday3_loadout_items.json";
import Spinner from "../../components/Spinner";
import BuildWheel from "../components/BulidWheel";

export default function LibraryRoulette() {
  const { library, loading } = useUserLibrary();
  const { loadBuild } = useLoadBuild();
  const location = useLocation();
  const navigate = useNavigate();
  const [fromExplorerSearch] = useState(() => location.state?.fromExplorer ?? null);
  const [selected, setSelected] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);

  const indexedBuilds = useMemo(
    () => attachSearchIndexToBuilds(library ?? []),
    [library]
  );

  const weaponTypeIndex = useMemo(() => {
    return buildWeaponTypeIndex(loadoutData);
  }, []);

  // 1️⃣ Leer filtros desde URL
  const filters = useMemo(() => {
    const params = new URLSearchParams(location.search);
    const raw = params.get("filters");
    if (!raw) return [];

    const decoded = decodeFilters(raw);

    return decoded.map((f) => {
      switch (f.k) {
        case "skill":
          return {
            type: "skill",
            key: f.key,
            state: f.state ?? "base",
          };

        case "weaponType":
          return {
            type: "weaponType",
            slot: f.slot,
            weaponType: f.weaponType,
          };

        case "buildName":
          return {
            type: "buildName",
            value: f.value.toLowerCase(),
          };

        default:
          return { type: f.k, key: f.key };
      }
    });
  }, [location.search]);

  // 2️⃣ Filtrar pool
  const pool = useMemo(() => {
    return filterBuilds(indexedBuilds, filters, {
      weaponTypeByKey: weaponTypeIndex.weaponTypeByKey,
    });
  }, [indexedBuilds, filters, weaponTypeIndex]);


    function spin() {
    if (!pool.length) return;
    setSpinning(true);
    const randomIndex = Math.floor(Math.random() * pool.length);
    const segmentAngle = 360 / pool.length;

    const centerAngle =
        randomIndex * segmentAngle + segmentAngle / 2;

    const spins = 5;

    setRotation(prev => {
        const normalizedPrev = prev % 360;

        const delta =
        spins * 360 +
        (360 - centerAngle - normalizedPrev);

        return prev + delta;
    });

    setSelectedIndex(randomIndex);

    setTimeout(() => {
        setSelected(pool[randomIndex]);
        setSpinning(false);
    }, 4000);
    }


  if (loading) return <Spinner label="Loading builds…" />;

  return (
    <div className={styles.page}>
        <div className={styles.wrapper}>
        

        <Section >
          <div className={styles.backToExplorerAndPoolWrapper}>
            {fromExplorerSearch && (
            <div className={styles.backToExplorerWrapper}>
              <button onClick={() => navigate(`/library-explorer${location.search}`)} className={styles.backBtn}>
                <IoChevronBackCircleSharp />
              </button>
              <span>BACK TO EXPLORER</span>
            </div>
            )}
            <div className={styles.resultsLength}>{pool.length} build{pool.length !== 1 ? "s" : ""} in pool</div>
          </div>
        </Section>

        
        <Section title="//Library Roulette">
        <div className={styles.rouletteSection}>
          <div className={styles.controlAndResult}>
              <div>
                  <button
                      className={styles.spinBtn}
                      disabled={!pool.length || spinning}
                      onClick={spin}
                  >
                      {spinning ? "Spinning..." : "SPIN"}
                  </button>
              </div>

              <div className={styles.resultWrapper}>
                  {selected &&
                  <div className={styles.btnWrapper}>
                    <div>OPEN</div>
                    <button 
                    className={styles.btn}
                    onClick={() => loadBuild(selected, {fromExplorer: location.search,})}
                    >
                      <IoMdOpen />
                    </button>
                  </div>
                  }
                  <div className={styles.result}>{selected?.name}</div>
              </div>
          </div>
          
          <BuildWheel
              builds={pool}
              rotation={rotation}
              selectedIndex={selectedIndex}
          />
        </div>
        </Section>

        </div>
    </div>
  );
}
