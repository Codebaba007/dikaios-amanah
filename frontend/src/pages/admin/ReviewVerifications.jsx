import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionHeader, StatusBadge, EmptyState, LoadingState, ErrorState } from '../../components/UI';

const ReviewVerifications = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('business');
  const [verifications, setVerifications] = useState([]);
  const [investorVerifications, setInvestorVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Per-card rejection remark state
  const [remarks, setRemarks] = useState({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [bizRes, invRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/verifications/pending', { headers }),
        fetch('http://localhost:5000/api/admin/investor-verifications/pending', { headers })
      ]);
      if (!bizRes.ok || !invRes.ok) throw new Error(t('common.error'));
      setVerifications(await bizRes.json());
      setInvestorVerifications(await invRes.json());
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, action, endpoint) => {
    const remark = action === 'REJECTED' ? (remarks[id] || '') : '';
    if (action === 'REJECTED' && !remark.trim()) {
      setRemarks(prev => ({ ...prev, [`${id}_error`]: 'Please enter rejection remarks before rejecting.' }));
      return;
    }
    try {
      await fetch(`http://localhost:5000/api/admin/${endpoint}/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, remarks: remark })
      });
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;

  const currentItems = activeTab === 'business' ? verifications : investorVerifications;
  const currentEndpoint = activeTab === 'business' ? 'verifications' : 'investor-verifications';

  return (
    <div className="container">
      <PageHeader
        eyebrow="Administrator"
        title={t('admin.verification_queue')}
        description={t('admin.workspace_intro')}
      />

      {error && <ErrorState message={error} />}

      {/* Tabs */}
      <div className="discovery-tabs" role="tablist" style={{ marginBottom: '1.5rem' }}>
        <button
          role="tab"
          aria-selected={activeTab === 'business'}
          className={`discovery-tab${activeTab === 'business' ? ' discovery-tab--active' : ''}`}
          onClick={() => setActiveTab('business')}
        >
          {t('investor.tab_business_verifications')}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === 'investor'}
          className={`discovery-tab${activeTab === 'investor' ? ' discovery-tab--active' : ''}`}
          onClick={() => setActiveTab('investor')}
        >
          {t('investor.tab_investor_verifications')}
        </button>
      </div>

      {currentItems.length === 0 ? (
        <EmptyState title={t('admin.no_pending')} description="All verification submissions have been reviewed." />
      ) : (
        <div className="review-grid">
          {currentItems.map(v => (
            <div key={v.id} className="card review-card">
              <div className="workspace-card__heading">
                <div>
                  <p className="eyebrow">{activeTab === 'business' ? v.verificationType : 'IDENTITY'}</p>
                  <h3 style={{ margin: 0 }}>
                    {activeTab === 'business' ? v.business?.businessName : v.investor?.name}
                  </h3>
                  <p style={{ margin: '.25rem 0 0', fontSize: '.85rem' }}>
                    {activeTab === 'business'
                      ? `${v.business?.owner?.name} · ${v.business?.owner?.email}`
                      : v.investor?.email}
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
                  onClick={() => handleReview(v.id, 'APPROVED', currentEndpoint)}
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                >
                  {t('admin.approve')}
                </button>
                <button
                  onClick={() => handleReview(v.id, 'REJECTED', currentEndpoint)}
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

