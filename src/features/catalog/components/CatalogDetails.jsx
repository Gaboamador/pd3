import styles from "./CatalogDetails.module.scss";
import GenericItemDetailsCard from "./GenericItemDetailsCard";

export default function CatalogDetails({ item }) {
  if (!item) return null;

  return (
    <div className={styles.wrapper}>
      <GenericItemDetailsCard item={item} />
    </div>
  );
}