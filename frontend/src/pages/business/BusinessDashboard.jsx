import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  PageHeader, SectionHeader, StatusBadge, VerificationBadge,
  ProgressBar, EmptyState, LoadingState, ErrorState, TrustIndicator
} from '../../components/UI';

const BusinessDashboard = () => {
  const { t } = useTranslation();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/business', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (res.ok) {
          const data = await res.json();
          setBusiness(data);
        } else if (res.status !== 404) {
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

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  if (!business) {
    return (
      <div className="container">
        <PageHeader
          eyebrow={t('business.dashboard')}
          title={t('business.status_not_submitted')}
          description={t('business.workspace_intro')}
          actions={<Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>}
        />
        <EmptyState
          title={t('business.status_not_submitted')}
          description={t('business.no_campaigns_description')}
          action={<Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>}
        />
      </div>
    );
  }

  const vs = business.verificationStatus;

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
    <div className="container">
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

      <div className="dashboard-grid">
        {/* Left column */}
        <div className="detail-stack">

          {/* Business identity card */}
          <div className="card workspace-card">
            <div className="workspace-card__heading">
              <div>
                <p className="eyebrow">{t('business.identity')}</p>
                <h2 style={{ fontSize: '1.35rem', marginBottom: '.25rem' }}>{business.businessName}</h2>
                <div className="workspace-card__meta">
                  <span>{business.industry}</span>
                </div>
              </div>
              <VerificationBadge status={vs} />
            </div>
            <p style={{ margin: 0 }}>{business.description}</p>
          </div>

          {/* Verification status card */}
          <div className="card workspace-card">
            <div className="workspace-card__heading">
              <div>
                <p className="eyebrow">{t('business.verification_title')}</p>
                <h2 style={{ fontSize: '1.2rem', marginBottom: '.25rem' }}>{t('business.next_action')}</h2>
              </div>
              <StatusBadge status={vs} label={t(`business.status_${vs.toLowerCase()}`)} />
            </div>
            <p style={{ margin: '0 0 .75rem' }}>{verificationMessage()}</p>
            {vs === 'REJECTED' && business.verifications?.length > 0 && (
              <div className="alert alert--error" style={{ marginTop: '.75rem' }}>
                <strong>Remarks: </strong>{business.verifications[business.verifications.length - 1].remarks || 'Please update your documents and resubmit.'}
              </div>
            )}
            <p style={{ margin: '.5rem 0 0', fontSize: '.9rem', color: 'var(--ink-muted)' }}>{nextAction()}</p>
          </div>

        </div>

        {/* Right column: trust */}
        <div className="detail-stack">
          <div className="card workspace-card">
            <p className="eyebrow">{t('trust.audit_title')}</p>
            <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
            <div style={{ marginTop: '.75rem' }}>
              <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns section */}
      <SectionHeader
        title={t('business.campaigns_title')}
        description={t('business.workspace_intro')}
        action={vs === 'APPROVED' && <Link to="/business/campaign/create" className="btn btn-secondary">{t('business.create_campaign')}</Link>}
      />

      {!business.campaigns || business.campaigns.length === 0 ? (
        <EmptyState
          title={t('business.no_campaigns')}
          description={t('business.no_campaigns_description')}
          action={vs === 'APPROVED' && <Link to="/business/campaign/create" className="btn btn-primary">{t('business.create_campaign')}</Link>}
        />
      ) : (
        <div className="campaign-grid">
          {business.campaigns.map(c => {
            const goal = Number(c.fundingGoal) || 0;
            const funded = Number(c.currentFunding) || 0;
            const progress = goal ? (funded / goal) * 100 : 0;
            return (
              <article key={c.id} className="campaign-card">
                <div className="campaign-card__topline">
                  <span className="campaign-card__industry">{business.industry}</span>
                  <StatusBadge status={c.status} />
                </div>
                <h3 style={{ marginTop: '.75rem' }}>{c.title}</h3>
                <div className="campaign-card__funding">
                  <div>
                    <span>{t('campaign.raised')}</span>
                    <strong>${funded.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>{t('campaign.target')}</span>
                    <strong>${goal.toLocaleString()}</strong>
                  </div>
                </div>
                <ProgressBar compact value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} />
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BusinessDashboard;
