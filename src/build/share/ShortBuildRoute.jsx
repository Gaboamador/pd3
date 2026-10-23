import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Spinner from '../../components/Spinner.jsx';
import BuildEditor from '../BuildEditor.jsx';
import { getShortBuild } from './shortBuildLinks.service.js';

/** El navegador permanece en /q/:shortId; no hay redirección a /s/:encoded. */
export default function ShortBuildRoute() {
  const { shortId } = useParams();
  const { t } = useTranslation();
  const [retry, setRetry] = useState(0);
  const [state, setState] = useState({ status: 'loading', build: null });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', build: null });
    getShortBuild(shortId)
      .then(build => { if (active) setState({ status: 'ready', build }); })
      .catch(error => { if (active) setState({ status: 'error', error }); });
    return () => { active = false; };
  }, [shortId, retry]);

  if (state.status === 'loading') {
    return <Spinner label={t('build.share.loading-shared')} />;
  }
  if (state.status === 'error') {
    return (
      <main style={{ maxWidth: 540, margin: '48px auto', padding: 24, textAlign: 'center' }}>
        <h2>{t('build.share.short-link-error-title')}</h2>
        <p>{t('build.share.short-link-error')}</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          <button type="button" onClick={() => setRetry(value => value + 1)}>{t('build.share.retry')}</button>
          <Link to="/">{t('build.share.go-home')}</Link>
        </div>
      </main>
    );
  }
  return <BuildEditor key={shortId} mode="share" initialSharedBuild={state.build} />;
}
