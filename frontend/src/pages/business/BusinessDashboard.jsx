import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ClipboardList, ScrollText, BadgeCheck, FileCheck2, CheckCircle2
} from 'lucide-react';
import {
  PageHeader, StatusBadge, VerificationBadge, ProgressBar,
  EmptyState, LoadingState, ErrorState, TrustIndicator
} from '../../components/UI';
import { industryImage } from '../../lib/images';
import { apiRequest } from '../../lib/api';

const BusinessDashboard = () => {
  const { t } = useTranslation();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const { ok, status, data } = await apiRequest('/api/business');
        if (ok) {
          setBusiness(data);
        } else if (status !== 404) {
          setError(t('common.error'));
        }
      } catch (err) {
        setError(t('common.error'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [t]);

  if (loading) return <LoadingState lines={5} />;
  if (error) return <ErrorState message={error} />;

  if (!business) {
    return (
      <div>
        <PageHeader
          eyebrow={t('business.dashboard')}
          title={t('business.dashboard')}
          description={t('business.workspace_intro')}
          actions={<Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>}
        />
        <EmptyState
          title={t('business.status_not_submitted')}
          description={t('business.no_campaigns_description')}
          icon={<CheckCircle2 size={22} aria-hidden="true" />}
          action={<Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>}
        />
      </div>
    );
  }

  const vs = business.verificationStatus;
  const campaigns = business.campaigns || [];
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  const raised = campaigns.reduce((sum, c) => sum + Number(c.currentFunding || 0), 0);
  const image = industryImage(business.industry, business.businessName);

  const verificationMessage = () => {
    if (vs === 'APPROVED') return t('business.verification_approved_body');
    if (vs === 'REJECTED') return t('business.verification_rejected_body');
    return t('business.verification_pending_body');
  };

  const nextAction = () => {
    if (vs === 'APPROVED') return t('business.next_action_approved');
    return t('business.next_action_pending');
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={business.businessName}
        description={t('business.workspace_intro')}
        actions={
          <div className="page-header__actions">
            {vs !== 'APPROVED' && (
              <Link to="/business/verify" className="btn btn-secondary">{t('business.submit_verification')}</Link>
            )}
            {vs === 'APPROVED' && (
              <Link to="/business/campaign/create" className="btn btn-primary">{t('business.create_campaign')}</Link>
            )}
          </div>
        }
      />

      {/* Business identity banner */}
      <div className="card" style={{ overflow: 'hidden', padding: 0, marginBottom: '1.5rem' }}>
        <div className="media" style={{ height: 150 }}>
          <img src={image.src} alt={`${business.businessName} — ${image.alt}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div className="workspace-card__heading" style={{ padding: '1.25rem 1.5rem 0.5rem', marginBottom: 0 }}>
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>{t('business.identity')}</p>
            <h2 style={{ fontSize: '1.35rem', margin: '0.25rem 0 0.1rem' }}>{business.businessName}</h2>
            <div className="workspace-card__meta">
              {business.industry && <span className="tag">{business.industry}</span>}
            </div>
          </div>
          <VerificationBadge status={vs} />
        </div>
        <p style={{ padding: '0 1.5rem 1.5rem', margin: 0 }}>{business.description}</p>
      </div>

      {/* Stats */}
      <div className="grid grid--3" style={{ marginBottom: '1.5rem' }}>
        <div className="card stat-card stat-card--accent">
          <span className="stat-card__label">{t('business.stat_verification')}</span>
          <StatusBadge status={vs} label={t(`business.status_${(vs || 'pending').toLowerCase()}`)} />
        </div>
        <div className="card stat-card">
          <span className="stat-card__label">{t('business.stat_campaigns_total')}</span>
          <span className="stat-card__value">{campaigns.length}</span>
        </div>
        <div className="card stat-card">
          <span className="stat-card__label">{t('business.stat_campaigns_active')}</span>
          <span className="stat-card__value">{activeCampaigns.length}</span>
          <span className="stat-card__hint">{t('business.stat_raised')}: ${raised.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
        </div>
      </div>

      {/* Verification + guidance */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card workspace-card">
          <div className="workspace-card__heading">
            <div>
              <p className="eyebrow" style={{ margin: 0 }}><BadgeCheck size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('business.verification_title')}</p>
              <h2 style={{ fontSize: '1.15rem', margin: '0.2rem 0 0' }}>{t('business.next_action')}</h2>
            </div>
          </div>
          <p style={{ margin: '0 0 0.75rem' }}>{verificationMessage()}</p>

          {vs === 'REJECTED' && business.verifications?.length > 0 && (
            <div className="alert alert--error" style={{ marginBottom: '0.75rem' }}>
              <strong>{t('business.reviewer_remarks')}: </strong>
              {business.verifications[business.verifications.length - 1].remarks || 'Please update your documents and resubmit.'}
            </div>
          )}
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--ink-muted)' }}>{nextAction()}</p>
        </div>

        <div className="card workspace-card">
          <p className="eyebrow" style={{ margin: 0 }}><ScrollText size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('trust.audit_title')}</p>
          <div style={{ display: 'grid', gap: '0.6rem', marginTop: '0.75rem' }}>
            <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
            <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
          </div>
        </div>
      </div>

      {/* Guidance steps */}
      <section className="section" style={{ marginTop: '2rem' }}>
        <p className="eyebrow">{t('home.process_eyebrow')}</p>
        <h2 style={{ fontSize: '1.35rem' }}>{t('business.steps_title')}</h2>
        <div className="grid grid--4" style={{ marginTop: '1.25rem' }}>
          {[['one', FileCheck2], ['two', ScrollText], ['three', ClipboardList], ['four', BadgeCheck]].map(([step, Icon]) => (
            <article className="pillar" key={step}>
              <span className="pillar__icon" aria-hidden="true"><Icon size={18} /></span>
              <h3 style={{ fontSize: '1rem' }}>{t(`business.step_${step}_title`)}</h3>
              <p>{t(`business.step_${step}_body`)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Campaigns */}
      <div className="section-header">
        <div>
          <h2>{t('business.campaigns_title')}</h2>
          <p>{t('business.campaigns_help')}</p>
        </div>
        {vs === 'APPROVED' && <Link to="/business/campaign/create" className="btn btn-secondary">{t('business.create_campaign')}</Link>}
      </div>

      {!business.campaigns || business.campaigns.length === 0 ? (
        <EmptyState
          title={t('business.no_campaigns')}
          description={t('business.no_campaigns_description')}
          action={vs === 'APPROVED' && <Link to="/business/campaign/create" className="btn btn-primary">{t('business.create_campaign')}</Link>}
          icon={<ClipboardList size={20} aria-hidden="true" />}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('campaign.campaign_status')}</th>
                <th>{t('business.campaign_title')}</th>
                <th>{t('campaign.raised')}</th>
                <th>{t('campaign.target')}</th>
                <th style={{ minWidth: 180 }}>{t('campaign.funding_progress')}</th>
              </tr>
            </thead>
            <tbody>
              {business.campaigns.map(c => {
                const goal = Number(c.fundingGoal) || 0;
                const funded = Number(c.currentFunding) || 0;
                const progress = goal ? (funded / goal) * 100 : 0;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'grid', gap: '.3rem' }}>
                        <StatusBadge status={c.status} label={t(`campaign.status_${(c.status || 'pending').toLowerCase()}`)} />
                        <span style={{ fontSize: '0.78rem', color: 'var(--ink-faint)' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="td-strong">{c.title}</span>
                      <p style={{ margin: '0.2rem 0 0', fontSize: '0.84rem' }}>{c.description}</p>
                    </td>
                    <td className="td-money">${funded.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="td-money">${goal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td><ProgressBar compact value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
