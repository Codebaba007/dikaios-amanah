import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, FileText, Search } from 'lucide-react';
import {
  PageHeader, StatusBadge, EmptyState, LoadingState, ErrorState,
  SuccessState, ConfirmDialog
} from '../../components/UI';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const ReviewVerifications = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('business');
  const [businessVerifications, setBusinessVerifications] = useState([]);
  const [investorVerifications, setInvestorVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  // Pending decision shown in the confirmation dialog.
  const [decision, setDecision] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [businessRes, investorRes] = await Promise.all([
        apiRequest('/api/admin/verifications/pending'),
        apiRequest('/api/admin/investor-verifications/pending')
      ]);
      if (!businessRes.ok || !investorRes.ok) throw new Error(t('common.error'));
      setBusinessVerifications(Array.isArray(businessRes.data) ? businessRes.data : []);
      setInvestorVerifications(Array.isArray(investorRes.data) ? investorRes.data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const isBusiness = activeTab === 'business';
  const currentItems = isBusiness ? businessVerifications : investorVerifications;

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return currentItems;
    return currentItems.filter(item => {
      const haystack = isBusiness
        ? `${item.business?.businessName || ''} ${item.business?.owner?.name || ''} ${item.business?.owner?.email || ''} ${item.business?.industry || ''}`
        : `${item.investor?.name || ''} ${item.investor?.email || ''}`;
      return haystack.toLowerCase().includes(term);
    });
  }, [currentItems, search, isBusiness]);

  const openDecision = (item, action) => {
    setDecision({ item, action });
    setRemarks('');
    setRemarkError('');
    setFeedback('');
  };

  const closeDecision = () => {
    if (submitting) return;
    setDecision(null);
    setRemarks('');
    setRemarkError('');
  };

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.action === 'REJECTED' && !remarks.trim()) {
      setRemarkError(t('admin.rejection_required'));
      return;
    }

    setSubmitting(true);
    const { item, action } = decision;
    const endpoint = isBusiness ? 'verifications' : 'investor-verifications';

    try {
      const { ok, data } = await apiRequest(`/api/admin/${endpoint}/${item.id}/review`, {
        method: 'POST',
        body: { action, remarks: action === 'REJECTED' ? remarks.trim() : '' }
      });
      if (!ok) throw new Error(data?.error || t('admin.review_failed'));

      // Reflect the decision locally and drop the reviewed item from the queue.
      const remove = (list) => list.filter(entry => entry.id !== item.id);
      if (isBusiness) setBusinessVerifications(remove);
      else setInvestorVerifications(remove);

      setFeedback(t('admin.review_recorded'));
      setDecision(null);
      setRemarks('');
    } catch (err) {
      setRemarkError(err.message || t('admin.review_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState lines={5} />;

  const applicantName = (item) => (isBusiness ? item.business?.businessName : item.investor?.name) || t('common.not_available');
  const applicantContact = (item) => (isBusiness ? item.business?.owner?.email : item.investor?.email) || t('common.not_available');
  const submittedAt = (item) => item.createdAt || item.submittedAt;

  return (
    <div>
      <PageHeader
        eyebrow={t('admin.role_label')}
        title={t('admin.verification_queue')}
        description={t('admin.review_intro')}
      />

      {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
      {feedback && <div style={{ marginBottom: '1.25rem' }}><SuccessState message={feedback} /></div>}

      <div className="discovery-tabs" role="tablist" aria-label={t('admin.verification_queue')}>
        <button
          role="tab"
          aria-selected={activeTab === 'business'}
          className={`discovery-tab${activeTab === 'business' ? ' discovery-tab--active' : ''}`}
          onClick={() => { setActiveTab('business'); setSearch(''); }}
        >
          {t('investor.tab_business_verifications')} ({businessVerifications.length})
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'investor'}
          className={`discovery-tab${activeTab === 'investor' ? ' discovery-tab--active' : ''}`}
          onClick={() => { setActiveTab('investor'); setSearch(''); }}
        >
          {t('investor.tab_investor_verifications')} ({investorVerifications.length})
        </button>
      </div>

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '.8rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={t('admin.search_verifications')}
            aria-label={t('admin.search_verifications')}
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <span className="result-count" style={{ margin: 0 }}>
          {t('admin.pending_count', { count: filteredItems.length })}
        </span>
      </div>

      {currentItems.length === 0 ? (
        <EmptyState
          title={t('admin.no_pending')}
          description={t('admin.queue_empty_body')}
          icon={<CheckCircle2 size={22} aria-hidden="true" />}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={t('admin.no_search_matches')}
          action={<button className="btn btn-secondary" onClick={() => setSearch('')}>{t('common.clear')}</button>}
          icon={<Search size={20} aria-hidden="true" />}
        />
      ) : (
        <div className="review-grid">
          {filteredItems.map(item => (
            <article key={item.id} className="card review-card">
              <div className="workspace-card__heading">
                <div>
                  <p className="eyebrow" style={{ margin: 0 }}>
                    {isBusiness ? (item.verificationType || t('admin.business_type')) : t('admin.identity_type')}
                  </p>
                  <h3 style={{ margin: '0.15rem 0 0' }}>{applicantName(item)}</h3>
                  <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                    {isBusiness ? `${item.business?.owner?.name || ''} · ${applicantContact(item)}` : applicantContact(item)}
                  </p>
                </div>
                <StatusBadge status="PENDING" label={t('business.status_pending')} />
              </div>

              <dl className="review-meta">
                <div>
                  <dt>{t('admin.submitted_at')}</dt>
                  <dd>{formatDateTime(submittedAt(item))}</dd>
                </div>
                {isBusiness && (
                  <div>
                    <dt>{t('business.industry')}</dt>
                    <dd>{item.business?.industry || t('common.not_available')}</dd>
                  </div>
                )}
                <div>
                  <dt>{t('admin.document')}</dt>
                  <dd>{item.documents?.length || 0}</dd>
                </div>
              </dl>

              {item.documents?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p className="eyebrow" style={{ marginBottom: '0.4rem' }}>{t('admin.document_metadata')}</p>
                  {item.documents.map(doc => (
                    <div key={doc.id} className="doc-item">
                      <strong style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <FileText size={13} aria-hidden="true" /> {doc.fileName}
                      </strong>
                      <div className="doc-meta">
                        <span>{doc.fileType}</span>
                      </div>
                      <p className="hash" style={{ margin: 0 }} title={doc.integrityHash}>{doc.integrityHash}</p>
                    </div>
                  ))}
                  <p className="form-help" style={{ marginTop: '0.4rem' }}>{t('admin.hash_note')}</p>
                </div>
              )}

              <div className="review-card__actions">
                <button
                  onClick={() => openDecision(item, 'APPROVED')}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {t('admin.approve')}
                </button>
                <button
                  onClick={() => openDecision(item, 'REJECTED')}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(decision)}
        tone={decision?.action === 'REJECTED' ? 'danger' : 'primary'}
        title={decision?.action === 'REJECTED' ? t('admin.confirm_reject_title') : t('admin.confirm_approve_title')}
        description={decision?.action === 'REJECTED' ? t('admin.confirm_reject_body') : t('admin.confirm_approve_body')}
        confirmLabel={decision?.action === 'REJECTED' ? t('admin.reject') : t('admin.approve')}
        onCancel={closeDecision}
        onConfirm={submitDecision}
        busy={submitting}
      >
        {decision && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'var(--ink)' }}>
              <strong>{applicantName(decision.item)}</strong>
            </p>
            <label className="form-label" htmlFor="verification-remarks" style={{ fontSize: '0.82rem' }}>
              {t('admin.remarks')}
              {decision.action === 'REJECTED' ? ` (${t('common.required')})` : ` (${t('common.optional')})`}
            </label>
            <textarea
              id="verification-remarks"
              className="form-input"
              rows="3"
              value={remarks}
              onChange={event => { setRemarks(event.target.value); setRemarkError(''); }}
              placeholder={t('admin.remarks_placeholder')}
            />
            {remarkError && <p className="form-error" role="alert">{remarkError}</p>}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ReviewVerifications;
