import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionHeader, StatusBadge, ProgressBar, EmptyState, LoadingState, ErrorState } from '../../components/UI';

const ReviewCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/campaigns/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      const data = await res.json();
      setCampaigns(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, action) => {
    const remark = action === 'REJECTED' ? (remarks[id] || '') : '';
    if (action === 'REJECTED' && !remark.trim()) {
      setRemarks(prev => ({ ...prev, [`${id}_error`]: 'Please enter rejection remarks before rejecting.' }));
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/admin/campaigns/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, remarks: remark })
      });
      fetchCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Administrator"
        title={t('admin.campaign_queue')}
        description={t('admin.workspace_intro')}
      />

      {error && <ErrorState message={error} />}

      {campaigns.length === 0 ? (
        <EmptyState title={t('admin.no_pending')} description="All campaign submissions have been reviewed." />
      ) : (
        <div className="review-grid">
          {campaigns.map(c => {
            const goal = Number(c.fundingGoal) || 0;
            const funded = Number(c.currentFunding) || 0;
            const progress = goal ? (funded / goal) * 100 : 0;
            return (
              <div key={c.id} className="card review-card">
                <div className="workspace-card__heading">
                  <div>
                    <p className="eyebrow">{c.business?.industry}</p>
                    <h3 style={{ margin: 0 }}>{c.title}</h3>
                    <p style={{ margin: '.25rem 0 0', fontSize: '.85rem' }}>
                      {c.business?.businessName}
                    </p>
                  </div>
                  <StatusBadge status={c.status || 'PENDING'} label="PENDING" />
                </div>

                <p style={{ margin: '1rem 0 .5rem', fontSize: '.9rem' }}>{c.description}</p>

                <dl className="musharakah-list" style={{ marginTop: '1rem' }}>
                  <div>
                    <dt>{t('campaign.target')}</dt>
                    <dd>${goal.toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt>{t('campaign.raised')}</dt>
                    <dd>${funded.toLocaleString()}</dd>
                  </div>
                </dl>
                <ProgressBar compact value={progress} label={`${Math.round(progress)}% funded`} />

                {/* Rejection remarks */}
                <div style={{ marginTop: '.75rem' }}>
                  <label className="form-label" htmlFor={`remarks-${c.id}`} style={{ fontSize: '.82rem' }}>
                    {t('admin.remarks')} (required for rejection)
                  </label>
                  {remarks[`${c.id}_error`] && (
                    <p style={{ margin: '.2rem 0', fontSize: '.8rem', color: 'var(--danger)' }}>{remarks[`${c.id}_error`]}</p>
                  )}
                  <textarea
                    id={`remarks-${c.id}`}
                    className="form-input"
                    rows="2"
                    value={remarks[c.id] || ''}
                    onChange={e => setRemarks(prev => ({ ...prev, [c.id]: e.target.value, [`${c.id}_error`]: '' }))}
                    placeholder="Optional for approval, required for rejection."
                  />
                </div>

                <div className="review-card__actions">
                  <button
                    onClick={() => handleReview(c.id, 'APPROVED')}
                    className="btn btn-primary"
                    style={{ flex: 1 }}
                  >
                    {t('admin.approve')}
                  </button>
                  <button
                    onClick={() => handleReview(c.id, 'REJECTED')}
                    className="btn btn-secondary"
                    style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                  >
                    {t('admin.reject')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReviewCampaigns;
