import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { LuFolderLock, LuFolderOpen, LuRefreshCw, LuRotateCcw, LuX, LuLayers3 } from 'react-icons/lu';
import { CHALLENGE_BY_ID, CHALLENGE_COUNT_OPTIONS } from './data/challenges.js';
import { restoreChallengeSession } from './utils/dossierSession.js';
import { generateChallengeSet, rerollChallengeAt } from './utils/challengeGenerator.js';
import Section from '../build/components/common/Section.jsx';
import styles from './ChallengeMode.module.scss';

// Se mantiene la clave v1 para conservar los challenges de las sesiones anteriores.
const SESSION_KEY = 'pd3_challenge_mode_v1';
const CATEGORY_LABELS = {
  combat: 'Weapons & Combat',
  equipment: 'Equipment & Resources',
  skills: 'Skills & Builds',
};

function loadSession() {
  try {
    return restoreChallengeSession(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null; // Storage no disponible, p. ej. modo privado.
  }
}

function Dossier({ challenge, index, opened, onOpen, onReissue, onReissueOpened, t }) {
  const number = String(index + 1).padStart(2, '0');
  const [paperRevision, setPaperRevision] = useState(0);
  return (
    <motion.article
      layout="position"
      className={`${styles.file} ${opened ? styles.fileOpen : ''}`}
      initial={{ opacity: 0, y: 16, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.24 }}
    >
      <div className={styles.fileCaption} aria-hidden="true">
        <span>FIELD DOSSIER // {number}</span>
        <span>PD3–OP–{number}</span>
      </div>
      <div className={styles.stage}>
        <div className={styles.folder}>
          <span className={styles.folderTab} aria-hidden="true">OPERATIONS / {number}</span>
          <div className={styles.folderBack} aria-hidden="true" />
          <div className={styles.folderSheets} aria-hidden="true" />
            <div className={styles.paper}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={paperRevision}
                  className={styles.paperLeaf}
                  initial={{
                    x: '100%',
                    y: -8,
                    rotate: 5,
                    opacity: 0.9,
                  }}
                  animate={{
                    x: 0,
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                  }}
                  exit={{
                    x: '-30%',
                    y: 8,
                    rotate: -3,
                    opacity: 0,
                  }}
                  transition={{
                    duration: 0.38,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
            <div className={styles.paperBar} aria-hidden="true">
              <span>OPERATIONAL DIRECTIVE</span><span>PD3 // {number}</span>
            </div>
            {opened && (
              <div className={styles.paperContents}>
                <div className={`${styles.paperCategory} ${styles[`category_${challenge.category}`]}`}>
                  {CATEGORY_LABELS[challenge.category]}
                </div>
                <h3 className={styles.paperTitle}>{challenge.title}</h3>
                <p className={styles.paperText}>{challenge.description}</p>
              </div>
            )}
            <div className={styles.paperBottom} aria-hidden="true">
              <span>DIRECTIVE / SELF-IMPOSED</span><span className={styles.paperStamp}>EYES ONLY</span>
            </div>
            </motion.div>
          </AnimatePresence>
          </div>
          <div className={styles.folderCover} aria-hidden="true">
            <div className={styles.coverHeader}><strong>OPERATIONS DIVISION</strong><span>FILE {number}</span></div>
            <div className={styles.coverRef}>REF: PD3 / {number}<br />ACCESS: RESTRICTED<br />CONTENTS: SEALED</div>
            <span className={styles.coverStamp}>CLASSIFIED</span>
            <div className={styles.coverRule}><span>NOT FOR PUBLIC RELEASE</span><span>03 / PD3</span></div>
          </div>
          <span className={styles.cornerClip} aria-hidden="true" />
        </div>
        {!opened && (
          <button
            type="button"
            className={styles.folderTrigger}
            onClick={onOpen}
            aria-label={t('challenge.dossier.open-one', { number })}
          >
            <span>{t('challenge.dossier.tap-to-open')}</span>
          </button>
        )}
      </div>
      <div className={styles.fileControls}>
        <span className={`${styles.fileStatus} ${opened ? styles.statusOpened : styles.statusSealed}`}>
          <i className={styles.statusDot} aria-hidden="true" />
          {opened ? CATEGORY_LABELS[challenge.category] : t('challenge.dossier.sealed')}
        </span>
        <div className={styles.fileActions}>
          <button type="button" className={styles.reissue} onClick={onReissue}
            aria-label={t('challenge.dossier.reissue-one', { number })}>
            <span>{t('challenge.dossier.reissue')}</span>
          </button>
          <button
            type="button"
            className={styles.reissueOpened}
            onClick={() => {
              if (opened) {
                setPaperRevision((previous) => previous + 1);
              }
              onReissueOpened();
            }}
            aria-label={t('challenge.dossier.reissue-opened', { number })}
            title={t('challenge.dossier.reissue-opened', { number })}>
            <LuFolderOpen aria-hidden="true" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function ChallengeMode() {
  const { t } = useTranslation();
  const [initialState] = useState(loadSession);
  const [count, setCount] = useState(initialState?.count ?? 1);
  const [ids, setIds] = useState(initialState?.ids ?? []);
  const [opened, setOpened] = useState(initialState?.opened ?? []);
  const [notice, setNotice] = useState('');
  const [issueVersion, setIssueVersion] = useState(0);

  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, count, generatedCount: ids.length, ids, opened }));
    } catch { /* Almacenamiento deshabilitado */ }
  }, [count, ids, opened]);

  function issue(countToGenerate) {
    const generated = generateChallengeSet(countToGenerate);
    if (!generated) {
      setNotice(t('challenge.msg.no-set'));
      return;
    }
    setIds(generated);
    setIssueVersion((previous) => previous + 1);
    setOpened(generated.map(() => false));
    setNotice('');
  }

  function reset() {
    setCount(1);
    setIds([]);
    setOpened([]);
    setNotice('');
  }

  function rerollOne(index, openImmediately = false) {
    const generated = rerollChallengeAt(ids, index);
    if (!generated) {
      setNotice(t('challenge.msg.no-alternatives'));
      return;
    }
    setIds(generated);
    setOpened((previous) => previous.map((value, i) => i === index ? openImmediately : value));
    setNotice('');
  }

  return (
    <main className={styles.page}>
      <Section>
        <div className={styles.content}>
          <section className={styles.controls} aria-label={t('challenge.dossier.controls')}>
            <span className={styles.controlLabel} id="challenge-count-label">{t('challenge.dossier.issue-count')}</span>
            <div className={styles.selector} role="group" aria-labelledby="challenge-count-label">
              {CHALLENGE_COUNT_OPTIONS.map((option) => (
                <button type="button" key={option} aria-pressed={count === option}
                  className={styles.countButton} onClick={() => { setCount(option); setNotice(''); }}>
                  {option}
                </button>
              ))}
            </div>
            <button type="button" className={styles.issueButton} onClick={() => issue(count)}>
              {t('challenge.dossier.issue')}
            </button>
            <div className={styles.subTools}>
              <button type="button" onClick={() => setOpened(ids.map(() => true))} disabled={!ids.length || opened.every(Boolean)}>
                {t('challenge.dossier.open-all')}
              </button>
              <button type="button" onClick={() => issue(ids.length)} disabled={!ids.length}>
                {t('challenge.dossier.reissue-all')}
              </button>
              <button type="button" onClick={reset} disabled={!ids.length}>
                {t('challenge.actions.reset')}
              </button>
            </div>
          </section>

          <section className={styles.desk} aria-label={t('challenge.dossier.operations-table')}>
            <div className={styles.deskHeading}>
              <strong>{ids.length ? t('challenge.dossier.table-count', { count: ids.length }) : t('challenge.dossier.table-empty')}</strong>
              <span>SECTOR 03 — PD3</span>
            </div>
            {ids.length ? (
              <div className={`${styles.files} ${styles[`filesCount${ids.length}`]}`}>
                <AnimatePresence initial={false}>
                  {ids.map((id, index) => (
                    <Dossier
                      key={`${issueVersion}-${index}`}
                      challenge={CHALLENGE_BY_ID[id]}
                      index={index}
                      opened={opened[index] ?? false}
                      onOpen={() => setOpened((previous) => previous.map((value, i) => i === index ? true : value))}
                      onReissue={() => rerollOne(index, false)}
                      onReissueOpened={() => rerollOne(index, true)}
                      t={t}
                    />
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className={styles.empty}>
                <div className={styles.emptyIcon} aria-hidden="true">
                  <LuFolderLock />
                </div>
                <h2>{t('challenge.dossier.empty-title')}</h2>
                <p>{t('challenge.dossier.empty-desc')}</p>
              </div>
            )}
          </section>
          {ids.length !== count && ids.length > 0 && <p className={styles.smallNotice}>{t('challenge.msg.count-next')}</p>}
          {notice && <p className={styles.notice} role="status">{notice}</p>}
        </div>
      </Section>
    </main>
  );
}
