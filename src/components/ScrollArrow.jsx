import { useEffect, useState } from "react";
import { FaCircleChevronUp } from "react-icons/fa6";
import styles from "./ScrollArrow.module.scss";

export default function ScrollArrow({ editorToolbar = false }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = null;
    function update() {
      frame = null;
      const doc = document.documentElement;
      const scrollHeight = Math.max(doc.scrollHeight, document.body.scrollHeight);
      const viewport = window.innerHeight;
      const offset = window.scrollY || doc.scrollTop;
      const scrollable = scrollHeight > viewport + 32;
      const nearBottom = offset + viewport >= scrollHeight - 140;
      setVisible(scrollable && offset > 100 && nearBottom);
    }
    function scheduleUpdate() {
      if (frame === null) frame = window.requestAnimationFrame(update);
    }
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    const resizeObserver = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(scheduleUpdate);
    resizeObserver?.observe(document.documentElement);
    resizeObserver?.observe(document.body);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver?.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  if (!visible) return null;
  return (
    <button type="button"
      className={`${styles.arrow} ${editorToolbar ? styles.withEditorToolbar : ""}`}
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
      <FaCircleChevronUp size={32}/>
    </button>
  );
}
