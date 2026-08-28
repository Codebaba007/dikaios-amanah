import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, TrustIndicator } from '../../components/UI';

const AdminDashboard = () => {
  const { t } = useTranslation();

  const queues = [
    {
      eyebrow: 'Queue',
      title: t('admin.verifications'),
      description: 'Review new business owner verification submissions, documents, and document integrity hashes.',
      to: '/admin/verifications',
      variant: 'btn-primary',
    },
    {
      eyebrow: 'Queue',
      title: t('admin.campaigns'),
      description: 'Review and moderate Musharakah campaign submissions before they are made active for investors.',
      to: '/admin/campaigns',
      variant: 'btn-primary',
    },
    {
      eyebrow: 'Trust & Audit',
      title: t('admin.audits'),
      description: 'View the cryptographic hash-chain audit ledger and run an integrity check against all audit records.',
      to: '/admin/audits',
      variant: 'btn-secondary',
    },
  ];

  return (
    <div className="container">
      <PageHeader
        eyebrow="Administrator"
        title={t('admin.dashboard')}
        description={t('admin.workspace_intro')}
      />

      <div className="campaign-grid" style={{ marginBottom: '2rem' }}>
        {queues.map(q => (
          <div key={q.to} className="card workspace-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <p className="eyebrow">{q.eyebrow}</p>
            <h2 style={{ fontSize: '1.2rem', flexGrow: 1 }}>{q.title}</h2>
            <p style={{ flexGrow: 1 }}>{q.description}</p>
            <Link to={q.to} className={`btn ${q.variant}`} style={{ marginTop: '1.25rem' }}>
              {t('admin.review')}
            </Link>
          </div>
        ))}
      </div>

      <div className="card workspace-card">
        <p className="eyebrow">{t('trust.audit_title')}</p>
        <h2 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Cryptographic Trust & Audit Layer</h2>
        <div style={{ display: 'grid', gap: '.75rem' }}>
          <TrustIndicator
            title={t('trust.audit_title')}
            description={t('trust.audit_description')}
          />
          <TrustIndicator
            title={t('trust.document_title')}
            description={t('trust.document_description')}
          />
          <TrustIndicator
            title="Audit trail active"
            description="Critical verification, campaign, and investment events are recorded in the tamper-evident hash chain."
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
