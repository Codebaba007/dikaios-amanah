import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AuditLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verification, setVerification] = useState(null);

  useEffect(() => {
    fetchLogs();
    verifyLedger();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/audits', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const verifyLedger = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/audits/verify', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVerification(data);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container animate-fade-in" style={{ marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>{t('admin.audits')} - Academic Trust & Audit Layer</h2>
        <button onClick={verifyLedger} className="btn btn-secondary">Run Manual Verification</button>
      </div>

      {verification && (
        <div className={`card ${verification.isValid ? 'badge-success' : 'badge-error'}`} style={{ marginBottom: '2rem', padding: '1.5rem', background: verification.isValid ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)' }}>
          <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {verification.isValid ? '✓ Ledger Integrity Valid' : '✗ Ledger Integrity Compromised'}
          </h3>
          <div style={{ marginTop: '1rem', display: 'flex', gap: '2rem' }}>
            <div><strong>Records Checked:</strong> {verification.checkedCount}</div>
            <div><strong>Last Verified:</strong> {new Date().toLocaleTimeString()}</div>
          </div>
          {!verification.isValid && verification.firstInvalidRecord && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-color)', borderRadius: '4px' }}>
              <strong>Tamper Detected at Record:</strong> {verification.firstInvalidRecord.id}
              <br/>
              Event: {verification.firstInvalidRecord.eventType}
            </div>
          )}
        </div>
      )}
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem' }}>{t('admin.audit_time')}</th>
              <th style={{ padding: '1rem' }}>{t('admin.audit_event')}</th>
              <th style={{ padding: '1rem' }}>{t('admin.audit_user')}</th>
              <th style={{ padding: '1rem' }}>{t('admin.audit_hash')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td style={{ padding: '1rem' }}><span className="badge badge-info">{log.eventType}</span></td>
                <td style={{ padding: '1rem' }}>{log.user?.email || 'System'}</td>
                <td style={{ padding: '1rem', fontFamily: 'monospace', fontSize: '0.85rem' }}>{log.integrityHash.substring(0, 16)}...</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
