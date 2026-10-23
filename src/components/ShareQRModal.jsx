import { useTranslation } from "react-i18next";
import { QRCodeSVG } from "qrcode.react";
import { buildPreviewParts } from "../utils/buildPreview";
import Spinner from "./Spinner";
import { IoClose } from "react-icons/io5";
import styles from "./ShareQRModal.module.scss";

export default function ShareQrModal({ url, fallbackUrl, status = "original", onClose, sharedBuild }) {
  const { t } = useTranslation();
  if (!url) return null;

  const isGenerating = status === "loading";
  const previewParts = buildPreviewParts(sharedBuild);

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label={sharedBuild.name || t('build.library.label.fallbackName')}>
        <div className={styles.modalHeader}>
          <div className={styles.nameAndButtonWrapper}>
            <div className={styles.name}>{sharedBuild.name}</div>
            <button
              type="button"
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

        <div className={styles.modalBody} aria-busy={isGenerating}>
          {isGenerating ? (
            <div className={styles.loadingState} role="status">
              <Spinner size="lg" label="build.share.preparing-short" />
            </div>
          ) : (
            <>
              <div className={styles.qrWrapper}>
                <QRCodeSVG
                  value={url}
                  size={300}
                  level={status === "short" ? "H" : "M"}
                  fgColor="#000000"
                  bgColor="#ffffff"
                />
                <img
                  src="/icons/icon-192.png"
                  alt="PD3"
                  className={styles.qrLogo}
                />
              </div>

              {status === "fallback" && (
                <div className={styles.linkStatus} role="status">{t('build.share.using-original')}</div>
              )}
              <div className={styles.url}>{url}</div>

              <div className={styles.copyButtonWrapper}>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(url)}
                >
                  {t('build.share.copy-link')}
                </button>
                {status === "short" && fallbackUrl && fallbackUrl !== url && (
                  <button
                    type="button"
                    className={styles.originalLinkButton}
                    onClick={() => navigator.clipboard.writeText(fallbackUrl)}
                    title={t('build.share.original-help')}
                  >
                    {t('build.share.copy-original')}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
