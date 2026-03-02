import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import styles from "./Home.module.scss";
import {
  LuWrench,
  LuDice5,
  LuSearch,
  LuFolderOpen,
  LuFilter,
  LuTarget
} from "react-icons/lu";

export default function Home() {

const { isAuthenticated } = useAuth();

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Build tools & randomizers</h1>
      </header>

      <nav className={styles.grid}>
        <Link to="/build-editor" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="editor"><LuWrench /></span>
            <span>Build Editor</span>
            </div>
          <div className={styles.cardDesc}>
            Manually create and edit builds, skills and loadouts.
          </div>
        </Link>

        <Link to="/randomizer" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="random"><LuDice5 /></span>
            <span>Randomizer</span>
            </div>
          <div className={styles.cardDesc}>
            Generate random builds with configurable rules.
          </div>
        </Link>

        <Link to="/catalog" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="catalog"><LuSearch /></span>
            <span>Catalog</span>
            </div>
          <div className={styles.cardDesc}>
            Search the full PD3 database: skills, weapons, armor, equipment and more.
          </div>
        </Link>

        <Link to="/library-explorer" className={`${styles.card} ${!isAuthenticated ? styles.disabled : ""}`}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="explorer"><LuFolderOpen /> <LuFilter /></span>
            <span>Library Explorer</span>
            </div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `Sign in to search and filter your saved builds.`:`Search, filter and load builds from your personal library.`}
          </div>
        </Link>

        <Link to="/library-roulette" className={`${styles.card} ${!isAuthenticated ? styles.disabled : ""}`}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="roulette"><LuTarget /></span>
            <span>Library Roulette</span>
            </div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `Sign in to spin between your saved builds.`:`Spin a wheel using filtered builds from your library.`}
          </div>
        </Link>
      </nav>
    </div>
  );
}
