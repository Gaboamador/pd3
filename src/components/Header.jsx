import styles from "./Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import { logout } from "../../firebaseAuth";
import { IoPersonCircleSharp } from "react-icons/io5";


export default function Header() {
  
  const { isAuthenticated } = useAuth();
  
  function handleLogout() {
    logout();
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
        {/* <span className={styles.subtitle}>Random Build Generator</span> */}


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