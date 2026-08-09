import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ReviewVerifications = () => {
  const { t } = useTranslation();
  const [verifications, setVerifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/verifications/pending', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVerifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, action) => {
    let remarks = '';
    if (action === 'REJECTED') {
      remarks = prompt(t('admin.remarks'));
      if (remarks === null) return; // Cancelled
    }

    try {
      await fetch(`http://localhost:5000/api/admin/verifications/${id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ action, remarks })
      });
      fetchVerifications();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <h2>{t('admin.verifications')}</h2>

      {verifications.length === 0 ? (
        <p>{t('admin.no_pending')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {verifications.map(v => (
            <div key={v.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4>{v.business.businessName} <span className="badge badge-warning">{v.verificationType}</span></h4>
                <p>Owner: {v.business.owner.name} ({v.business.owner.email})</p>
                <div style={{ marginTop: '0.5rem' }}>
                  {v.documents.map(doc => (
                    <div key={doc.id} style={{ fontSize: '0.875rem' }}>
                      <strong>{t('admin.document')}:</strong> {doc.fileName} <br/>
                      <small>Hash: {doc.integrityHash.substring(0,16)}...</small>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => handleReview(v.id, 'APPROVED')} className="btn btn-primary">{t('admin.approve')}</button>
                <button onClick={() => handleReview(v.id, 'REJECTED')} className="btn btn-secondary" style={{ borderColor: 'var(--status-error)', color: 'var(--status-error)' }}>{t('admin.reject')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewVerifications;
