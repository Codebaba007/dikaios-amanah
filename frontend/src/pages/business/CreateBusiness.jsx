import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ErrorState } from '../../components/UI';

const CreateBusiness = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', description: '', industry: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch('http://localhost:5000/api/business', {
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
        title={t('business.create_profile')}
        description={t('business.workspace_intro')}
      />
      <div className="form-shell">
        <div className="card" style={{ padding: '2rem' }}>
          {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="businessName">{t('business.business_name')}</label>
              <input
                id="businessName"
                className="form-input"
                value={formData.businessName}
                onChange={e => setFormData({ ...formData, businessName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="industry">{t('business.industry')}</label>
              <input
                id="industry"
                className="form-input"
                value={formData.industry}
                onChange={e => setFormData({ ...formData, industry: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="description">{t('business.description')}</label>
              <textarea
                id="description"
                className="form-input"
                rows="4"
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

export default CreateBusiness;
