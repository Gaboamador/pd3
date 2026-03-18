import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../../firebaseAuth";
import NavMenu from "./NavMenu";
import HeaderMenuIcon from "./HeaderMenuIcon";
import { IoPersonCircleSharp } from "react-icons/io5";
import {
  LuWrench,
  LuDice5,
  LuSearch,
  LuFolderOpen,
  LuFilter,
  LuTarget,
  LuSpade,
  LuHouse
} from "react-icons/lu";


export default function Header() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const user = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);
  const isHome = pathname === "/";
  const buttonRef = useRef(null);
  const headerRef = useRef(null);

  function handleLogout() {
    logout();
  }

  const SUBTITLE_ROUTES = [
    { match: "/build-editor", label: t('home.build-editor.title') },
    { match: "/randomizer", label: t('home.randomizer.title') },
    { match: "/library-explorer", label: t('home.library-explorer.title') },
    { match: "/library-roulette", label: t('home.library-roulette.desc.short') },
    { match: "/catalog", label: t('home.catalog.title') },
    { match: "/compare-builds", label: t('home.compare.title') },
  ];

  const subtitle = SUBTITLE_ROUTES.find(r => pathname.startsWith(r.match))?.label ?? "";

  const navItems = [
    {
      to: "/",
      label: t('nav.home'),
      icon: <LuHouse />,
      service: "home"
    },
    {
      to: "/build-editor",
      label: t('home.build-editor.title'),
      icon: <LuWrench />,
      service: "editor"
    },
    {
      to: "/library-explorer",
      label: t('home.library-explorer.title'),
      icon: (
        <>
          <LuFolderOpen />
          <LuFilter />
        </>
      ),
      service: "explorer",
      disabled: !isAuthenticated
    },
    {
      to: "/library-roulette",
      label: t('home.library-roulette.title'),
      icon: (
        <>
          <LuTarget />
          <LuSpade />
        </>
      ),
      service: "roulette"
    },
    {
      to: "/catalog",
      label: t('home.catalog.title'),
      icon: <LuSearch />,
      service: "catalog"
    },
    {
      to: "/randomizer",
      label: t('home.randomizer.title'),
      icon: <LuDice5 />,
      service: "random"
    }
  ];

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>

      {isHome ? (
        <img
          src={pd3_logo_alt}
          alt="Payday 3 Logo"
          className={styles.logo}
        />
      ) : (
        <button
          ref={buttonRef}
          className={`${styles.logoButton} ${menuOpen ? styles.open : ""}`}
          onClick={() => setMenuOpen(true)}
        >
          <HeaderMenuIcon open={menuOpen} />
        </button>
      )}
        
      {subtitle && (
        <span className={styles.subtitle}>{subtitle}</span>
      )}

      {isAuthenticated ? (
        <>
        <div className={`${styles.authControls}`}>
          <div className={`${styles.userName} ${!isHome ? styles.smallerAuth : ""}`}>{user?.user?.displayName?.toUpperCase()}</div>
          <button className={`${styles.logoutButton} ${!isHome ? styles.smallerAuth : ""}`} onClick={handleLogout}>{t('auth.actions.logout')}</button>
        </div>
        </>
      ) : (
        <Link to="/auth">
          <span>
            <IoPersonCircleSharp size={30} className={styles.authIcon}/>
          </span>
        </Link>
      )}

      </div>

      <NavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navItems}
        anchorRef={buttonRef}
        headerRef={headerRef}
      />

    </header>
  );
}