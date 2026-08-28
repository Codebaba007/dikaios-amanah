import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader, ErrorState, TrustIndicator } from '../../components/UI';

const SubmitVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError('A supporting document is required.');

    setError('');
    setSubmitting(true);

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
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={t('business.submit_verification')}
        description={t('business.upload_doc_help')}
      />
      <div className="form-shell">
        <div className="card" style={{ padding: '2rem' }}>

          <div style={{ marginBottom: '1.5rem' }}>
            <TrustIndicator
              title={t('trust.document_title')}
              description={t('trust.document_description')}
            />
          </div>

          {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="verificationDoc">{t('business.document')}</label>
              <p className="form-help">{t('business.upload_doc_help')}</p>
              <input
                id="verificationDoc"
                type="file"
                className="form-input"
                onChange={e => setFile(e.target.files[0])}
                accept=".pdf,.jpg,.jpeg,.png"
                required
                style={{ paddingTop: '.55rem' }}
              />
            </div>

            <div className="simulated-notice" style={{ marginTop: '.5rem' }}>
              The document you submit will be stored locally with a SHA-256 integrity hash for verification review. No document content is placed in the audit chain.
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }} disabled={submitting}>
              {submitting ? t('common.loading') : t('business.submit')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SubmitVerification;
