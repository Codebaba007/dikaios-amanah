import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Info, ShieldCheck } from 'lucide-react';
import {
  PageHeader, ErrorState, SuccessState, LoadingState, VerificationBadge,
  SimulatedNotice, TrustIndicator
} from '../../components/UI';
import { apiRequest } from '../../lib/api';

const CreateCampaign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', fundingGoal: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadBusiness = async () => {
      try {
        const { ok, status, data } = await apiRequest('/api/business');
        if (!active) return;
        if (ok) setBusiness(data);
        else if (status !== 404) setError(t('common.error'));
      } catch {
        if (active) setError(t('common.error'));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadBusiness();
    return () => {
      active = false;
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    };
  }, [t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const { ok, data } = await apiRequest('/api/campaigns', {
        method: 'POST',
        body: {
          title: formData.title,
          description: formData.description,
          fundingGoal: formData.fundingGoal
        }
      });
      if (!ok) throw new Error(data?.error || t('common.error'));

      setSuccess(t('business.campaign_submitted'));
      redirectTimer.current = window.setTimeout(() => navigate('/business'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState lines={4} />;

  const verificationStatus = business?.verificationStatus;
  const approved = verificationStatus === 'APPROVED';
  const hasBusiness = Boolean(business);

  const statusGate = !hasBusiness ? (
    <div className="card card--pad-lg">
      <p className="eyebrow">{t('business.identity')}</p>
      <h2 style={{ fontSize: '1.2rem' }}>{t('business.status_not_submitted')}</h2>
      <p>{t('business.no_campaigns_description')}</p>
      <Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>
    </div>
  ) : !approved ? (
    <div className="card card--pad-lg">
      <div className="workspace-card__heading">
        <div>
          <p className="eyebrow">{t('business.verification_title')}</p>
          <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{t('business.campaign_blocked_title')}</h2>
        </div>
        <VerificationBadge status={verificationStatus} />
      </div>
      <p style={{ marginTop: '0.75rem' }}>
        {t('business.campaign_blocked_body', { status: verificationStatus || t('business.status_not_submitted') })}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <Link to="/business/verify" className="btn btn-primary">{t('business.submit_verification')}</Link>
        <Link to="/business" className="btn btn-secondary">{t('nav.dashboard')}</Link>
      </div>
    </div>
  ) : null;

  return (
    <div>
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={t('business.create_campaign')}
        description={t('business.create_campaign_intro')}
      />

      {statusGate ? (
        statusGate
      ) : (
        <div className="split-form">
          <div className="card card--pad-lg">
            {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
            {success && <div style={{ marginBottom: '1.25rem' }}><SuccessState message={success} /></div>}

            <form onSubmit={handleSubmit}>
              <div className="form-section">
                <h2 className="form-section__title">{t('business.campaign_section_details')}</h2>
                <p className="form-section__hint">{t('business.campaign_section_details_hint')}</p>

                <div className="form-group">
                  <label className="form-label" htmlFor="campaignTitle">{t('business.campaign_title')}</label>
                  <input
                    id="campaignTitle"
                    className="form-input"
                    placeholder={t('business.campaign_title_placeholder')}
                    value={formData.title}
                    onChange={event => setFormData({ ...formData, title: event.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="campaignDescription">{t('business.description')}</label>
                  <textarea
                    id="campaignDescription"
                    className="form-input"
                    rows="6"
                    placeholder={t('business.campaign_description_placeholder')}
                    value={formData.description}
                    onChange={event => setFormData({ ...formData, description: event.target.value })}
                    required
                  />
                  <p className="form-help">{t('business.campaign_description_help')}</p>
                </div>
              </div>

              <div className="form-section">
                <h2 className="form-section__title">{t('business.campaign_section_funding')}</h2>
                <p className="form-section__hint">{t('business.funding_goal_help')}</p>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" htmlFor="fundingGoal">{t('business.funding_goal')} (USD)</label>
                  <input
                    id="fundingGoal"
                    type="number"
                    min="1"
                    step="0.01"
                    inputMode="decimal"
                    className="form-input"
                    value={formData.fundingGoal}
                    onChange={event => setFormData({ ...formData, fundingGoal: event.target.value })}
                    required
                  />
                </div>
              </div>

              <SimulatedNotice />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting || Boolean(success)}>
                  {submitting ? t('common.loading') : t('business.submit')}
                </button>
                <Link to="/business" className="btn btn-secondary">{t('common.cancel')}</Link>
              </div>
            </form>
          </div>

          <aside className="guidance-stack">
            <div className="card">
              <p className="eyebrow" style={{ margin: 0 }}>
                <ClipboardList size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('business.campaign_form_help_title')}
              </p>
              <ul className="checklist">
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.campaign_help_one')}</span></li>
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.campaign_help_two')}</span></li>
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.campaign_help_three')}</span></li>
              </ul>
            </div>

            <div className="card">
              <p className="eyebrow" style={{ margin: 0 }}>
                <ShieldCheck size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('business.verification_title')}
              </p>
              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <VerificationBadge status={verificationStatus} />
                </div>
                <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
              </div>
            </div>

            <div className="card">
              <p className="eyebrow" style={{ margin: 0 }}>
                <Info size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('business.campaign_section_funding')}
              </p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem' }}>{t('business.funding_goal_help')}</p>
              <Link to="/business/verify" className="btn btn-quiet btn-sm" style={{ marginTop: '0.5rem', paddingLeft: 0 }}>
                {t('business.review_verification')} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default CreateCampaign;
