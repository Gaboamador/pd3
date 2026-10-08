import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../auth/useAuth";
import { LuHouse, LuWrench, LuFolderOpen, LuSearch, LuDice5, LuTarget } from "react-icons/lu";
import styles from "./MobileNavigation.module.scss";

export default function MobileNavigation() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  if (pathname === '/auth') return null;
  const links = [
    { to: '/', icon: <LuHouse />, label: t('nav.home'), end: true },
    { to: '/build-editor', icon: <LuWrench />, label: t('home.build-editor.title') },
    { to: '/library-explorer', icon: <LuFolderOpen />, label: t('mobile.nav.library'), disabled: !isAuthenticated },
    { to: '/catalog', icon: <LuSearch />, label: t('home.catalog.title') },
    { to: '/randomizer', icon: <LuDice5 />, label: t('home.randomizer.title') },
    { to: '/library-roulette', icon: <LuTarget />, label: t('mobile.nav.roulette') },
  ];
  return (
    <nav className={styles.nav} aria-label={t('mobile.nav.label')}>
      {links.map(link => link.disabled ? (
        <span key={link.to} className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
          {link.icon}<span>{link.label}</span>
        </span>
      ) : (
        <NavLink key={link.to} to={link.to} end={link.end}
          className={({isActive}) => `${styles.link} ${isActive ? styles.active : ''}`}>
          {link.icon}<span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
