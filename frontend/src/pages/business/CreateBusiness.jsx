import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const CreateBusiness = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ businessName: '', description: '', industry: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    }
  };

  return (
    <div className="flex justify-center animate-fade-in" style={{ marginTop: '2rem' }}>
      <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
        <h2>{t('business.create_profile')}</h2>
        {error && <div className="badge badge-error" style={{ marginBottom: '1rem', display: 'block' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('business.business_name')}</label>
            <input className="form-input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('business.industry')}</label>
            <input className="form-input" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">{t('business.description')}</label>
            <textarea className="form-input" rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>{t('business.submit')}</button>
        </form>
      </div>
    </div>
  );
};

export default CreateBusiness;
