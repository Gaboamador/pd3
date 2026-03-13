import { useTranslation } from "react-i18next";
import styles from "./Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../../firebaseAuth";
import { IoPersonCircleSharp } from "react-icons/io5";


export default function Header() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  function handleLogout() {
    logout();
  }

  const pathname = location.pathname;

  const SUBTITLE_ROUTES = [
    { match: "/build-editor", label: t('home.build-editor.title') },
    { match: "/randomizer", label: t('home.randomizer.title') },
    { match: "/library-explorer", label: t('home.library-explorer.title') },
    { match: "/library-roulette", label: t('home.library-roulette.title') },
    { match: "/catalog", label: t('home.catalog.title') },
  ];

  const subtitle = SUBTITLE_ROUTES.find(r => pathname.startsWith(r.match))?.label ?? "";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/">
          <img
            src={pd3_logo_alt}
            alt="Payday 3 Logo"
            className={styles.logo}
          />
        </Link>
        
        {subtitle && (
          <span className={styles.subtitle}>{subtitle}</span>
        )}

      {isAuthenticated ? (
        <button onClick={handleLogout}>{t('auth.actions.logout')}</button>
      ) : (
        <Link to="/auth">
          <span>
            <IoPersonCircleSharp size={30} className={styles.authIcon}/>
          </span>
        </Link>
      )}

            </div>
    </header>
  );
}