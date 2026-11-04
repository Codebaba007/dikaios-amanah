import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  BadgeCheck, FileCheck2, Handshake, Link2, ShieldCheck
} from 'lucide-react';
import { SmartImage } from '../components/UI';
import { getImage } from '../lib/images';

const Hero = () => {
  const { t } = useTranslation();
  const heroImg = getImage('hero');
  return (
    <section className="landing-hero-band">
      <div className="hero-media">
        <div className="hero-media__img">
          <img src={heroImg.src} alt={heroImg.alt} />
        </div>
        <div className="hero-media__content">
          <p className="hero-mark">{t('home.eyebrow')}</p>
          <h1>{t('home.title')}</h1>
          <p>{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-gold btn-lg">{t('home.join_investor')}</Link>
            <Link to="/register" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>
              {t('home.join_business')}
            </Link>
          </div>
          <p className="hero-note"><ShieldCheck size={16} aria-hidden="true" /> {t('home.mvp_note')}</p>
        </div>
      </div>

      <div className="hero-strip">
        <span className="hero-strip__item"><BadgeCheck size={18} aria-hidden="true" /> {t('home.hero_strip_one')}</span>
        <span className="hero-strip__item"><FileCheck2 size={18} aria-hidden="true" /> {t('home.hero_strip_two')}</span>
        <span className="hero-strip__item"><Link2 size={18} aria-hidden="true" /> {t('home.hero_strip_three')}</span>
      </div>
    </section>
  );
};

const CATEGORY_KEYS = ['agriculture', 'textile', 'food', 'manufacturing', 'retail', 'logistics'];

const Categories = () => {
  const { t } = useTranslation();
  return (
    <section className="section">
      <p className="eyebrow">{t('home.categories_eyebrow')}</p>
      <h2 style={{ maxWidth: '640px', marginBottom: '0.5rem' }}>{t('home.categories_title')}</h2>
      <p style={{ maxWidth: '640px' }}>{t('home.categories_body')}</p>
      <div className="grid grid--3 category-grid" style={{ marginTop: '1.75rem' }}>
        {CATEGORY_KEYS.map(key => {
          const image = getImage(key);
          return (
            <article className="category-card" key={key}>
              <SmartImage src={image.src} alt={image.alt} aspectClass="media--3x2" overlay />
              <div className="category-card__body">
                <h3>{t(`home.categories.${key}.title`)}</h3>
                <p>{t(`home.categories.${key}.body`)}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

const Process = () => {
  const { t } = useTranslation();
  const steps = ['one', 'two', 'three', 'four'];
  return (
    <section className="section">
      <div className="split-band">
        <div>
          <p className="eyebrow">{t('home.process_eyebrow')}</p>
          <h2 style={{ marginBottom: '0.5rem' }}>{t('home.process_title')}</h2>
          <p style={{ maxWidth: '520px' }}>{t('home.trust_panel_body')}</p>
          <div className="step-list">
            {steps.map((step, index) => {
              return (
                <div className="step" key={step}>
                  <span className="step__number" aria-hidden="true">0{index + 1}</span>
                  <div>
                    <h3>{t(`home.process_steps.${step}_title`)}</h3>
                    <p>{t(`home.process_steps.${step}_body`)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="split-band__media">
          <SmartImage
            src={getImage('process').src}
            alt={getImage('process').alt}
            aspectClass="media--4x3"
          />
        </div>
      </div>
    </section>
  );
};

const Principles = () => {
  const { t } = useTranslation();
  const points = ['one', 'two', 'three', 'four'];
  const shariah = getImage('shariah');
  return (
    <section className="section">
      <div className="quote-band">
        <div className="split-band" style={{ gap: '2rem' }}>
          <div style={{ maxWidth: '640px' }}>
            <p className="eyebrow eyebrow--light eyebrow--gold" style={{ color: '#e9c986' }}>{t('home.principles_eyebrow')}</p>
            <h2 style={{ fontSize: 'clamp(1.45rem, 2.2vw, 1.95rem)' }}>{t('home.principles_title')}</h2>
            <p style={{ marginTop: '0.5rem' }}>{t('home.principles_body')}</p>
            <div className="musharakah-points">
              {points.map(point => (
                <div key={point}>
                  <strong>{t(`home.principles.${point}_title`)}</strong>
                  <span>{t(`home.principles.${point}_body`)}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <SmartImage src={shariah.src} alt={shariah.alt} aspectClass="media--4x5" />
          </div>
        </div>
      </div>
    </section>
  );
};

const Trust = () => {
  const { t } = useTranslation();
  const pillars = ['verified', 'transparent', 'musharakah', 'documents', 'audit'];
  const pillarIcons = [BadgeCheck, ShieldCheck, Handshake, FileCheck2, Link2];
  const trustImg = getImage('trust');
  return (
    <section className="section">
      <p className="eyebrow">{t('home.trust_eyebrow')}</p>
      <h2 style={{ maxWidth: '640px' }}>{t('home.trust_title')}</h2>
      <div className="split-band" style={{ marginTop: '1.75rem', alignItems: 'stretch' }}>
        <div className="split-band__media">
          <SmartImage src={trustImg.src} alt={trustImg.alt} aspectClass="media--4x3" />
        </div>
        <div className="pillar-grid" style={{ gridTemplateColumns: '1fr', marginTop: 0 }}>
          {pillars.map((pillar, index) => {
            const Icon = pillarIcons[index];
            return (
              <article className="pillar" key={pillar} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <span className="pillar__icon" aria-hidden="true"><Icon size={19} /></span>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{t(`home.pillars.${pillar}.title`)}</h3>
                  <p>{t(`home.pillars.${pillar}.body`)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const LandingCta = () => {
  const { t } = useTranslation();
  return (
    <section className="section">
      <div className="cta-band">
        <div>
          <h2>{t('home.cta_title')}</h2>
          <p>{t('home.cta_body')}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn btn-gold btn-lg">{t('home.cta_primary')}</Link>
          <Link to="/login" className="btn btn-lg" style={{ background: 'rgba(255,255,255,.14)', color: '#fff', borderColor: 'rgba(255,255,255,.35)' }}>
            {t('home.cta_secondary')}
          </Link>
        </div>
      </div>
    </section>
  );
};

const Home = () => (
  <div className="container">
    <Hero />
    <Categories />
    <Process />
    <Principles />
    <Trust />
    <LandingCta />
  </div>
);

export default Home;
