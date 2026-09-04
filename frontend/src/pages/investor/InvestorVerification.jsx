import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, ErrorState, TrustIndicator, VerificationBadge, LoadingState, SectionHeader } from '../../components/UI';

const InvestorVerification = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [verificationData, setVerificationData] = useState(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/investor/verification/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      const data = await res.json();
      setVerificationData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setError(t('investor.doc_required'));

    setError('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('document', file);

    try {
      const res = await fetch('http://localhost:5000/api/investor/verification/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFile(null);
      fetchStatus();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;

  const status = verificationData?.status || 'NOT_SUBMITTED';
  const verification = verificationData?.verification;
  const canSubmit = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  const statusMessage = () => {
    if (status === 'APPROVED') return t('investor.verification_approved_body');
    if (status === 'REJECTED') return t('investor.verification_rejected_body');
    if (status === 'PENDING') return t('investor.verification_pending_body');
    return t('investor.verification_not_submitted_body');
  };

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.identity_verification')}
        description={t('investor.verification_intro')}
      />

      <div className="form-shell">
        {/* Current status */}
        <div className="card" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
          <div className="workspace-card__heading">
            <div>
              <SectionHeader title={t('investor.verification_status_title')} />
            </div>
            {status !== 'NOT_SUBMITTED' && <VerificationBadge status={status} />}
          </div>
          <p style={{ margin: '.75rem 0 0' }}>{statusMessage()}</p>

          {status === 'REJECTED' && verification?.remarks && (
            <div className="alert alert--error" style={{ marginTop: '.75rem' }}>
              <strong>{t('admin.remarks')}: </strong>{verification.remarks}
            </div>
          )}
        </div>

        {/* Submit form */}
        {canSubmit && (
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
                <label className="form-label" htmlFor="investorVerificationDoc">{t('investor.identity_document')}</label>
                <p className="form-help">{t('investor.upload_identity_help')}</p>
                <input
                  id="investorVerificationDoc"
                  type="file"
                  className="form-input"
                  onChange={e => setFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                  style={{ paddingTop: '.55rem' }}
                />
              </div>

              <div className="simulated-notice" style={{ marginTop: '.5rem' }}>
                {t('investor.doc_integrity_notice')}
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }} disabled={submitting}>
                {submitting ? t('common.loading') : t('investor.submit_verification')}
              </button>
            </form>
          </div>
        )}

        {/* Approved state */}
        {status === 'APPROVED' && (
          <div className="card" style={{ padding: '2rem' }}>
            <TrustIndicator
              title={t('trust.verification_approved')}
              description={t('investor.verification_approved_detail')}
            />
          </div>
        )}

        {/* Pending state */}
        {status === 'PENDING' && (
          <div className="card" style={{ padding: '2rem' }}>
            <TrustIndicator
              title={t('trust.verification_pending')}
              description={t('investor.verification_pending_detail')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InvestorVerification;
