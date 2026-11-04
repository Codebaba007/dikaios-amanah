import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, FileCheck2, FileText, Upload, X
} from 'lucide-react';
import {
  PageHeader, ErrorState, SuccessState, LoadingState, VerificationBadge,
  TrustIndicator, SimulatedNotice
} from '../../components/UI';
import { apiRequest, apiUpload } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const SubmitVerification = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const redirectTimer = useRef(null);

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const loadBusiness = async () => {
      try {
        const { ok, status, data } = await apiRequest('/api/business');
        if (!active) return;
        if (ok) setBusiness(data);
        else if (status !== 404) setError(t('common.error'));
      } catch {
        if (active) setError(t('common.error'));
      } finally {
        if (active) setLoading(false);
      }
    };
    loadBusiness();
    return () => {
      active = false;
      if (redirectTimer.current) window.clearTimeout(redirectTimer.current);
    };
  }, [t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError(t('business.document_required'));
      return;
    }

    setError('');
    setSuccess('');
    setSubmitting(true);

    const formData = new FormData();
    formData.append('document', file);
    formData.append('verificationType', 'BUSINESS');

    try {
      const { ok, data } = await apiUpload('/api/verification/submit', formData);
      if (!ok) throw new Error(data?.error || t('common.error'));

      setSuccess(t('business.verification_submitted'));
      setFile(null);
      redirectTimer.current = window.setTimeout(() => navigate('/business'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState lines={4} />;

  const status = business?.verificationStatus;
  const verifications = business?.verifications || [];
  const latest = verifications.length > 0
    ? [...verifications].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0]
    : null;

  const statusMessage = () => {
    if (status === 'APPROVED') return t('business.verification_approved_body');
    if (status === 'REJECTED') return t('business.verification_rejected_body');
    if (status === 'PENDING') return t('business.verification_pending_body');
    return t('business.verification_pending_body');
  };

  return (
    <div>
      <PageHeader
        eyebrow={t('business.dashboard')}
        title={t('business.submit_verification')}
        description={t('business.upload_doc_help')}
      />

      {!business ? (
        <div className="card card--pad-lg">
          <p className="eyebrow">{t('business.identity')}</p>
          <h2 style={{ fontSize: '1.2rem' }}>{t('business.status_not_submitted')}</h2>
          <p>{t('business.no_profile_warning')}</p>
          <Link to="/business/create" className="btn btn-primary">{t('business.create_profile')}</Link>
        </div>
      ) : (
        <div className="split-form">
          <div className="card card--pad-lg">
            <div className="workspace-card__heading">
              <div>
                <p className="eyebrow" style={{ margin: 0 }}>{t('business.verification_form_title')}</p>
                <h2 style={{ fontSize: '1.15rem', margin: '0.2rem 0 0' }}>{business.businessName}</h2>
              </div>
              <VerificationBadge status={status} />
            </div>

            <p style={{ marginBottom: '1.25rem' }}>{statusMessage()}</p>

            {status === 'REJECTED' && latest?.remarks && (
              <div className="alert alert--error" style={{ marginBottom: '1.25rem' }}>
                <strong>{t('business.reviewer_remarks')}: </strong>{latest.remarks}
              </div>
            )}
            {status === 'PENDING' && latest?.createdAt && (
              <div className="alert alert--info" style={{ marginBottom: '1.25rem' }}>
                {t('admin.submitted_at')}: {formatDateTime(latest.createdAt)}
              </div>
            )}

            {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
            {success && <div style={{ marginBottom: '1.25rem' }}><SuccessState message={success} /></div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="verificationDoc">{t('business.document')}</label>
                <p className="form-help">{t('business.upload_doc_help')}</p>
                <label htmlFor="verificationDoc" className="file-drop">
                  <Upload size={24} aria-hidden="true" />
                  <strong>{file ? t('business.file_selected') : t('business.choose_file')}</strong>
                  <span>{file ? file.name : t('business.accepted_files')}</span>
                  <input
                    id="verificationDoc"
                    type="file"
                    onChange={event => { setFile(event.target.files?.[0] || null); setError(''); }}
                    accept=".pdf,.jpg,.jpeg,.png"
                    required
                  />
                </label>

                {file && (
                  <div className="file-chip">
                    <FileText size={16} aria-hidden="true" />
                    <span>{file.name}</span>
                    <button type="button" className="btn btn-quiet btn-sm" onClick={() => setFile(null)} aria-label={t('business.remove_file')}>
                      <X size={14} aria-hidden="true" /> {t('business.remove_file')}
                    </button>
                  </div>
                )}
              </div>

              <SimulatedNotice />

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={submitting || Boolean(success)}>
                  {submitting ? t('common.loading') : t('business.submit')}
                </button>
                <Link to="/business" className="btn btn-secondary">{t('common.cancel')}</Link>
              </div>
            </form>
          </div>

          <aside className="guidance-stack">
            <div className="card">
              <p className="eyebrow" style={{ margin: 0 }}>
                <FileCheck2 size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('business.verification_guidance_title')}
              </p>
              <ul className="checklist">
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.verification_guidance_one')}</span></li>
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.verification_guidance_two')}</span></li>
                <li><CheckCircle2 size={15} aria-hidden="true" /><span>{t('business.verification_guidance_three')}</span></li>
              </ul>
            </div>

            <div className="card">
              <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
              <div style={{ marginTop: '0.75rem' }}>
                <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
              </div>
            </div>

            <div className="card">
              <p className="eyebrow" style={{ margin: 0 }}>{t('business.next_action')}</p>
              <p style={{ margin: '0.5rem 0 0', fontSize: '0.88rem' }}>{statusMessage()}</p>
              <Link to="/business" className="btn btn-quiet btn-sm" style={{ marginTop: '0.5rem', paddingLeft: 0 }}>
                {t('nav.dashboard')} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default SubmitVerification;
