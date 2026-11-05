import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Building2, ShieldAlert } from 'lucide-react';
import {
  SectionHeader, StatusBadge, VerificationBadge, ProgressBar,
  LoadingState, ErrorState, SuccessState, TrustIndicator, SmartImage, SpecList, SimulatedNotice
} from '../../components/UI';
import { industryImage } from '../../lib/images';
import { apiRequest } from '../../lib/api';

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
  const [isConfirming, setIsConfirming] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    setLoading(true);
    try {
      const { ok, status, data } = await apiRequest(`/api/investor/campaigns/${id}`);
      if (!ok) {
        setCampaign(null);
        throw new Error(status === 404 ? t('investor.business_not_found_description') : data.error);
      }
      setCampaign(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /** Validate the amount locally, then show the confirmation step. */
  const reviewInvestment = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setNeedsVerification(false);

    const numeric = Number(amount);
    const capacity = (Number(campaign?.fundingGoal) || 0) - (Number(campaign?.currentFunding) || 0);

    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setError(t('investor.invalid_amount'));
      return;
    }
    if (capacity > 0 && numeric > capacity) {
      setError(t('investor.amount_exceeds_capacity', { value: `$${capacity.toLocaleString()}` }));
      return;
    }
    setIsConfirming(true);
  };

  const handleInvest = async () => {
    setError('');
    setSuccess('');
    setInvesting(true);
    try {
      const { ok, status, data } = await apiRequest('/api/investor/invest', {
        method: 'POST',
        body: { campaignId: id, amount: parseFloat(amount) }
      });

      if (!ok) {
        // The backend blocks investment until identity verification is approved.
        // Present that as guidance rather than a raw technical error.
        if (status === 403) {
          setNeedsVerification(true);
          setIsConfirming(false);
          return;
        }
        throw new Error(data?.error || t('common.error'));
      }

      setSuccess(t('investor.investment_success'));
      setAmount('');
      setIsConfirming(false);
      fetchCampaign();
    } catch (err) {
      setError(err.message);
    } finally {
      setInvesting(false);
    }
  };

  if (loading) return <LoadingState lines={6} />;
  if (error && !campaign) {
    return (
      <div>
        <ErrorState message={error} />
        <div style={{ marginTop: '1rem' }}><Link to="/investor/campaigns" className="btn btn-secondary">{t('investor.back_to_discover')}</Link></div>
      </div>
    );
  }

  const goal = Number(campaign.fundingGoal) || 0;
  const funded = Number(campaign.currentFunding) || 0;
  const progress = goal ? (funded / goal) * 100 : 0;
  const remaining = goal - funded;
  const vs = campaign.business?.verificationStatus;
  const image = industryImage(campaign.business?.industry, campaign.title);

  return (
    <div>
      <button onClick={() => navigate(-1)} className="back-link">
        <ArrowLeft size={16} aria-hidden="true" /> {t('common.back')}
      </button>

      {/* Campaign hero */}
      <div className="detail-hero">
        <SmartImage
          src={image.src}
          alt={`${campaign.business?.businessName || t('common.not_available')} — ${image.alt}`}
          aspectClass="media--21x9"
          overlay
        />
        <div style={{ position: 'relative', marginTop: '-4.5rem', padding: '0 1.5rem', zIndex: 2 }}>
          <div className="card card--pad-lg">
            <p className="campaign-card__business" style={{ fontSize: '.8rem' }}>
              <Building2 size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {campaign.business?.businessName}
            </p>
            <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', letterSpacing: '-.02em', marginBottom: '.4rem' }}>
              {campaign.title}
            </h1>
            <div style={{ display: 'flex', gap: '.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <StatusBadge status={campaign.status} label={t(`campaign.status_${(campaign.status || 'pending').toLowerCase()}`)} />
              {vs && <VerificationBadge status={vs} />}
              {campaign.business?.industry && <span className="tag">{campaign.business.industry}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="details-grid">
        {/* LEFT: information stack */}
        <div className="detail-stack">
          <div className="card details-panel">
            <SectionHeader title={t('investor.business_information')} />
            <SpecList items={[
              { term: t('business.business_name'), detail: campaign.business?.businessName || t('common.not_available') },
              { term: t('business.industry'), detail: campaign.business?.industry || t('common.not_available') }
            ]} />
            <p style={{ marginTop: '1rem', marginBottom: 0 }}>{campaign.business?.description}</p>
          </div>

          <div className="card details-panel">
            <SectionHeader
              title={t('investor.verification_information')}
              action={vs ? <VerificationBadge status={vs || 'PENDING'} /> : null}
            />
            {vs === 'APPROVED' ? (
              <TrustIndicator
                title={t('trust.verification_approved')}
                description={t('investor.trust_verified_description')}
              />
            ) : (
              <p style={{ margin: 0 }}>{t('investor.verification_not_available')}</p>
            )}
            <div style={{ marginTop: '0.75rem' }}>
              <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
            </div>
          </div>

          <div className="card details-panel">
            <SectionHeader title={t('campaign.overview')} />
            <p style={{ margin: 0 }}>{campaign.description}</p>
          </div>

          <div className="card details-panel">
            <SectionHeader title={t('campaign.musharakah_title')} />
            <SpecList items={[
              { term: t('campaign.profit_sharing'), detail: t('campaign.not_configured') },
              { term: t('campaign.tenure'), detail: t('campaign.not_configured') },
              { term: t('campaign.risk_information'), detail: t('campaign.not_configured') }
            ]} />
            <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
              {t('campaign.musharakah_future')}
            </p>
          </div>

          {campaign.profitDeclarations?.length > 0 && (
            <div className="card details-panel">
              <SectionHeader title={t('investor.profit_declarations')} />
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>{t('campaign.tenure')}</th>
                      <th>{t('campaign.raised')}</th>
                      <th>{t('investor.status')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaign.profitDeclarations.map(p => (
                      <tr key={p.id}>
                        <td>{p.period}</td>
                        <td className="td-money">${Number(p.amount).toLocaleString()}</td>
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
        <div className="investment-panel detail-stack">
          <div className="card details-panel">
            <SectionHeader title={t('campaign.funding')} />
            <SpecList items={[
              { term: t('campaign.raised'), detail: `$${funded.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, strong: true },
              { term: t('campaign.target'), detail: `$${goal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
              { term: t('investor.remaining_capacity'), detail: `$${Math.max(remaining, 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}` }
            ]} />
            <div style={{ marginTop: '1rem' }}>
              <ProgressBar value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} />
            </div>

            <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border)' }}>
              <p className="eyebrow" style={{ marginBottom: '.6rem' }}>{t('investor.invest')}</p>
              <SimulatedNotice />

              {needsVerification && (
                <div style={{ marginTop: '0.75rem' }}>
                  <div className="alert alert--info" style={{ display: 'flex', gap: '.6rem', alignItems: 'flex-start' }}>
                    <ShieldAlert size={18} aria-hidden="true" style={{ flex: '0 0 auto', marginTop: '.1rem' }} />
                    <div>
                      <strong style={{ display: 'block' }}>{t('investor.verification_required_title')}</strong>
                      <span style={{ fontSize: '.88rem' }}>{t('investor.verification_required_body')}</span>
                    </div>
                  </div>
                  <Link to="/investor/verify" className="btn btn-primary btn-block" style={{ marginTop: '0.6rem' }}>
                    {t('investor.guide_verification_action')}
                  </Link>
                </div>
              )}

              {error && !needsVerification && (
                <div style={{ marginTop: '0.75rem' }}><ErrorState message={error} /></div>
              )}
              {success && <div style={{ marginTop: '0.75rem' }}><SuccessState message={success} /></div>}

              {remaining > 0 ? (
                isConfirming ? (
                  <div style={{ marginTop: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '0.35rem' }}>{t('investor.investment_confirmation_title')}</h3>
                    <p style={{ margin: '0 0 0.85rem', fontSize: '0.88rem' }}>{t('investor.investment_confirmation_body')}</p>
                    <SpecList items={[
                      { term: t('investor.confirm_campaign'), detail: campaign.title },
                      { term: t('investor.confirm_amount'), detail: `$${Number(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, strong: true },
                      { term: t('investor.confirm_after'), detail: `$${Math.max(remaining - Number(amount), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}` }
                    ]} />
                    <button
                      type="button"
                      className="btn btn-primary btn-block"
                      style={{ marginTop: '1rem' }}
                      onClick={handleInvest}
                      disabled={investing}
                    >
                      {investing ? t('common.loading') : t('investor.confirm_investment')}
                    </button>
                    <button
                      type="button"
                      className="btn btn-quiet btn-block"
                      style={{ marginTop: '0.4rem' }}
                      onClick={() => { setIsConfirming(false); setError(''); }}
                      disabled={investing}
                    >
                      {t('investor.edit_amount')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={reviewInvestment} style={{ marginTop: '1rem' }}>
                    <div className="form-group">
                      <label className="form-label" htmlFor="investAmount">{t('investor.investment_amount')}</label>
                      <input
                        id="investAmount"
                        type="number"
                        min="1"
                        max={remaining}
                        step="0.01"
                        inputMode="decimal"
                        className="form-input"
                        value={amount}
                        onChange={e => { setAmount(e.target.value); setError(''); }}
                        required
                      />
                      <p className="form-help">{t('investor.remaining_capacity')}: ${Math.max(remaining, 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                      {t('investor.review_investment')}
                    </button>
                  </form>
                )
              ) : (
                <div className="alert alert--success" style={{ marginTop: '1rem', textAlign: 'center' }}>
                  {t('campaign.goal_reached')}
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
