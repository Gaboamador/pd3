import styles from "./Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../../firebaseAuth";
import { IoPersonCircleSharp } from "react-icons/io5";


export default function Header() {
  
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  function handleLogout() {
    logout();
  }

  const pathname = location.pathname;

  let subtitle = null;

  if (pathname.startsWith("/build-editor")) {
    subtitle = "Build Editor";
  } else if (pathname.startsWith("/randomizer")) {
    subtitle = "Randomizer";
  }

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
        <button onClick={handleLogout}>LOGOUT</button>
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