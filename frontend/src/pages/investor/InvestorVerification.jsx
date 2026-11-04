import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, CheckCircle2, Clock3, Upload } from 'lucide-react';
import {
  PageHeader, ErrorState, TrustIndicator, VerificationBadge, LoadingState, SectionHeader
} from '../../components/UI';
import { apiRequest, apiUpload } from '../../lib/api';

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
      const { ok, data } = await apiRequest('/api/investor/verification/status');
      if (!ok) throw new Error(t('common.error'));
      setVerificationData(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
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
      const { ok, data } = await apiUpload('/api/investor/verification/submit', formData);
      if (!ok) throw new Error(data?.error || t('common.error'));
      setFile(null);
      fetchStatus();
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState lines={5} />;

  const status = verificationData?.status || 'NOT_SUBMITTED';
  const verification = verificationData?.verification;
  const canSubmit = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  const statusMessage = () => {
    if (status === 'APPROVED') return t('investor.verification_approved_body');
    if (status === 'REJECTED') return t('investor.verification_rejected_body');
    if (status === 'PENDING') return t('investor.verification_pending_body');
    return t('investor.verification_not_submitted_body');
  };

  const StatusBanner = () => {
    const icons = {
      APPROVED: <CheckCircle2 size={18} aria-hidden="true" />,
      PENDING: <Clock3 size={18} aria-hidden="true" />,
      REJECTED: <AlertCircle size={18} aria-hidden="true" />
    };
    const classes = { APPROVED: 'alert alert--success', PENDING: 'alert alert--info', REJECTED: 'alert alert--error' };
    return (
      <div className={classes[status] || 'alert alert--info'} style={{ display: 'flex', gap: '.6rem', alignItems: 'center', marginBottom: '1rem' }}>
        {icons[status]}
        <span>{statusMessage()}</span>
      </div>
    );
  };

  return (
    <div className="form-shell" style={{ margin: 0 }}>
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.identity_verification')}
        description={t('investor.verification_intro')}
      />

      {/* Current status */}
      <div className="card card--pad-lg" style={{ marginBottom: '1.5rem' }}>
        <div className="workspace-card__heading">
          <SectionHeader title={t('investor.verification_status_title')} />
          {status !== 'NOT_SUBMITTED' && <VerificationBadge status={status} />}
        </div>
        <StatusBanner />

        {status === 'REJECTED' && verification?.remarks && (
          <div className="alert alert--error" style={{ marginTop: '0.75rem' }}>
            <strong>{t('admin.remarks')}: </strong>{verification.remarks}
          </div>
        )}
      </div>

      {canSubmit && (
        <div className="card card--pad-lg">
          <div style={{ marginBottom: '1.5rem' }}>
            <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
          </div>

          {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="investorVerificationDoc">{t('investor.identity_document')}</label>
              <p className="form-help">{t('investor.upload_identity_help')}</p>
              <label htmlFor="investorVerificationDoc" className="file-drop" style={{ marginTop: '0.5rem' }}>
                <Upload size={22} aria-hidden="true" />
                <strong>{file ? t('investor.file_selected') : t('business.choose_file')}</strong>
                <span>{file ? file.name : 'PDF, JPG, PNG'}</span>
                <input
                  id="investorVerificationDoc"
                  type="file"
                  onChange={e => setFile(e.target.files[0])}
                  accept=".pdf,.jpg,.jpeg,.png"
                  required
                />
              </label>
              {file && (
                <div className="file-chip">
                  <span>{file.name}</span>
                  <button type="button" className="btn btn-quiet btn-sm" onClick={() => setFile(null)}>{t('business.remove_file')}</button>
                </div>
              )}
            </div>

            <div className="simulated-notice" style={{ marginTop: '0.5rem' }}>
              <span aria-hidden="true">⚠</span>
              <span>{t('investor.doc_integrity_notice')}</span>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }} disabled={submitting}>
              {submitting ? t('common.loading') : t('investor.submit_verification')}
            </button>
          </form>
        </div>
      )}

      {status === 'APPROVED' && (
        <div className="card card--pad-lg">
          <TrustIndicator title={t('trust.verification_approved')} description={t('investor.verification_approved_detail')} />
        </div>
      )}

      {status === 'PENDING' && (
        <div className="card card--pad-lg">
          <TrustIndicator title={t('trust.verification_pending')} description={t('investor.verification_pending_detail')} />
        </div>
      )}
    </div>
  );
};

export default InvestorVerification;
