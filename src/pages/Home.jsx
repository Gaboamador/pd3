import { Link } from "react-router-dom";
import styles from "./Home.module.scss";

export default function Home() {
  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <h1 className={styles.title}>Build tools & randomizers</h1>
        {/* <p className={styles.subtitle}>
          Payday 3 – Build tools & randomizers
        </p> */}
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

        <Link to="/library-explorer" className={styles.card}>
          <div className={styles.cardTitle}>Library Explorer</div>
          <div className={styles.cardDesc}>
            .
          </div>
        </Link>

        <Link to="/library-roulette" className={styles.card}>
          <div className={styles.cardTitle}>Library Roulette</div>
          <div className={styles.cardDesc}>
            .
          </div>
        </Link>
      </nav>
    </div>
  );
}
