import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';

const CampaignDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCampaign();
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/investor/campaigns/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCampaign(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/api/investor/invest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ campaignId: id, amount: parseFloat(amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSuccess('Simulated investment successful! Portfolio updated.');
      setAmount('');
      fetchCampaign(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="container">Loading...</div>;
  if (error && !campaign) return <div className="container" style={{ color: 'var(--status-error)' }}>{error}</div>;

  const progress = (parseFloat(campaign.currentFunding) / parseFloat(campaign.fundingGoal)) * 100;
  const remaining = parseFloat(campaign.fundingGoal) - parseFloat(campaign.currentFunding);

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <button onClick={() => navigate(-1)} className="btn btn-secondary" style={{ marginBottom: '1rem' }}>â† Back</button>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column: Details */}
        <div>
          <h2>{campaign.title}</h2>
          <p className="badge badge-success" style={{ marginBottom: '1rem' }}>{campaign.status}</p>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>Business Information</h3>
            <p><strong>Name:</strong> {campaign.business.businessName}</p>
            <p><strong>Industry:</strong> {campaign.business.industry}</p>
            <p style={{ marginTop: '1rem' }}>{campaign.business.description}</p>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3>Campaign Information</h3>
            <p>{campaign.description}</p>
          </div>

          {campaign.profitDeclarations?.length > 0 && (
            <div className="card">
              <h3>{t('investor.profit_declarations')}</h3>
              <ul>
                {campaign.profitDeclarations.map(p => (
                  <li key={p.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <strong>{p.period}:</strong> ${p.amount} declared (Status: {p.status})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Column: Investment Form */}
        <div>
          <div className="card sticky" style={{ top: '2rem' }}>
            <h3>{t('investor.funding_progress')}</h3>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0' }}>
              ${campaign.currentFunding} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>/ ${campaign.fundingGoal}</span>
            </div>

            <div style={{ height: '12px', background: 'var(--border-color)', borderRadius: '6px', overflow: 'hidden', marginBottom: '1rem' }}>
              <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: 'var(--primary-color)' }}></div>
            </div>

            <p style={{ marginBottom: '1.5rem' }}><strong>{t('investor.remaining_capacity')}:</strong> ${remaining.toFixed(2)}</p>

            {error && <div className="badge badge-error" style={{ marginBottom: '1rem', display: 'block', padding: '0.75rem' }}>{error}</div>}
            {success && <div className="badge badge-success" style={{ marginBottom: '1rem', display: 'block', padding: '0.75rem' }}>{success}</div>}

            {remaining > 0 ? (
              <form onSubmit={handleInvest}>
                <div className="form-group">
                  <label className="form-label">{t('investor.investment_amount')}</label>
                  <input
                    type="number"
                    min="1"
                    max={remaining}
                    step="0.01"
                    className="form-input"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                  />
                  <small style={{ color: 'var(--text-secondary)', display: 'block', marginTop: '0.5rem' }}>
                    Note: This is a simulated beta transaction. No real money will be transferred.
                  </small>
                </div>
                <button type="submit" className="btn btn-primary w-full">{t('investor.confirm_investment')}</button>
              </form>
            ) : (
              <div className="badge badge-info" style={{ display: 'block', padding: '1rem', textAlign: 'center' }}>
                Funding goal reached!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetails;
