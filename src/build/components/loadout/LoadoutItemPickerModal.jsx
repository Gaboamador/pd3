import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "../common/Modal";
import styles from "./LoadoutItemPickerModal.module.scss";
import { buildWeaponTypeLabels, getWeaponTypeLabel, orderWeaponTypes } from "../../utils/weaponTypeLabels";

const normalize = (value) => String(value ?? "").normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function LoadoutItemPickerModal({ open, onClose, title, itemsByType, renderCard }) {
  const { t } = useTranslation();
  const [filterType, setFilterType] = useState("");
  const [query, setQuery] = useState("");
  const itemTypes = useMemo(() => Object.keys(itemsByType), [itemsByType]);
  const orderedTypes = useMemo(() => orderWeaponTypes(itemTypes), [itemTypes]);
  const labelsMap = useMemo(() => buildWeaponTypeLabels(itemTypes), [itemTypes]);
  const itemsToShow = useMemo(() => {
    const items = filterType ? (itemsByType[filterType] ?? [])
      : orderedTypes.flatMap(type => itemsByType[type] ?? []);
    const term = normalize(query.trim());
    return term ? items.filter(item => normalize(item.name ?? item.key).includes(term)) : items;
  }, [filterType, query, orderedTypes, itemsByType]);

  function handleClose() {
    setFilterType("");
    setQuery("");
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} title={title} fixedMobileHeight>
      <div className={styles.wrapper}>
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="search"
            inputMode="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t('mobile.picker.search')}
            aria-label={t('mobile.picker.search')}
          />
          {itemTypes.length > 1 && (
            <>
              <div className={styles.selectWrapper}>
                <span className={styles.selectLabel}>{t('modal.title.weapon-type')}</span>
                <select className={styles.filter} value={filterType}
                  onChange={event => setFilterType(event.target.value)}>
                  <option value="">{t('select.option.all')}</option>
                  {orderedTypes.map(type => (
                    <option key={type} value={type}>{getWeaponTypeLabel(type, labelsMap)}</option>
                  ))}
                </select>
              </div>
              <div className={styles.mobileChips} role="group" aria-label={t('modal.title.weapon-type')}>
                <button type="button" className={`${styles.chip} ${!filterType ? styles.chipActive : ""}`}
                  aria-pressed={!filterType} onClick={() => setFilterType("")}>{t('select.option.all')}</button>
                {orderedTypes.map(type => (
                  <button type="button" key={type}
                    className={`${styles.chip} ${filterType === type ? styles.chipActive : ""}`}
                    aria-pressed={filterType === type}
                    onClick={() => setFilterType(type)}>{getWeaponTypeLabel(type, labelsMap)}</button>
                ))}
              </div>
            </>
          )}
        </div>
        {itemsToShow.length ? (
          <div className={styles.grid}>
            {itemsToShow.map(def => <div key={def.key} className={styles.cell}>{renderCard(def)}</div>)}
          </div>
        ) : <p className={styles.empty}>{t('mobile.picker.no-results')}</p>}
      </div>
    </Modal>
  );
}
