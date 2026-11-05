import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { AlertCircle, ClipboardList, PieChart, ScanSearch, Wallet } from 'lucide-react';
import {
  PageHeader, SectionHeader, StatCard, EmptyState, LoadingState, ErrorState,
  VerificationBadge, SimulatedNotice
} from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';
import { apiRequest } from '../../lib/api';

const InvestorDashboard = () => {
  const { t } = useTranslation();
  const [portfolio, setPortfolio] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portfolioRes, campaignsRes, verificationRes] = await Promise.all([
          apiRequest('/api/investor/portfolio'),
          apiRequest('/api/investor/campaigns'),
          apiRequest('/api/investor/verification/status')
        ]);
        if (!portfolioRes.ok || !campaignsRes.ok) throw new Error(t('common.error'));
        setPortfolio(portfolioRes.data || []);
        setCampaigns(campaignsRes.data || []);
        setVerification(verificationRes.ok ? verificationRes.data : null);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [t]);

  const totalInvested = useMemo(
    () => portfolio.reduce((sum, inv) => sum + Number(inv.amount || 0), 0),
    [portfolio]
  );
  const uniqueCampaigns = useMemo(
    () => new Set(portfolio?.map(inv => inv.campaignId)).size || 0,
    [portfolio]
  );

  // Portfolio distribution per campaign (CSS bar, no chart dependency)
  const distribution = useMemo(() => {
    const rows = new Map();
    portfolio.forEach(inv => {
      const key = inv.campaign?.title || t('common.not_available');
      const current = rows.get(key) || { title: key, id: inv.campaign?.id, amount: 0 };
      current.amount += Number(inv.amount || 0);
      rows.set(key, current);
    });
    return [...rows.values()].sort((a, b) => b.amount - a.amount);
  }, [portfolio, t]);

  const verificationStatus = verification?.status || 'NOT_SUBMITTED';

  return (
    <div>
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.dashboard')}
        description={t('investor.overview_intro')}
        badge={verification?.status ? <VerificationBadge status={verificationStatus} /> : null}
      />

      {verificationStatus !== 'APPROVED' && (
        <div className="alert alert--info" style={{ display: 'flex', gap: '0.9rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span style={{ flex: '1 1 320px' }}>{t('investor.guide_verification')}</span>
          <Link to="/investor/verify" className="btn btn-secondary btn-sm">{t('investor.guide_verification_action')}</Link>
        </div>
      )}

      {loading ? (
        <LoadingState lines={5} />
      ) : error ? (
        <ErrorState message={error} />
      ) : (
        <>
          <div className="grid grid--3" style={{ marginBottom: '1.75rem' }}>
            <StatCard label={t('investor.stat_total_invested')} value={`$${totalInvested.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} accent />
            <StatCard label={t('investor.stat_positions')} value={portfolio.length} />
            <StatCard label={t('investor.stat_campaigns_backed')} value={uniqueCampaigns} hint={t('investor.overview_backed_hint')} />
          </div>

          {distribution.length > 0 && (
            <div className="card" style={{ marginBottom: '1.75rem' }}>
              <div className="workspace-card__heading" style={{ marginBottom: '0.75rem' }}>
                <div>
                  <p className="eyebrow">{t('investor.distributions')}</p>
                  <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{t('investor.stat_distribution')}</h2>
                </div>
                <Link to="/investor/portfolio" className="btn btn-secondary btn-sm"><PieChart size={15} aria-hidden="true" /> {t('investor.portfolio')}</Link>
              </div>
              <p className="form-help" style={{ marginTop: 0, marginBottom: '0.9rem' }}>{t('investor.distribution_hint')}</p>
              <div style={{ display: 'grid', gap: '0.7rem' }}>
                {distribution.slice(0, 5).map(row => {
                  const share = totalInvested ? (row.amount / totalInvested) * 100 : 0;
                  return (
                    <div key={row.title}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.86rem', marginBottom: '0.25rem' }}>
                        <span className="td-strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
                        <span style={{ color: 'var(--ink-muted)' }}>${row.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} · {Math.round(share)}%</span>
                      </div>
                      <div className="progress__track" style={{ height: 6 }}><div className="progress__fill" style={{ width: `${share}%`, height: '100%' }} /></div>
                    </div>
                  );
                })}
              </div>
              <SimulatedNotice />
            </div>
          )}

          <div className="grid grid--2" style={{ marginBottom: '1rem' }}>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p className="eyebrow" style={{ margin: 0 }}><ScanSearch size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('investor.overview_featured')}</p>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{t('investor.browse_campaigns')}</h2>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{t('investor.overview_features_hint')}</p>
              <Link to="/investor/campaigns" className="btn btn-primary btn-sm" style={{ width: 'fit-content' }}>
                <ScanSearch size={15} aria-hidden="true" /> {t('investor.browse_campaigns')}
              </Link>
            </div>
            <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <p className="eyebrow" style={{ margin: 0 }}><ClipboardList size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" />&nbsp;{t('investor.investment_history')}</p>
              <h2 style={{ fontSize: '1.15rem', margin: 0 }}>{t('investor.portfolio')}</h2>
              <p style={{ margin: 0, fontSize: '0.9rem' }}>{t('investor.portfolio_intro')}</p>
              <Link to="/investor/portfolio" className="btn btn-secondary btn-sm" style={{ width: 'fit-content' }}>
                <Wallet size={15} aria-hidden="true" /> {t('investor.portfolio')}
              </Link>
            </div>
          </div>

          {campaigns.length > 0 && (
            <SectionHeader title={t('investor.overview_featured')} description={t('investor.discover_intro')} />
          )}
          {campaigns.length === 0 ? (
            <EmptyState
              title={t('investor.no_campaigns')}
              icon={<ScanSearch size={22} aria-hidden="true" />}
            />
          ) : (
            <div className="grid campaign-grid-mobile" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
              {campaigns.slice(0, 3).map(c => <CampaignCard key={c.id} campaign={c} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InvestorDashboard;
