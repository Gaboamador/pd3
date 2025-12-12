import styles from "../styles/Header.module.scss";
import pd3_logo_alt from "../assets/pd3_logo_alt.svg";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {/* <h1 className={styles.title}>Random Build Generator</h1> */}
        <img src={pd3_logo_alt} alt="Payday 3 Logo" className={styles.logo} />
        <span className={styles.subtitle}>Random Build Generator</span>
      </div>
      {/* <div className={styles.pd3Logo}>PAYDAY<span className={styles.num}>3</span></div> */}
    </header>
  );
}