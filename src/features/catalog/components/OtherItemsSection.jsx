import styles from "./OverkillStatsSection.module.scss";

export default function OtherItemsSection({ item }) {
  if (!item) return null;

  const description = item.description?.trim();

  if (!description) return null;

  return (
    // <section>
    //   <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{description}</p>
    // </section>
                <div className={styles.tierCard}>
                  <div className={styles.tierDescription} style={{ whiteSpace: "pre-wrap" }}>
                    {description}
                  </div>
                </div>
  );
}