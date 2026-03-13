
import { useTranslation } from "react-i18next";
import styles from "./Spinner.module.scss";

export default function Spinner({
  size = "md",
  label = "spinner.loading",
}) {
  const { t } = useTranslation();
  return (
    <div className={styles.wrapper}>
      <div className={`${styles.spinner} ${styles[size]}`} />
      {label && (
        <div className={styles.label}>
          {t(label)}
        </div>
      )}
    </div>
  );
}
