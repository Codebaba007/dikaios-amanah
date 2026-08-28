import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { TrustIndicator } from '../components/UI';

const Home = () => {
  const { t } = useTranslation();
  const pillars = ['verified', 'transparent', 'musharakah', 'documents', 'audit'];
  return <div className="container">
    <section className="hero"><div className="hero__grid">
      <div className="hero__content"><p className="eyebrow">{t('home.eyebrow')}</p><h1>{t('home.title')}</h1><p className="hero__lede">{t('home.subtitle')}</p><div className="hero__actions"><Link className="btn btn-primary" to="/investor/campaigns">{t('home.explore')}</Link><Link className="btn btn-secondary" to="/register">{t('home.join_business')}</Link><Link className="btn btn-secondary" to="/register">{t('home.join_investor')}</Link></div><p className="hero__note">{t('home.mvp_note')}</p></div>
      <aside className="hero__panel"><p className="eyebrow">{t('home.trust_panel_eyebrow')}</p><h2>{t('home.trust_panel_title')}</h2><p>{t('home.trust_panel_body')}</p><div className="hero__signal"><span>✓</span><div>{t('home.trust_signal_one')}</div></div><div className="hero__signal"><span>✓</span><div>{t('home.trust_signal_two')}</div></div></aside>
    </div></section>
    <section><p className="eyebrow" style={{ marginTop: '2.5rem' }}>{t('home.pillars_eyebrow')}</p><h2>{t('home.pillars_title')}</h2><div className="pillar-grid">{pillars.map((pillar, index) => <article className="pillar" key={pillar}><span className="pillar__number">0{index + 1}</span><h3>{t(`home.pillars.${pillar}.title`)}</h3><p>{t(`home.pillars.${pillar}.body`)}</p></article>)}</div></section>
    <section className="dashboard-grid" style={{ marginTop: '2.5rem' }}><div className="card"><h2>{t('home.trust_section_title')}</h2><p>{t('home.trust_section_body')}</p></div><TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} /></section>
  </div>;
};

export default Home;
