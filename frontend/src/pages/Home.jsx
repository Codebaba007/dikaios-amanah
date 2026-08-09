import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <div className="flex-col items-center justify-center animate-fade-in" style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>{t('home.title')}</h1>
      <p style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>{t('home.subtitle')}</p>

      <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h3>Academic Beta Phase 1</h3>
        <p>The foundation of Dikaios Amanah is successfully running.</p>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <span className="badge badge-success">PostgreSQL</span>
          <span className="badge badge-info">Express + Prisma</span>
          <span className="badge badge-warning">React + Vite</span>
        </div>
      </div>
    </div>
  );
};

export default Home;
