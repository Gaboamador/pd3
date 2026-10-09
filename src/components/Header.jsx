import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import styles from "./Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../../firebaseAuth";
import NavMenu from "./NavMenu";
import HeaderMenuIcon from "./HeaderMenuIcon";
import { useHeaderEditorSlot } from "../context/HeaderEditorSlotContext";
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
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;
  const isBuildEditorRoute = pathname.startsWith("/build-editor") || pathname.startsWith("/s/");
  const { setEditorSlot } = useHeaderEditorSlot();
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
    <header ref={headerRef} className={`${styles.header} ${isBuildEditorRoute ? styles.editorHeader : ""}`}>
      <div className={styles.inner}>

      {isHome ? (
        <>
          <img
            src={pd3_logo_alt}
            alt="Payday 3 Logo"
            className={styles.logo}
          />
          {/* Home no tiene botón de menú en desktop. En mobile permite
              acceder a la cuenta desde NavMenu sin ocupar lugar en el editor. */}
          <button
            ref={buttonRef}
            type="button"
            className={`${styles.logoButton} ${styles.homeMenuButton} ${menuOpen ? styles.open : ""}`}
            aria-label={t('mobile.nav.label')}
            onClick={() => setMenuOpen(true)}
          >
            <HeaderMenuIcon open={menuOpen} />
          </button>
        </>
      ) : (
        <button
          ref={buttonRef}
          type="button"
          className={`${styles.logoButton} ${menuOpen ? styles.open : ""}`}
          aria-label={t('mobile.nav.label')}
          onClick={() => setMenuOpen(true)}
        >
          <HeaderMenuIcon open={menuOpen} />
        </button>
      )}
        
      {subtitle && (
        <span className={styles.subtitle}>{subtitle}</span>
      )}

      {/* Punto de montaje para los controles mobile del Build Editor.
          Header conserva su contenido habitual en el resto de las rutas. */}
      {isBuildEditorRoute && <div ref={setEditorSlot} className={styles.editorSlot} />}

      {isAuthenticated ? (
        <div className={styles.authControls}>
          <div className={`${styles.userName} ${!isHome ? styles.smallerAuth : ""}`}>{user?.displayName?.toUpperCase()}</div>
          <button className={`${styles.logoutButton} ${!isHome ? styles.smallerAuth : ""}`} onClick={handleLogout}>{t('auth.actions.logout')}</button>
        </div>
      ) : (
        <Link to="/auth" className={styles.authLink} aria-label={t('auth.actions.login')}>
          <IoPersonCircleSharp size={30} className={styles.authIcon}/>
        </Link>
      )}

      </div>

      <NavMenu
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={navItems}
        anchorRef={buttonRef}
        headerRef={headerRef}
        isAuthenticated={isAuthenticated}
        accountName={user?.displayName || user?.email || ""}
        onLogout={handleLogout}
      />

    </header>
  );
}