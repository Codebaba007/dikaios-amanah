import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';

const BrowseCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investor/campaigns', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      setCampaigns(await res.json());
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.browse_campaigns')}
        description={t('investor.discover_intro')}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title={t('investor.no_campaigns')}
          description={t('investor.discover_intro')}
        />
      ) : (
        <div className="campaign-grid">
          {campaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseCampaigns;
