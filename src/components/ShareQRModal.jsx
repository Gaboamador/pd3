import { QRCodeSVG } from "qrcode.react";
import styles from "./ShareQrModal.module.scss";

export default function ShareQrModal({ url, onClose }) {
  if (!url) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Share build</h3>
            <button
              className={styles.close}
              onClick={onClose}
              aria-label="Close"
            >
              ✕
            </button>
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
                        Copy link
                    </button>
                </div>
        </div>
      </div>
    </div>
  );
}
