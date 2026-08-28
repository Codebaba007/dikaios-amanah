import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionHeader, StatusBadge, EmptyState, LoadingState, ErrorState } from '../../components/UI';

const ReviewVerifications = () => {
  const { t } = useTranslation();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Per-card rejection remark state
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/verifications/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      const data = await res.json();
      setVerifications(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, action) => {
    const remark = action === 'REJECTED' ? (remarks[id] || '') : '';
    // For rejection, require at least some remark text
    if (action === 'REJECTED' && !remark.trim()) {
      setRemarks(prev => ({ ...prev, [`${id}_error`]: 'Please enter rejection remarks before rejecting.' }));
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/admin/verifications/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, remarks: remark })
      });
      fetchVerifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Administrator"
        title={t('admin.verification_queue')}
        description={t('admin.workspace_intro')}
      />

      {error && <ErrorState message={error} />}

      {verifications.length === 0 ? (
        <EmptyState title={t('admin.no_pending')} description="All verification submissions have been reviewed." />
      ) : (
        <div className="review-grid">
          {verifications.map(v => (
            <div key={v.id} className="card review-card">
              <div className="workspace-card__heading">
                <div>
                  <p className="eyebrow">{v.verificationType}</p>
                  <h3 style={{ margin: 0 }}>{v.business.businessName}</h3>
                  <p style={{ margin: '.25rem 0 0', fontSize: '.85rem' }}>
                    {v.business.owner.name} · {v.business.owner.email}
                  </p>
                </div>
                <StatusBadge status={v.status || 'PENDING'} label="PENDING" />
              </div>

              {/* Document metadata */}
              {v.documents?.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <p className="eyebrow" style={{ marginBottom: '.4rem' }}>{t('admin.document_metadata')}</p>
                  {v.documents.map(doc => (
                    <div key={doc.id} style={{ padding: '.6rem', background: 'var(--surface-subtle)', borderRadius: 'var(--radius-sm)', marginBottom: '.4rem' }}>
                      <p style={{ margin: '0 0 .25rem', fontWeight: 600, fontSize: '.85rem' }}>{doc.fileName}</p>
                      <p style={{ margin: '0 0 .25rem', fontSize: '.75rem', color: 'var(--ink-muted)' }}>{doc.fileType}</p>
                      <p className="hash" style={{ margin: 0 }}>{doc.integrityHash}</p>
                      <p style={{ margin: '.25rem 0 0', fontSize: '.72rem', color: 'var(--ink-muted)' }}>
                        {t('admin.hash_note')}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Remarks input for rejection */}
              <div style={{ marginTop: '1rem' }}>
                <label className="form-label" htmlFor={`remarks-${v.id}`} style={{ fontSize: '.82rem' }}>
                  {t('admin.remarks')} (required for rejection)
                </label>
                {remarks[`${v.id}_error`] && (
                  <p style={{ margin: '.2rem 0', fontSize: '.8rem', color: 'var(--danger)' }}>{remarks[`${v.id}_error`]}</p>
                )}
                <textarea
                  id={`remarks-${v.id}`}
                  className="form-input"
                  rows="2"
                  value={remarks[v.id] || ''}
                  onChange={e => setRemarks(prev => ({ ...prev, [v.id]: e.target.value, [`${v.id}_error`]: '' }))}
                  placeholder="Optional for approval, required for rejection."
                />
              </div>

              <div className="review-card__actions">
                <button
                  onClick={() => handleReview(v.id, 'APPROVED')}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {t('admin.approve')}
                </button>
                <button
                  onClick={() => handleReview(v.id, 'REJECTED')}
                  className="btn btn-secondary"
                  style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                >
                  {t('admin.reject')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewVerifications;
