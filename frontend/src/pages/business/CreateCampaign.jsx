import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ErrorState } from '../../components/UI';

const CreateCampaign = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', fundingGoal: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      navigate('/business');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={t('business.create_campaign')}
        description="Your campaign will be submitted for administrator review before becoming active."
      />
      <div className="form-shell">
        <div className="card" style={{ padding: '2rem' }}>
          <div className="simulated-notice" style={{ marginBottom: '1.25rem' }}>
            {t('campaign.simulated_notice')}
          </div>

          {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="campaignTitle">{t('business.campaign_title')}</label>
              <input
                id="campaignTitle"
                className="form-input"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="fundingGoal">{t('business.funding_goal')}</label>
              <input
                id="fundingGoal"
                type="number"
                min="1"
                step="0.01"
                className="form-input"
                value={formData.fundingGoal}
                onChange={e => setFormData({ ...formData, fundingGoal: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="campaignDescription">{t('business.description')}</label>
              <textarea
                id="campaignDescription"
                className="form-input"
                rows="5"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={submitting}>
              {submitting ? t('common.loading') : t('business.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateCampaign;
