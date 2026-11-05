import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  SectionHeader, VerificationBadge, LoadingState, ErrorState,
  EmptyState, TrustIndicator, SmartImage
} from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';
import { industryImage } from '../../lib/images';
import { apiRequest } from '../../lib/api';

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
      const { ok, status, data } = await apiRequest(`/api/investor/businesses/${id}`);
      if (status === 404) {
        setNotFound(true);
        return;
      }
      if (!ok) throw new Error(t('common.error'));
      setBusiness(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingState lines={6} />;
  if (error) return <ErrorState message={error} />;

  if (notFound || !business) {
    return (
      <EmptyState
        title={t('investor.business_not_found')}
        description={t('investor.business_not_found_description')}
        action={<Link className="btn btn-primary" to="/investor/campaigns">{t('investor.back_to_discover')}</Link>}
      />
    );
  }

  const vs = business.verificationStatus;
  const businessCampaigns = business.campaigns || [];
  const image = industryImage(business.industry, business.businessName);

  return (
    <div>
      <Link to="/investor/campaigns" className="back-link" style={{ textDecoration: 'none' }}>
        <ArrowLeft size={16} aria-hidden="true" /> {t('investor.back_to_discover')}
      </Link>

      {/* Business hero */}
      <div className="detail-hero">
        <SmartImage
          src={image.src}
          alt={`${business.businessName} — ${image.alt}`}
          aspectClass="media--21x9"
          overlay
        />
        <div style={{ position: 'relative', marginTop: '-4.5rem', padding: '0 1.5rem', zIndex: 2 }}>
          <div className="card card--pad-lg">
            <div className="workspace-card__heading" style={{ margin: 0 }}>
              <div>
                <p className="campaign-card__business" style={{ fontSize: '.8rem' }}>{business.industry || t('common.not_available')}</p>
                <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(1.5rem,3vw,2.2rem)', letterSpacing: '-.02em', marginBottom: '.3rem' }}>
                  {business.businessName}
                </h1>
                {vs && <VerificationBadge status={vs} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        {/* About */}
        <div className="card details-panel" style={{ marginBottom: '1.25rem', marginTop: '1.25rem' }}>
          <SectionHeader title={t('investor.about_business')} />
          {business.description ? (
            <p style={{ margin: 0, lineHeight: 1.7 }}>{business.description}</p>
          ) : (
            <p style={{ margin: 0, color: 'var(--ink-muted)' }}>{t('investor.no_description')}</p>
          )}
        </div>

        {/* Trust & due diligence */}
        <div className="card details-panel" style={{ marginBottom: '2rem' }}>
          <SectionHeader title={t('investor.trust_due_diligence')} />
          <div style={{ display: 'grid', gap: '0.75rem' }}>
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
            <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
            <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
          </div>
        </div>
      </div>

      {/* Active campaigns */}
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
        <div className="grid campaign-grid-mobile" style={{ marginTop: '1rem', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {businessCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      )}
    </div>
  );
};

export default BusinessProfile;
