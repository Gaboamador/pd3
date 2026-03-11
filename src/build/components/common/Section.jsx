import styles from "./Section.module.scss"

export default function Section({ title, children, overrideBg = false }) {
  return (
    <div className={`${styles.sectionWrapper} ${overrideBg ? styles.overrideBg : ""}`}>
      <div className={styles.sectionTitle}>
        {title}
      </div>
      <div className={styles.sectionChildren}>
        {children}
      </div>
    </div>
  );
}
