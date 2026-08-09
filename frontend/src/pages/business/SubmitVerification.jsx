import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const SubmitVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('Document is required');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('verificationType', 'BUSINESS');

    try {
      const res = await fetch('http://localhost:5000/api/verification/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
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
        <h2>{t('business.submit_verification')}</h2>
        <p style={{ marginBottom: '1rem' }}>{t('business.upload_doc_help')}</p>

        {error && <div className="badge badge-error" style={{ marginBottom: '1rem', display: 'block' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t('business.document')}</label>
            <input
              type="file"
              className="form-input"
              onChange={e => setFile(e.target.files[0])}
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-full" style={{ marginTop: '1rem' }}>{t('business.submit')}</button>
        </form>
      </div>
    </div>
  );
};

export default SubmitVerification;
