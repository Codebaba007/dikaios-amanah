import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const BusinessDashboard = () => {
  const { t } = useTranslation();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/business', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, []);

  if (loading) return <div className="container" style={{ marginTop: '2rem' }}>Loading...</div>;

  if (!business) {
    return (
      <div className="container flex-col items-center animate-fade-in" style={{ marginTop: '4rem', textAlign: 'center' }}>
        <h2>{t('business.dashboard')}</h2>
        <p>{t('business.status_not_submitted')}</p>
        <Link to="/business/create" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          {t('business.create_profile')}
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED': return <span className="badge badge-success">{t('business.status_approved')}</span>;
      case 'PENDING': return <span className="badge badge-warning">{t('business.status_pending')}</span>;
      case 'REJECTED': return <span className="badge badge-error">{t('business.status_rejected')}</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>{t('business.dashboard')}</h2>
        {getStatusBadge(business.verificationStatus)}
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3>{business.businessName}</h3>
        <p>{business.industry}</p>
        <p>{business.description}</p>

        {business.verificationStatus === 'REJECTED' && business.verifications?.length > 0 && (
          <div className="badge badge-error" style={{ display: 'block', marginTop: '1rem', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <strong>Rejection Reason:</strong> {business.verifications[business.verifications.length - 1].remarks || 'Please update your details and resubmit.'}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
          {business.verificationStatus !== 'APPROVED' && business.verificationStatus !== 'PENDING' && (
            <Link to="/business/verify" className="btn btn-secondary">{t('business.submit_verification')}</Link>
          )}
          {business.verificationStatus === 'APPROVED' && (
            <Link to="/business/campaign/create" className="btn btn-primary">{t('business.create_campaign')}</Link>
          )}
        </div>
      </div>

      <h3>Your Campaigns</h3>
      {business.campaigns?.length === 0 ? (
        <p style={{ marginTop: '1rem' }}>No campaigns created yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
          {business.campaigns?.map(c => (
            <div key={c.id} className="card">
              <h4>{c.title}</h4>
              <p>Goal: ${c.fundingGoal}</p>
              <p>Raised: ${c.currentFunding}</p>
              <span className="badge badge-info">{c.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
