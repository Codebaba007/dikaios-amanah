import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import {
  PageHeader, SectionHeader, VerificationBadge,
  LoadingState, ErrorState, EmptyState, TrustIndicator
} from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';

const BusinessProfile = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetchBusiness();
  }, [id]);

  const fetchBusiness = async () => {
    setLoading(true);
    setError('');
    setNotFound(false);
    try {
      const res = await fetch(`http://localhost:5000/api/investor/businesses/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) throw new Error(t('common.error'));
      setBusiness(await res.json());
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  if (notFound || !business) {
    return (
      <div className="container">
        <EmptyState
          title={t('investor.business_not_found')}
          description={t('investor.business_not_found_description')}
          action={
            <Link className="btn btn-primary" to="/investor/campaigns">
              {t('investor.back_to_discover')}
            </Link>
          }
        />
      </div>
    );
  }

  const vs = business.verificationStatus;
  const businessCampaigns = business.campaigns || [];

  return (
    <div className="container">
      {/* Back to discovery */}
      <Link to="/investor/campaigns" className="btn btn-secondary" style={{ marginBottom: '1.25rem' }}>
        ← {t('investor.back_to_discover')}
      </Link>

      {/* Business Header */}
      <PageHeader
        eyebrow={business.industry || t('common.not_available')}
        title={business.businessName}
        actions={vs ? <VerificationBadge status={vs} /> : null}
      />

      {/* About Section */}
      <div className="card details-panel" style={{ marginBottom: '1.25rem' }}>
        <SectionHeader title={t('investor.about_business')} />
        {business.description ? (
          <p style={{ margin: 0, lineHeight: 1.7 }}>{business.description}</p>
        ) : (
          <p style={{ margin: 0, color: 'var(--ink-muted)' }}>{t('investor.no_description')}</p>
        )}
      </div>

      {/* Trust & Due-Diligence Section */}
      <div className="card details-panel" style={{ marginBottom: '2rem' }}>
        <SectionHeader title={t('investor.trust_due_diligence')} />
        <div style={{ display: 'grid', gap: '.75rem' }}>
          {vs === 'APPROVED' ? (
            <TrustIndicator
              title={t('trust.verification_approved')}
              description={t('investor.trust_verified_description')}
            />
          ) : (
            <TrustIndicator
              title={t('trust.verification_pending')}
              description={t('investor.trust_pending_description')}
            />
          )}
          <TrustIndicator
            title={t('trust.document_title')}
            description={t('trust.document_description')}
          />
          <TrustIndicator
            title={t('trust.audit_title')}
            description={t('trust.audit_description')}
          />
        </div>
      </div>

      {/* Active Campaigns */}
      <SectionHeader
        title={t('investor.business_campaigns_title')}
        description={t('investor.business_campaigns_description', { count: businessCampaigns.length })}
      />

      {businessCampaigns.length === 0 ? (
        <EmptyState
          title={t('investor.no_business_campaigns')}
          description={t('investor.no_business_campaigns_description')}
        />
      ) : (
        <div className="campaign-grid" style={{ marginTop: '1rem' }}>
          {businessCampaigns.map(c => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;
