import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';
import {
  PageHeader, SectionHeader, EmptyState, LoadingState, ErrorState,
  StatusBadge, StatCard, SimulatedNotice, SmartImage
} from '../../components/UI';
import { industryImage } from '../../lib/images';
import { apiRequest } from '../../lib/api';

const Portfolio = () => {
  const { t } = useTranslation();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const { ok, data } = await apiRequest('/api/investor/portfolio');
        if (!ok) throw new Error(t('common.error'));
        setInvestments(data || []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [t]);

  const total = useMemo(() => investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0), [investments]);

  const distribution = useMemo(() => {
    const rows = new Map();
    investments.forEach(inv => {
      const key = inv.campaign?.title || t('common.not_available');
      const current = rows.get(key) || { title: key, amount: 0 };
      current.amount += Number(inv.amount || 0);
      rows.set(key, current);
    });
    return [...rows.values()].sort((a, b) => b.amount - a.amount);
  }, [investments, t]);

  if (loading) return <LoadingState lines={6} />;
  if (error) return <ErrorState message={error} />;

  return (
    <div>
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.portfolio')}
        description={t('investor.portfolio_intro')}
        actions={<Link to="/investor/campaigns" className="btn btn-primary">{t('investor.browse_campaigns')}</Link>}
      />

      {investments.length > 0 && (
        <>
          <div className="grid grid--3" style={{ marginBottom: '1.5rem' }}>
            <StatCard
              label={t('investor.stat_total_invested')}
              value={`$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              accent
            />
            <StatCard label={t('investor.stat_positions')} value={investments.length} />
            <StatCard label={t('investor.stat_campaigns_backed')} value={distribution.length} />
          </div>

          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <div className="workspace-card__heading" style={{ marginBottom: '.5rem' }}>
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>
                  <PieChart size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('investor.portfolio')}
                </p>
                <h2 style={{ fontSize: '1.1rem', margin: '0.15rem 0 0' }}>{t('investor.stat_distribution')}</h2>
              </div>
            </div>
            <p className="form-help" style={{ marginBottom: '0.9rem' }}>{t('investor.distribution_hint')}</p>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {distribution.map(row => {
                const share = total ? (row.amount / total) * 100 : 0;
                return (
                  <div key={row.title}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', fontSize: '0.86rem', marginBottom: '0.25rem' }}>
                      <span className="td-strong" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.title}</span>
                      <span style={{ color: 'var(--ink-muted)' }}>${row.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })} · {Math.round(share)}%</span>
                    </div>
                    <div className="progress__track" style={{ height: 6 }}>
                      <div className="progress__fill" style={{ width: `${share}%`, height: '100%' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {investments.length === 0 ? (
        <EmptyState
          title={t('investor.no_investments')}
          description={t('investor.portfolio_intro')}
          action={<Link to="/investor/campaigns" className="btn btn-primary">{t('investor.browse_campaigns')}</Link>}
        />
      ) : (
        <>
          <SectionHeader title={t('investor.investment_history')} />
          <div className="table-wrap" style={{ marginBottom: '1.25rem' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('investor.invested_at')}</th>
                  <th>{t('investor.campaign_details')}</th>
                  <th>{t('campaign.business')}</th>
                  <th>{t('campaign.funding_progress')}</th>
                  <th>{t('investor.status')}</th>
                </tr>
              </thead>
              <tbody>
                {investments.map(inv => {
                  const image = industryImage(inv.campaign?.business?.industry, inv.campaign?.title);
                  return (
                    <tr key={inv.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {new Date(inv.investedAt).toLocaleDateString()}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '.6rem', alignItems: 'center', minWidth: 0 }}>
                          <SmartImage src={image.src} alt={image.alt} aspectClass="media--1x1" className="portfolio-thumb" />
                          <Link to={`/investor/campaigns/${inv.campaignId}`} className="table-link" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {inv.campaign?.title}
                          </Link>
                        </div>
                      </td>
                      <td style={{ color: 'var(--ink-muted)' }}>{inv.campaign?.business?.businessName}</td>
                      <td className="td-money">
                        ${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td><StatusBadge status={inv.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <SimulatedNotice />
        </>
      )}
    </div>
  );
};

export default Portfolio;
