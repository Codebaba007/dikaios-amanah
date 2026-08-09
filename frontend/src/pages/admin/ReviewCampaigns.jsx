import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ReviewCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/campaigns/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, action) => {
    let remarks = '';
    if (action === 'REJECTED') {
      remarks = prompt(t('admin.remarks'));
      if (remarks === null) return;
    }

    try {
      await fetch(`http://localhost:5000/api/admin/campaigns/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, remarks })
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h2>{t('admin.campaigns')}</h2>

      {campaigns.length === 0 ? (
        <p>{t('admin.no_pending')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {campaigns.map(c => (
            <div key={c.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{c.title} <span className="badge badge-warning">Goal: ${c.fundingGoal}</span></h4>
                <p>Business: {c.business.businessName}</p>
                <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{c.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleReview(c.id, 'APPROVED')} className="btn btn-primary">{t('admin.approve')}</button>
                <button onClick={() => handleReview(c.id, 'REJECTED')} className="btn btn-secondary" style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }}>{t('admin.reject')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewCampaigns;
