import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressBar, StatusBadge } from './UI';

const CampaignCard = ({ campaign }) => {
  const { t } = useTranslation();
  const goal = Number(campaign.fundingGoal) || 0;
  const funded = Number(campaign.currentFunding) || 0;
  const progress = goal ? (funded / goal) * 100 : 0;
  return <article className="campaign-card"><div className="campaign-card__topline"><span className="campaign-card__industry">{campaign.business?.industry || t('common.not_available')}</span><StatusBadge status={campaign.status} /></div><p className="campaign-card__business">{campaign.business?.businessName || t('common.not_available')}</p><h3>{campaign.title}</h3><p className="campaign-card__description">{campaign.description}</p><div className="campaign-card__funding"><div><span>{t('campaign.raised')}</span><strong>${funded.toLocaleString()}</strong></div><div><span>{t('campaign.target')}</span><strong>${goal.toLocaleString()}</strong></div></div><ProgressBar compact value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} /><Link className="btn btn-primary btn-block" to={`/investor/campaigns/${campaign.id}`}>{t('investor.campaign_details')}</Link></article>;
};

export default CampaignCard;
