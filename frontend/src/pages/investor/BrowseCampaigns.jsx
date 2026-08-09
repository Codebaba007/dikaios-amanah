import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const BrowseCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investor/campaigns', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setCampaigns(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{t('investor.browse_campaigns')}</h2>
        <Link to="/investor" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {campaigns.length === 0 ? (
        <p>{t('investor.no_campaigns')}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {campaigns.map(c => {
            const progress = (parseFloat(c.currentFunding) / parseFloat(c.fundingGoal)) * 100;
            return (
              <div key={c.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <h4>{c.title}</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  by {c.business.businessName} ({c.business.industry})
                </p>
                <div style={{ marginBottom: '1rem', flexGrow: 1 }}>
                  <p>{c.description.length > 100 ? c.description.substring(0, 100) + '...' : c.description}</p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    <span>${c.currentFunding} raised</span>
                    <span>Goal: ${c.fundingGoal}</span>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: 'var(--primary-color)' }}></div>
                  </div>
                </div>

                <Link to={`/investor/campaigns/${c.id}`} className="btn btn-primary w-full" style={{ textAlign: 'center' }}>
                  {t('investor.campaign_details')}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseCampaigns;
