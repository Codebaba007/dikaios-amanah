import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './UI';

const BusinessCard = ({ business }) => {
  const { t } = useTranslation();
  const campaignCount = business.activeCampaignCount ?? business.campaignCount ?? 0;

  return (
    <article className="business-card card">
      <div className="business-card__topline">
        <span className="business-card__industry">{business.industry || t('common.not_available')}</span>
        <StatusBadge status="ACTIVE" label={t('investor.active_campaigns_count', { count: campaignCount })} />
      </div>
      <h3 className="business-card__name">{business.businessName}</h3>
      <p className="business-card__description">{business.description || t('common.not_available')}</p>
      <div className="business-card__actions">
        <Link className="btn btn-primary btn-block" to={`/investor/businesses/${business.id}`}>
          {t('investor.view_business')}
        </Link>
      </div>
    </article>
  );
};

export default BusinessCard;
