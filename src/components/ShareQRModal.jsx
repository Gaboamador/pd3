import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { buildPreviewParts } from "../utils/buildPreview";
import styles from "./ShareQrModal.module.scss";

export default function ShareQrModal({ url, onClose, sharedBuild }) {
  const { t } = useTranslation();
  if (!url) return null;
  
  const previewParts = buildPreviewParts(sharedBuild);
  
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.nameAndButtonWrapper}>
            <div className={styles.name}>{sharedBuild.name}</div>
            <button
              className={styles.close}
              onClick={onClose}
              aria-label={t('aria-label.close')}
            >
              ✕
            </button>
          </div>
            <div className={styles.preview}>
              {previewParts.map((p, i) => (
                <span key={i} className={styles.previewChip}>
                  {p}
                </span>
              ))}
            </div>
        </div>
        <div className={styles.modalBody}>
                <div className={styles.qrWrapper}>
                    <QRCodeSVG
                        value={url}
                        size={300}
                        level="M"
                        fgColor="#000000"
                        bgColor="#ffffff"
                    />
                    <img
                        src="/icons/icon-192.png"
                        alt="PD3"
                        className={styles.qrLogo}
                    />
                </div>

                <div className={styles.url}>
                  {url}
                </div>

                <div className={styles.copyButtonWrapper}>
                    <button
                        onClick={() => {
                        navigator.clipboard.writeText(url);
                        }}
                    >
                        {t('build.share.copy-link')}
                    </button>
                </div>
        </div>
      </div>
    </div>
  );
}
