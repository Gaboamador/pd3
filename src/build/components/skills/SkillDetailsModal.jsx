import { useTranslation } from "react-i18next";
import SkillSection from "../../../components/SkillSection";
import styles from './SkillDetailsModal.module.scss'

export default function SkillDetailsModal({ open, onClose, skill, equippedCount, enableTotals = false }) {
  const { t } = useTranslation();
  if (!open || !skill) return null;

  return (
   <div role="dialog" aria-modal="true" onClick={onClose} className={styles.overlay}>
      <div onClick={(e) => e.stopPropagation()} className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>{skill.name}</div>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            {t('modal.actions.close')}
          </button>
        </div>

        <SkillSection skill={skill} equippedCount={equippedCount} enableTotals={enableTotals}/>
      </div>
    </div>
);
}