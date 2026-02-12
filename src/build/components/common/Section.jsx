import styles from "./Section.module.scss"

export default function Section({ title, children }) {
  return (
    <div className={styles.sectionWrapper}>
      <div className={styles.sectionTitle}>
        {title}
      </div>
      <div className={styles.sectionChildren}>
        {children}
      </div>
    </div>
  );
}
