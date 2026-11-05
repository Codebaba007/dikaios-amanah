import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SmartImage } from './UI';
import { industryImage } from '../lib/images';

const BusinessCard = ({ business }) => {
  const { t } = useTranslation();
  const campaignCount = business.activeCampaignCount ?? business.campaignCount ?? 0;
  const image = industryImage(business.industry, business.businessName);

  return (
    <article className="campaign-card">
      <Link to={`/investor/businesses/${business.id}`} aria-label={t('investor.view_business')} style={{ display: 'block' }}>
        <SmartImage
          src={image.src}
          alt={`${business.businessName || t('common.not_available')} — ${image.alt}`}
          aspectClass="media--3x2"
        >
          <span className="media__badge status-badge status-badge--neutral" style={{ background: 'rgba(255,255,255,.85)' }}>
            {business.industry || t('common.not_available')}
          </span>
        </SmartImage>
      </Link>
      <div className="campaign-card__body">
        <h3 style={{ margin: '0 0 0.25rem' }}>{business.businessName || t('common.not_available')}</h3>
        <p className="campaign-card__description" style={{ minHeight: '3.6rem' }}>
          {business.description || t('common.not_available')}
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0.25rem 0 1rem' }}>
          <span className="tag">{t('investor.active_campaigns_count', { count: campaignCount })}</span>
          <span className="status-badge status-badge--success" style={{ textTransform: 'none' }}>
            {t('trust.verification_approved')}
          </span>
        </div>
        <div className="campaign-card__action">
          <Link className="btn btn-secondary btn-block" to={`/investor/businesses/${business.id}`}>
            {t('investor.view_business')}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default BusinessCard;
