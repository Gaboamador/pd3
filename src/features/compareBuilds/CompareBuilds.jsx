import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CompareBuilds.module.scss";
import Section from "../../build/components/common/Section";
import ComparisonGrid from "./components/ComparisonGrid";
import { compareBuildGroup } from "./utils/compareBuildGroup";
import { loadCompareBuilds, saveCompareBuilds } from "./utils/compareBuildsSession";
import ScrollArrow from "../../components/ScrollArrow";

// Data
import skillsData from "../../data/payday3_skills.json";
import loadoutData from "../../data/payday3_loadout_items.json";

export default function CompareBuilds() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedBuilds, setSelectedBuilds] = useState([]);

    // 0) Volver a posición de scroll donde estaba cuando se fue a otro componente
    useEffect(() => {
    const saved = sessionStorage.getItem("pd3_compare_scroll");

    if (!saved) return;

    const y = parseInt(saved, 10);

    requestAnimationFrame(() => {
        window.scrollTo({
        top: y,
        behavior: "instant"
        });
    });

    sessionStorage.removeItem("pd3_compare_scroll");
    }, []);

  // 1) Hydrate from location.state OR sessionStorage
  useEffect(() => {
    const fromState = location?.state?.builds;
    if (Array.isArray(fromState) && fromState.length) {
      setSelectedBuilds(fromState);
      saveCompareBuilds(fromState);
      return;
    }

    const fromSession = loadCompareBuilds();
    if (Array.isArray(fromSession) && fromSession.length) {
      setSelectedBuilds(fromSession);
    }
  }, [location?.state]);

  // 2) Compute diff result
  const result = useMemo(() => {
    if (!selectedBuilds || selectedBuilds.length < 2) return null;

    return compareBuildGroup(selectedBuilds, {
      skillsData,
      loadoutData,
      t
    });
  }, [selectedBuilds, t]);

  // 3) Go back one step
  const onBack = () => {
    navigate(-1);
  };

  // 4) Give format to **semantic highlight**
    function renderInsightText(text) {
    if (!text) return text;

    const parts = text.split(/(\*\*.*?\*\*|\[\[.*?\]\])/g);

    return parts.map((part, i) => {

        // **semantic tag**
        if (part.startsWith("**") && part.endsWith("**")) {
        const value = part.slice(2, -2);
        return (
            <span key={i} className={styles.semanticHighlight}>
            {value}
            </span>
        );
        }

        // [[build name]]
        if (part.startsWith("[[") && part.endsWith("]]")) {
        const value = part.slice(2, -2);
        return (
            <span key={i} className={styles.buildHighlight}>
            {value}
            </span>
        );
        }

        return part;
    });
    }

    // 5) Render empty page if component is entered without selected builds to compare
  if (!selectedBuilds || selectedBuilds.length < 2) {
    return (
    <div className={styles.page}>
        <div className={styles.wrapper}>
            <Section>
                <div className={styles.headerRow}>
                    <div className={styles.headerTitle}>{t('title.compare.main')}</div>
                    <div className={styles.headerActions}>
                        <button className="secondary" onClick={onBack}>{t('nav.back')}</button>
                    </div>
                </div>
                <div className={styles.subtitle}>
                    {t('compare.msg.no-builds1')}
                </div>

                <div className={styles.empty}>
                    {t('compare.msg.no-builds2')}
                </div>
            </Section>
        </div>
    </div>
    );
  }

    // 6) Calcula la cantidad máxima de strenghts para crear las filas del grid comparativo
    const maxStrengths = Math.max(
    ...result.builds.map(id => result.strengths[id]?.length || 0)
    );

  // 7) Calcula la cantidad máxima de skills únicas para crear las filas del grid comparativo
    const maxUniqueSkills = Math.max(
    ...result.builds.map(id => result.highlights[id].uniqueSkills.length)
    );



  // -1) Return null if there's no result
  if (!result) return null;


//   RETURN
  return (
    <div className={styles.page}>
        <div className={styles.wrapper}>
            <Section>
                <div className={styles.headerRow}>
                    <div className={styles.headerTitle}>{t('title.compare.main')}</div>
                    <div className={styles.headerActions}>
                        <button className="secondary" onClick={onBack}>{t('nav.back')}</button>
                    </div>
                </div>
            </Section>

            {/* Skill diffs grids */}
            <Section title={t('section.title.compare.skills')}>
              {result.sections.map((sec) => (
                  <ComparisonGrid
                  key={`${sec.kind}:${sec.title}`}
                  title={sec.title}
                  buildIds={result.builds}
                  builds={selectedBuilds}
                  buildLabels={result.buildLabels}
                  rows={sec.rows}
                  showLevel={sec.kind === "skills"}
                  />
              ))}
            </Section>

            <Section title={t('section.title.compare.strenghts')}>
                <div
                  className={styles.buildChipsWrapper}
                  style={{ "--cols": result.builds.length }}
                >
                  {result.builds.map(id => (
                    <div key={`header-${id}`} className={styles.buildChipTitle}>
                      {result.buildLabels[id]}
                    </div>
                  ))}

                  {Array.from({ length: maxStrengths }).map((_, row) =>
                    result.builds.map(id => {
                      const strength = result.strengths[id]?.[row];

                      return (
                        <div key={`${id}-${row}`} className={styles.strengthCell}>
                          {strength ? <div>{strength}</div> : null}
                        </div>
                      );
                    })
                  )}
                </div>
            </Section>
            
            {/* Highlights per build */}
            <Section title={t('section.title.compare.highligths')}>
              <div className={styles.highlightGrid} style={{ "--cols": result.builds.length }}>
                {/* fila 1: nombre del build */}
                {result.builds.map(id => (
                    <div key={id} className={styles.header}>
                      {result.buildLabels?.[id] || id}
                    </div>
                  ))}
                {/* fila 2: subtítulo */}
                {result.builds.map(id => {
                  const hasSkills = (result.highlights[id]?.uniqueSkills?.length || 0) > 0;
                  return (
                    <div key={`subtitle-${id}`} className={`${styles.subHeader} ${hasSkills ? styles.hasSkills : ""}`}>
                      {hasSkills ? t('compare.unique') : "-"}
                    </div>
                  );
                })}
                {/* filas de unique skills */}
                  {Array.from({ length: maxUniqueSkills }).map((_, row) =>
                    result.builds.map(id => {
                      const skill = result.highlights[id].uniqueSkills[row];
                      return (
                        <div key={`${id}-${row}`} className={styles.cell}>
                          {skill ? (
                            <>
                              {skill.label}
                              <span className={`${styles.pill} ${skill.level === "aced" ? styles.aced : ""}`}>
                                {skill.level}
                              </span>
                            </>
                          ) : null}
                        </div>
                      );
                    })
                  )}
              </div>
            </Section>

            {/* Semantic insights */}
            <Section title={t('section.title.compare.semantic')}>
                {result.semanticInsights.length === 0 ? (
                <div className={styles.muted}>{t('compare.msg.no-insights')}</div>
                ) : (
                <ul className={styles.insightList}>
                    {result.semanticInsights.map((ins) => (
                    <li key={ins.tag} className={styles.insight}>
                        <div className={styles.insightTag}>{ins.label}</div>
                        <div className={styles.insightText}>{renderInsightText(ins.text)}</div>
                    </li>
                    ))}
                </ul>
                )}
            </Section>
        </div>

        <ScrollArrow/>
    </div>
  );
}