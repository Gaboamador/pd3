import styles from "./Section.module.scss"

export default function Section({ title, children, overrideBg = false, stretch = false }) {
  return (
    <div className={`${styles.sectionWrapper} ${overrideBg ? styles.overrideBg : ""} ${stretch ? styles.stretch : ""}`}>
      <div className={styles.sectionTitle}>
        {title}
      </div>
      <div className={styles.sectionChildren}>
        {children}
      </div>
    </div>
  );
}
