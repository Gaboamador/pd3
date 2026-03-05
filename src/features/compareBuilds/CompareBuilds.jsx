// src/features/compareBuilds/CompareBuilds.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./CompareBuilds.module.scss";
import Section from "../../build/components/common/Section";
import ComparisonGrid from "./components/ComparisonGrid";
import { compareBuildGroup } from "./utils/compareBuildGroup";
import { loadCompareBuilds, saveCompareBuilds, clearCompareBuilds } from "./utils/compareBuildsSession";
import ScrollArrow from "../../components/ScrollArrow";

// Data
import skillsData from "../../data/payday3_skills.json";
import loadoutData from "../../data/payday3_loadout_items.json";

export default function CompareBuilds() {
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedBuilds, setSelectedBuilds] = useState([]);

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
      loadoutData
    });
  }, [selectedBuilds]);

  const onClear = () => {
    clearCompareBuilds();
    setSelectedBuilds([]);
    // opcional: volver a donde estabas
    // navigate("/library-explorer");
  };

  const onBack = () => {
    navigate(-1);
  };

  if (!selectedBuilds || selectedBuilds.length < 2) {
    return (
    //   <div className={styles.page}>
    //     <header className={styles.header}>
    //       <div className={styles.headerRow}>
    //         <h1 className={styles.h1}>Compare Builds</h1>
    //         <div className={styles.headerActions}>
    //           <button className="secondary" onClick={onBack}>BACK</button>
    //           <button className="secondary" onClick={onClear}>CLEAR</button>
    //         </div>
    //       </div>

    //       <div className={styles.subtitle}>
    //         Select 2–4 builds and enter this screen. On case of refreshing, it persists.
    //       </div>
    //     </header>

    //     <div className={styles.empty}>
    //       No selected builds.
    //     </div>
    //   </div>
    <div className={styles.page}>
        <div className={styles.wrapper}>
            <Section>
                <div className={styles.headerRow}>
                    <div className={styles.headerTitle}>Compare Builds</div>
                    <div className={styles.headerActions}>
                        <button className="secondary" onClick={onBack}>BACK</button>
                        {/* <button className="secondary" onClick={onClear}>CLEAR</button> */}
                    </div>
                </div>
                <div className={styles.subtitle}>
                    Select 2–4 builds and enter this screen.
                </div>

                <div className={styles.empty}>
                    No selected builds.
                </div>
            </Section>
        </div>
    </div>
    );
  }

  if (!result) return null;

  return (
    <div className={styles.page}>
        <div className={styles.wrapper}>
            <Section>
                <div className={styles.headerRow}>
                    <div className={styles.headerTitle}>Compare Builds</div>
                    <div className={styles.headerActions}>
                        <button className="secondary" onClick={onBack}>BACK</button>
                        {/* <button className="secondary" onClick={onClear}>CLEAR</button> */}
                    </div>
                </div>
            </Section>


            {/* Skill diffs grids */}
            <Section title="//SKILLS_COMPARISON">
                {result.sections.map((sec) => (
                    <ComparisonGrid
                    key={`${sec.kind}:${sec.title}`}
                    title={sec.title}
                    buildIds={result.builds}
                    buildLabels={result.buildLabels}
                    rows={sec.rows}
                    showLevel={sec.kind === "skills"}
                    />
                ))}
            </Section>


            <Section title="//BUILDS_STRENGTHS">
            <div className={styles.buildChipsWrapper}>
                    {result.builds.map(id => (
                    <div key={id} className={styles.buildChip}>
                    <div className={styles.buildChipTitle}>{result.buildLabels[id]}</div>

                    <div className={styles.archetypes}>
                    {/* <div className={styles.archetypeBadgeWrapper}>
                    {result.archetypes[id]?.map(a => (
                        <span key={a} className={styles.archetypeBadge}>
                        {a}
                        </span>
                    ))}
                    </div> */}
                    {result.strengths[id]?.length > 0 && (
                    <ul className={styles.strengths}>
                        {result.strengths[id].map(s => (
                        <li key={s}>{s}</li>
                        ))}
                    </ul>
                    )}
                    </div>
                </div>
                ))}
            </div>
            </Section>
        

        {/* Highlights per build */}
        <Section title="//BUILDS_HIGHLIGHTS">
            

            <div className={styles.highlightWrapper}>
            {result.builds.map((id) => {
                const h = result.highlights[id];
                return (
                <div key={id} className={styles.card}>
                    <div className={styles.cardTitle}>{result.buildLabels?.[id] || id}</div>

                    <div className={styles.block}>
                    <div className={styles.blockTitle}>Unique skills</div>
                    {h.uniqueSkills.length === 0 ? (
                        <div className={styles.muted}>None</div>
                    ) : (
                        <ul className={styles.list}>
                        {h.uniqueSkills.map((s) => (
                            <li key={s.key}>
                            {s.label}{" "}
                            <span className={`${styles.pill} ${s.level === "aced" ? styles.aced : ""}`}>{s.level}</span>
                            </li>
                        ))}
                        </ul>
                    )}
                    </div>

                    {/* TAGS */}
                    {/* <div className={styles.block}>
                    <div className={styles.blockTitle}>Tags</div>
                    {h.tags.length === 0 ? (
                        <div className={styles.muted}>None</div>
                    ) : (
                        <div className={styles.tags}>
                        {h.tags.map((t) => (
                            <span key={t} className={styles.tag}>{t}</span>
                        ))}
                        </div>
                    )}
                    </div> */}
                </div>
                );
            })}
            </div>
        </Section>

        {/* Semantic insights */}
        <Section title="//BUILDS_SEMANTIC_COMPARISON">
            {result.semanticInsights.length === 0 ? (
            <div className={styles.muted}>No available insights (add tags in skillSemanticTags).</div>
            ) : (
            <ul className={styles.insightList}>
                {result.semanticInsights.map((ins) => (
                <li key={ins.tag} className={styles.insight}>
                    <div className={styles.insightTag}>{ins.label}</div>
                    <div className={styles.insightText}>{ins.text}</div>
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