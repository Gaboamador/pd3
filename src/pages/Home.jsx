import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import styles from "./Home.module.scss";
import {
  LuWrench,
  LuDice5,
  LuSearch,
  LuFolderOpen,
  LuFilter,
  LuTarget,
  LuSpade
} from "react-icons/lu";

export default function Home() {
const { t } = useTranslation();
const { isAuthenticated } = useAuth();

  return (
    <div className={styles.wrapper}>
      <header className={styles.header}>
        <div className={styles.title}>{t('home.title')}</div>
      </header>

      <nav className={styles.grid}>
        <Link to="/build-editor" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="editor"><LuWrench /></span>
            <span>{t('home.build-editor.title')}</span>
            </div>
          <div className={styles.cardDesc}>
            {t('home.build-editor.desc')}
          </div>
        </Link>

        <Link to="/library-explorer" className={`${styles.card} ${!isAuthenticated ? styles.disabled : ""}`}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="explorer"><LuFolderOpen /> <LuFilter /></span>
            <span>{t('home.library-explorer.title')}</span>
            </div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `${t('home.library-explorer.desc.not-auth')}`:`${t('home.library-explorer.desc.auth')}`}
          </div>
        </Link>

        <Link to="/library-roulette" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="roulette"><LuTarget /><LuSpade /></span>
            <span>{t('home.library-roulette.title')}</span>
            </div>
          <div className={styles.cardDesc}>
            {!isAuthenticated ? `${t('home.library-roulette.desc.not-auth')}`:`${t('home.library-roulette.desc.auth')}`}
          </div>
        </Link>

        <Link to="/catalog" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="catalog"><LuSearch /></span>
            <span>{t('home.catalog.title')}</span>
            </div>
          <div className={styles.cardDesc}>
            {t('home.catalog.desc')}
          </div>
        </Link>

        <Link to="/randomizer" className={styles.card}>
          <div className={styles.cardTitle}>
            <span className={styles.homeIcon} data-service="random"><LuDice5 /></span>
            <span>{t('home.randomizer.title')}</span>
            </div>
          <div className={styles.cardDesc}>
            {t('home.randomizer.desc')}
          </div>
        </Link>
        
      </nav>
    </div>
  );
}
