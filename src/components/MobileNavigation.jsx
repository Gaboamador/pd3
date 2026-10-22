import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/useAuth';
import {
  LuHouse, LuWrench, LuFolderOpen, LuSearch,
  LuDice5, LuTarget, LuFolderLock, LuShuffle,
} from 'react-icons/lu';
import { isToolRoute } from './mobileNavigationState.js';
import styles from './MobileNavigation.module.scss';

export default function MobileNavigation() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const { pathname } = location;
  const [openForLocation, setOpenForLocation] = useState(null);
  const randomButtonRef = useRef(null);
  const firstToolRef = useRef(null);
  const keyboardOpenRef = useRef(false);
  // La clave de React Router cambia al navegar, incluso si volvemos
  // a una ruta visitada. El menú nunca queda abierto entre páginas.
  const menuOpen = openForLocation === location.key;

  useEffect(() => {
    if (!menuOpen) return;

    if (keyboardOpenRef.current) {
      firstToolRef.current?.focus({ preventScroll: true });
      keyboardOpenRef.current = false;
    }

    function handleEscape(event) {
      if (event.key !== 'Escape') return;
      setOpenForLocation(null);
      randomButtonRef.current?.focus({ preventScroll: true });
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  if (pathname === '/auth') return null;

  const primaryLinks = [
    { to: '/', icon: <LuHouse />, label: t('nav.home'), end: true },
    { to: '/build-editor', icon: <LuWrench />, label: t('home.build-editor.title'), extraActive: pathname.startsWith('/s/') },
    { to: '/library-explorer', icon: <LuFolderOpen />, label: t('mobile.nav.library'), disabled: !isAuthenticated, extraActive: pathname.startsWith('/compare-builds') },
    { to: '/catalog', icon: <LuSearch />, label: t('home.catalog.title') },
  ];
  const toolLinks = [
    { to: '/library-roulette', icon: <LuTarget />, label: t('mobile.nav.roulette'), color: 'roulette' },
    { to: '/randomizer', icon: <LuDice5 />, label: t('home.randomizer.title'), color: 'randomizer' },
    { to: '/challenge-mode', icon: <LuFolderLock />, label: t('home.challenge-mode.title'), color: 'challenge' },
  ];

  function toggleRandom(event) {
    keyboardOpenRef.current = !menuOpen && event.detail === 0;
    setOpenForLocation(menuOpen ? null : location.key);
  }

  return (
    <nav className={styles.nav} aria-label={t('mobile.nav.label')}>
      <div
        className={`${styles.backdrop} ${menuOpen ? styles.backdropVisible : ''}`}
        aria-hidden="true"
        onClick={() => setOpenForLocation(null)}
      />

      <div
        id="mobile-nav-random-tools"
        className={`${styles.randomMenu} ${menuOpen ? styles.randomMenuVisible : ''}`}
        role="group"
        aria-label={t('mobile.nav.tools-group')}
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.menuHeading}>{t('mobile.nav.tools-group')}</div>
        {toolLinks.map((link, index) => (
          <NavLink
            key={link.to}
            ref={index === 0 ? firstToolRef : undefined}
            to={link.to}
            onClick={() => setOpenForLocation(null)}
            className={({ isActive }) =>
              `${styles.menuLink} ${styles[link.color]} ${isActive ? styles.menuActive : ''}`
            }
          >
            <span className={styles.menuIcon}>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </div>

      <div className={styles.bar}>
        {primaryLinks.map((link) => link.disabled ? (
          <span key={link.to} className={`${styles.link} ${styles.disabled}`} aria-disabled="true">
            {link.icon}<span>{link.label}</span>
          </span>
        ) : (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            onClick={() => setOpenForLocation(null)}
            className={({ isActive }) =>
              `${styles.link} ${isActive || link.extraActive ? styles.active : ''}`
            }
          >
            {link.icon}<span>{link.label}</span>
          </NavLink>
        ))}
        <button
          ref={randomButtonRef}
          type="button"
          className={`${styles.link} ${styles.toggle} ${isToolRoute(pathname) || menuOpen ? styles.active : ''}`}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-random-tools"
          aria-label={t('mobile.nav.tools-group')}
          onClick={toggleRandom}
        >
          <LuShuffle aria-hidden="true" /><span>{t('mobile.nav.random')}</span>
        </button>
      </div>
    </nav>
  );
}
