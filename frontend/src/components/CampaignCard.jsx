import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressBar, StatusBadge, SmartImage } from './UI';
import { industryImage } from '../lib/images';

const CAMPAIGN_STATUS_LABELS = {
  PENDING: 'campaign.status_pending',
  APPROVED: 'campaign.status_approved',
  ACTIVE: 'campaign.status_active',
  COMPLETED: 'campaign.status_completed',
  REJECTED: 'campaign.status_rejected'
};

const CampaignCard = ({ campaign }) => {
  const { t } = useTranslation();
  const goal = Number(campaign.fundingGoal) || 0;
  const funded = Number(campaign.currentFunding) || 0;
  const progress = goal ? (funded / goal) * 100 : 0;
  const business = campaign.business || {};
  const image = industryImage(business.industry, campaign.title);

  return (
    <article className="campaign-card">
      <Link to={`/investor/campaigns/${campaign.id}`} aria-label={t('investor.campaign_details')} style={{ display: 'block' }}>
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
        <div className="campaign-card__meta">
          <div>
            <p className="campaign-card__business">{business.businessName || t('common.not_available')}</p>
            <h3 style={{ margin: '0.1rem 0 0' }}>{campaign.title}</h3>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '.5rem', marginBottom: '.6rem' }}>
          <StatusBadge status={campaign.status} label={t(CAMPAIGN_STATUS_LABELS[campaign.status] || 'common.not_available')} />
        </div>
        <p className="campaign-card__description">{campaign.description}</p>
        <div className="campaign-card__funding">
          <div>
            <span>{t('campaign.raised')}</span>
            <strong>${funded.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span>{t('campaign.target')}</span>
            <strong>${goal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</strong>
          </div>
        </div>
        <ProgressBar compact value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} />
        <div className="campaign-card__action">
          <Link className="btn btn-primary btn-block" to={`/investor/campaigns/${campaign.id}`}>
            {t('investor.campaign_details')}
          </Link>
        </div>
      </div>
    </article>
  );
};

export default CampaignCard;
