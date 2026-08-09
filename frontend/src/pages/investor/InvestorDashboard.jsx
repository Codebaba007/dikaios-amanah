import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const InvestorDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>{t('investor.dashboard')}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        <div className="card">
          <h3>{t('investor.browse_campaigns')}</h3>
          <p>Discover and participate in ethically vetted business opportunities.</p>
          <Link to="/investor/campaigns" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('investor.browse_campaigns')}
          </Link>
        </div>

        <div className="card">
          <h3>{t('investor.portfolio')}</h3>
          <p>View your active investments, transaction history, and declared profits.</p>
          <Link to="/investor/portfolio" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            {t('investor.portfolio')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default InvestorDashboard;
