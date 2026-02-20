import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import styles from "./Home.module.scss";

export default function Home() {

const { isAuthenticated } = useAuth();

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Build tools & randomizers</h1>
      </header>

      <nav className={styles.grid}>
        <Link to="/build-editor" className={styles.card}>
          <div className={styles.cardTitle}>Build Editor</div>
          <div className={styles.cardDesc}>
            Manually create and edit builds, skills and loadouts.
          </div>
        </Link>

        <Link to="/randomizer" className={styles.card}>
          <div className={styles.cardTitle}>Randomizer</div>
          <div className={styles.cardDesc}>
            Generate random builds with configurable rules.
          </div>
        </Link>

        <Link to="/library-explorer" className={`${styles.card} ${!isAuthenticated ? styles.disabled : ""}`}>
          <div className={styles.cardTitle}>Library Explorer</div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `Sign in to search and filter your saved builds.`:`Search, filter and load builds from your personal library.`}
          </div>
        </Link>

        <Link to="/library-roulette" className={`${styles.card} ${!isAuthenticated ? styles.disabled : ""}`}>
          <div className={styles.cardTitle}>Library Roulette</div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `Sign in to spin between your saved builds.`:`Spin a wheel using filtered builds from your library.`}
          </div>
        </Link>
      </nav>
    </div>
  );
}
