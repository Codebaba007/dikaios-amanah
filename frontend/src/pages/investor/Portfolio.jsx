import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { PageHeader, EmptyState, LoadingState, ErrorState, StatusBadge } from '../../components/UI';

const Portfolio = () => {
  const { t } = useTranslation();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investor/portfolio', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      setInvestments(await res.json());
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  // Compute total invested
  const total = investments.reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.portfolio')}
        description={t('investor.portfolio_intro')}
        actions={
          <Link to="/investor/campaigns" className="btn btn-primary">
            {t('investor.browse_campaigns')}
          </Link>
        }
      />

      {investments.length > 0 && (
        <div className="card workspace-card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2.5rem', flexWrap: 'wrap' }}>
            <div>
              <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Total Simulated</p>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)' }}>
                ${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="eyebrow" style={{ marginBottom: '.2rem' }}>Positions</p>
              <p style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--ink)' }}>
                {investments.length}
              </p>
            </div>
          </div>
          <div className="simulated-notice" style={{ marginTop: '1rem', marginBottom: 0 }}>
            {t('campaign.simulated_notice')}
          </div>
        </div>
      )}

      {investments.length === 0 ? (
        <EmptyState
          title={t('investor.no_investments')}
          description={t('investor.portfolio_intro')}
          action={<Link to="/investor/campaigns" className="btn btn-primary">{t('investor.browse_campaigns')}</Link>}
        />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t('investor.invested_at')}</th>
                <th>Campaign</th>
                <th>Business</th>
                <th>Amount</th>
                <th>{t('investor.status')}</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    {new Date(inv.investedAt).toLocaleDateString()}
                  </td>
                  <td>
                    <Link to={`/investor/campaigns/${inv.campaignId}`} style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
                      {inv.campaign.title}
                    </Link>
                  </td>
                  <td style={{ color: 'var(--ink-muted)' }}>{inv.campaign.business.businessName}</td>
                  <td style={{ fontWeight: 700 }}>${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                  <td><StatusBadge status={inv.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
