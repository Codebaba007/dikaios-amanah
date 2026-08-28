import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, TrustIndicator } from '../../components/UI';

const InvestorDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.dashboard')}
        description={t('investor.workspace_intro')}
      />

      <div className="dashboard-grid">
        {/* Left: quick actions */}
        <div className="detail-stack">
          <div className="card workspace-card">
            <p className="eyebrow">{t('investor.browse_campaigns')}</p>
            <h2 style={{ fontSize: '1.3rem' }}>{t('investor.browse_campaigns')}</h2>
            <p>{t('investor.discover_intro')}</p>
            <Link to="/investor/campaigns" className="btn btn-primary" style={{ marginTop: '1rem' }}>
              {t('investor.browse_campaigns')}
            </Link>
          </div>

          <div className="card workspace-card">
            <p className="eyebrow">{t('investor.portfolio')}</p>
            <h2 style={{ fontSize: '1.3rem' }}>{t('investor.investment_history')}</h2>
            <p>{t('investor.portfolio_intro')}</p>
            <Link to="/investor/portfolio" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
              {t('investor.portfolio')}
            </Link>
          </div>
        </div>

        {/* Right: trust context */}
        <div className="detail-stack">
          <div className="card workspace-card">
            <p className="eyebrow" style={{ marginBottom: '.75rem' }}>{t('trust.audit_title')}</p>
            <TrustIndicator
              title={t('trust.verification_approved')}
              description="Only businesses that have passed administrator verification can reach the active campaign stage."
            />
            <div style={{ marginTop: '.75rem' }}>
              <TrustIndicator
                title={t('trust.audit_title')}
                description={t('trust.audit_description')}
              />
            </div>
            <div style={{ marginTop: '.75rem' }}>
              <TrustIndicator
                title={t('trust.document_title')}
                description={t('trust.document_description')}
              />
            </div>
          </div>

          <div className="simulated-notice">
            {t('campaign.simulated_notice')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestorDashboard;
