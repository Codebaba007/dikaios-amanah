import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ErrorState } from '../../components/UI';
import { apiRequest } from '../../lib/api';

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
      const { ok, data } = await apiRequest('/api/business', { method: 'POST', body: formData });
      if (!ok) throw new Error(data?.error || t('common.error'));
      navigate('/business');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="form-shell" style={{ margin: 0 }}>
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={t('business.create_profile')}
        description={t('business.workspace_intro')}
      />
      <div className="card card--pad-lg" >
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
              placeholder={t('business.industry_placeholder')}
              value={formData.industry}
              onChange={e => setFormData({ ...formData, industry: e.target.value })}
              required
            />
            <p className="form-help">{t('business.industry_help')}</p>
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
  );
};

export default CreateBusiness;
