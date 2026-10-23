import { useState } from "react";
import { useTranslation } from "react-i18next";
import { LuSearch, LuX, LuFolderOpen, LuChevronDown, LuChevronUp, LuTrash2 } from "react-icons/lu";
import { getBuildLibraryDetails, matchesBuildLibrarySearch } from "../utils/buildPreview";
import styles from "./BuildLibrary.module.scss";

function SlotBadge({ slot, isActive = false}) {
  if (slot == null) return <span className={`${styles.slotEmpty} ${isActive ? styles.activeSlot : ""}`}>—</span>;
  return <span className={`${styles.slotBadge} ${isActive ? styles.activeSlot : ""}`}>{slot <= 9 ? String(slot).padStart(2, "0") : `Alt ${slot}`}</span>;
}

function SlotSelect({ slot, onChange, id }) {
  const { t } = useTranslation();
  return (
    <div className={styles.slotSelectWrapper}>
      <select
        id={id}
        className={styles.slotSelect}
        value={slot ?? ""}
        onChange={event => onChange(event.target.value === "" ? null : Number(event.target.value))}
      >
        <option value="">{t("build.slot.unassigned")}</option>
        <optgroup label={t("build.slot.main")}>
          {Array.from({ length: 10 }, (_, i) => (
            <option key={i} value={i}>Main · {String(i).padStart(2, "0")}</option>
          ))}
        </optgroup>
        <optgroup label={t("build.slot.alternative")}>
          {Array.from({ length: 31 }, (_, i) => (
            <option key={i + 10} value={i + 10}>Alt · {i + 10}</option>
          ))}
        </optgroup>
      </select>
      <LuChevronDown size={16} aria-hidden="true" />
    </div>
  );
}

const DETAIL_FIELDS = ["primary", "secondary", "overkill", "armor", "throwable", "deployable", "tool"];
const DETAIL_LABELS = {
  primary: "build.library.field.primary",
  secondary: "build.library.field.secondary",
  overkill: "build.library.field.overkill",
  armor: "build.library.field.armor",
  throwable: "build.library.field.throwable",
  deployable: "build.library.field.deployable",
  tool: "build.library.field.tool",
};

export default function BuildLibrary({ builds, currentBuildId, onLoadBuild, onDeleteBuild, onAssignSlot }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [showAllDetails, setShowAllDetails] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const visibleBuilds = builds.filter(build => matchesBuildLibrarySearch(build, query));

  return (
    <section className={styles.library} aria-label={t("build.library.title.saved")}>
      <div className={styles.stickyHeader}>
        <div className={styles.headerTop}>
          <span className={styles.resultCount}>
            {query.trim()
              ? t("build.library.results.filtered", { visible: visibleBuilds.length, total: builds.length })
              : t("build.library.results.total", { count: builds.length })}
          </span>
        </div>
        <div className={styles.searchField}>
          <LuSearch aria-hidden="true" size={21} />
          <input
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={t("build.library.search.placeholder")}
            aria-label={t("build.library.search.placeholder")}
          />
          {query && (
            <button type="button" className={styles.clearButton}
              onClick={() => setQuery("")} aria-label={t("build.library.search.clear")}>
              <LuX size={19} />
            </button>
          )}
        </div>
        <div className={styles.headerActions}>
          <button type="button" className={styles.allDetailsButton}
            aria-pressed={showAllDetails}
            onClick={() => setShowAllDetails(value => !value)}
            disabled={!builds.length}>
            {showAllDetails ? <LuChevronUp size={17} aria-hidden="true" /> : <LuChevronDown size={17} aria-hidden="true" />}
            {t(showAllDetails ? "build.library.actions.hide-all-details" : "build.library.actions.show-all-details")}
          </button>
        </div>
      </div>

      {!builds.length ? <p className={styles.empty}>{t("build.library.msg.no-saved")}</p> :
        visibleBuilds.length === 0 ? (
          <p className={styles.empty}>
            {t("build.library.search.no-results")}
            <button type="button" className={styles.resetButton} onClick={() => setQuery("")}>
              {t("build.library.search.clear")}
            </button>
          </p>
        ) : (
          <ul className={styles.list}>
            {visibleBuilds.map(build => {
              const isActive = build.id === currentBuildId;
              const isManaging = expandedId === build.id;
              const showDetails = showAllDetails || isManaging;
              const details = getBuildLibraryDetails(build);
              const label = build.name?.trim() || t("build.library.label.fallbackName");
              const detailId = `build-library-details-${build.id}`;
              const slotId = `build-library-slot-${build.id}`;

              return (
                <li key={build.id} className={`${styles.item} ${isActive ? styles.active : ""}`}>
                  <div className={styles.row}>
                    <SlotBadge slot={build.slot} isActive={isActive} />
                    <div className={styles.meta}>
                      <div className={styles.name} title={label}>{label}</div>
                      <div className={styles.preview}>
                        <span>{details.primary || "—"}</span><span aria-hidden="true">·</span><span>{details.secondary || "—"}</span>
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      {isActive ? <span className={styles.activeLabel}>{t("build.library.label.active")}</span> : (
                        <button type="button" className={styles.openButton}
                          onClick={() => onLoadBuild(build)}
                          title={`${t("build.library.actions.set-active")}: ${label}`}
                          aria-label={`${t("build.library.actions.set-active")}: ${label}`}>
                          <LuFolderOpen size={23} aria-hidden="true" />
                        </button>
                      )}
                      <button type="button" className={styles.expandButton}
                        aria-expanded={isManaging}
                        aria-controls={detailId}
                        title={t(isManaging ? "build.library.actions.close-details" : "build.library.actions.manage-details")}
                        aria-label={`${t(isManaging ? "build.library.actions.close-details" : "build.library.actions.manage-details")}: ${label}`}
                        onClick={() => setExpandedId(isManaging ? null : build.id)}>
                        {isManaging ? <LuChevronUp size={22} aria-hidden="true" /> : <LuChevronDown size={22} aria-hidden="true" />}
                      </button>
                    </div>
                  </div>

                  {showDetails && (
                    <div id={detailId} className={styles.expanded}>
                      <h4 className={styles.detailTitle}>{t("build.library.details.title")}</h4>
                      <div className={styles.detailGrid}>
                        {DETAIL_FIELDS.map(field => (
                          <div className={styles.detailCell} key={field}>
                            <span className={styles.detailLabel}>{t(DETAIL_LABELS[field])}</span>
                            <span className={styles.detailValue}>{details[field] || "—"}</span>
                            {field === "armor" && details.plates && (
                              <span className={styles.platesValue}>{t("build.library.field.plates")}: {details.plates}</span>
                            )}
                          </div>
                        ))}
                      </div>
                      {isManaging && (
                        <div className={styles.controls}>
                          <div className={styles.slotField}>
                            <label htmlFor={slotId}>{t("build.library.field.slot")}</label>
                            <SlotSelect id={slotId} slot={build.slot}
                              onChange={slot => onAssignSlot(build.id, slot)} />
                          </div>
                          <button type="button" className={styles.deleteBtn}
                            onClick={() => onDeleteBuild(build.id)}>
                            <LuTrash2 aria-hidden="true" size={17} />
                            {t("build.library.actions.delete-build")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
    </section>
  );
}
