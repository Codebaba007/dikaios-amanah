import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const { t } = useTranslation();

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h2 style={{ marginBottom: '2rem' }}>{t('admin.dashboard')}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>

        <div className="card">
          <h3>{t('admin.verifications')}</h3>
          <p>Review new business owner verification submissions and documents.</p>
          <Link to="/admin/verifications" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('admin.review')}
          </Link>
        </div>

        <div className="card">
          <h3>{t('admin.campaigns')}</h3>
          <p>Review and moderate Musharakah campaigns before they are active.</p>
          <Link to="/admin/campaigns" className="btn btn-primary" style={{ marginTop: '1rem' }}>
            {t('admin.review')}
          </Link>
        </div>

        <div className="card">
          <h3>{t('admin.audits')}</h3>
          <p>View the immutable ledger of critical system activities.</p>
          <Link to="/admin/audits" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            {t('admin.review')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
