import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SectionHeader, StatusBadge, VerificationBadge,
  ProgressBar, LoadingState, ErrorState, TrustIndicator
} from '../../components/UI';

const CampaignDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [investing, setInvesting] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/investor/campaigns/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInvesting(true);
    try {
      const res = await fetch('http://localhost:5000/api/investor/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ campaignId: id, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(t('investor.investment_success'));
      setAmount('');
      fetchCampaign();
    } catch (err) {
      setError(err.message);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error && !campaign) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  const goal = Number(campaign.fundingGoal) || 0;
  const funded = Number(campaign.currentFunding) || 0;
  const progress = goal ? (funded / goal) * 100 : 0;
  const remaining = goal - funded;
  const vs = campaign.business?.verificationStatus;

  return (
    <div className="container">
      {/* Back button */}
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1.25rem' }}>
        ← {t('common.back')}
      </button>

      {/* Page eyebrow + title */}
      <div style={{ marginBottom: '1.5rem' }}>
        <p className="eyebrow">{campaign.business?.businessName}</p>
        <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.6rem,3vw,2.4rem)', margin: 0 }}>
            {campaign.title}
          </h1>
          <StatusBadge status={campaign.status} />
        </div>
      </div>

      <div className="details-grid">
        {/* LEFT: main info stack */}
        <div className="detail-stack">

          {/* Business information */}
          <div className="card details-panel">
            <SectionHeader title={t('investor.business_information')} />
            <dl className="musharakah-list">
              <div>
                <dt>{t('business.business_name')}</dt>
                <dd>{campaign.business?.businessName}</dd>
              </div>
              <div>
                <dt>{t('business.industry')}</dt>
                <dd>{campaign.business?.industry}</dd>
              </div>
            </dl>
            <p style={{ marginTop: '1rem', marginBottom: 0 }}>{campaign.business?.description}</p>
          </div>

          {/* Verification information */}
          <div className="card details-panel">
            <SectionHeader
              title={t('investor.verification_information')}
              action={<VerificationBadge status={vs || 'PENDING'} />}
            />
            {vs === 'APPROVED' ? (
              <TrustIndicator
                title={t('trust.verification_approved')}
                description="This business has been reviewed and approved by the platform administrator."
              />
            ) : (
              <p style={{ margin: 0 }}>{t('investor.verification_not_available')}</p>
            )}
            <div style={{ marginTop: '.75rem' }}>
              <TrustIndicator
                title={t('trust.audit_title')}
                description={t('trust.audit_description')}
              />
            </div>
          </div>

          {/* Campaign overview */}
          <div className="card details-panel">
            <SectionHeader title={t('campaign.overview')} />
            <p style={{ margin: 0 }}>{campaign.description}</p>
          </div>

          {/* Musharakah investment information */}
          <div className="card details-panel">
            <SectionHeader title={t('campaign.musharakah_title')} />
            <dl className="musharakah-list">
              <div>
                <dt>{t('campaign.profit_sharing')}</dt>
                <dd>{t('campaign.not_configured')}</dd>
              </div>
              <div>
                <dt>{t('campaign.tenure')}</dt>
                <dd>{t('campaign.not_configured')}</dd>
              </div>
              <div>
                <dt>{t('campaign.risk_information')}</dt>
                <dd>{t('campaign.not_configured')}</dd>
              </div>
            </dl>
            <p style={{ marginTop: '.75rem', fontSize: '.85rem', color: 'var(--ink-muted)' }}>
              Musharakah terms will be defined in a future platform phase.
            </p>
          </div>

          {/* Profit declarations if available */}
          {campaign.profitDeclarations?.length > 0 && (
            <div className="card details-panel">
              <SectionHeader title={t('investor.profit_declarations')} />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.profitDeclarations.map(p => (
                      <tr key={p.id}>
                        <td>{p.period}</td>
                        <td>${Number(p.amount).toLocaleString()}</td>
                        <td><StatusBadge status={p.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: funding + investment panel */}
        <div className="investment-panel">
          <div className="card details-panel">
            <SectionHeader title={t('campaign.funding')} />
            <dl className="musharakah-list">
              <div>
                <dt>{t('campaign.raised')}</dt>
                <dd style={{ fontSize: '1.2rem' }}>${funded.toLocaleString()}</dd>
              </div>
              <div>
                <dt>{t('campaign.target')}</dt>
                <dd>${goal.toLocaleString()}</dd>
              </div>
              <div>
                <dt>{t('investor.remaining_capacity')}</dt>
                <dd>${Math.max(remaining, 0).toLocaleString()}</dd>
              </div>
            </dl>
            <ProgressBar
              value={progress}
              label={`${Math.round(progress)}% funded`}
            />

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <p className="eyebrow">{t('investor.invest')}</p>
              <div className="simulated-notice">
                {t('campaign.simulated_notice')}
              </div>

              {error && <div style={{ marginTop: '.75rem' }}><ErrorState message={error} /></div>}
              {success && (
                <div className="alert" style={{ marginTop: '.75rem', background: 'var(--success-soft)', color: 'var(--success)' }}>
                  {success}
                </div>
              )}

              {remaining > 0 ? (
                <form onSubmit={handleInvest} style={{ marginTop: '1rem' }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="investAmount">{t('investor.investment_amount')}</label>
                    <input
                      id="investAmount"
                      type="number"
                      min="1"
                      max={remaining}
                      step="0.01"
                      className="form-input"
                      value={amount}
                      onChange={e => setAmount(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block" disabled={investing}>
                    {investing ? t('common.loading') : t('investor.confirm_investment')}
                  </button>
                </form>
              ) : (
                <div className="alert" style={{ marginTop: '1rem', background: 'var(--success-soft)', color: 'var(--success)', textAlign: 'center' }}>
                  Funding goal reached.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
