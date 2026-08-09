import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Portfolio = () => {
  const { t } = useTranslation();
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investor/portfolio', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setInvestments(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{t('investor.portfolio')} & {t('investor.investment_history')}</h2>
        <Link to="/investor" className="btn btn-secondary">Back to Dashboard</Link>
      </div>

      {investments.length === 0 ? (
        <p>{t('investor.no_investments')} <Link to="/investor/campaigns" style={{ color: 'var(--primary-color)' }}>Browse campaigns</Link> to get started.</p>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem' }}>{t('investor.invested_at')}</th>
                <th style={{ padding: '1rem' }}>Campaign</th>
                <th style={{ padding: '1rem' }}>Business</th>
                <th style={{ padding: '1rem' }}>Amount</th>
                <th style={{ padding: '1rem' }}>{t('investor.status')}</th>
              </tr>
            </thead>
            <tbody>
              {investments.map(inv => (
                <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(inv.investedAt).toLocaleDateString()}</td>
                  <td style={{ padding: '1rem' }}>
                    <Link to={`/investor/campaigns/${inv.campaignId}`} style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {inv.campaign.title}
                    </Link>
                  </td>
                  <td style={{ padding: '1rem' }}>{inv.campaign.business.businessName}</td>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>${parseFloat(inv.amount).toFixed(2)}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-success">{inv.status}</span></td>
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
