import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, SectionHeader, StatusBadge, LoadingState, ErrorState } from '../../components/UI';

const AuditLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    fetchLogs();
    runVerifyLedger();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/audits', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runVerifyLedger = async () => {
    setVerifying(true);
    try {
      const res = await fetch('http://localhost:5000/api/admin/audits/verify', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setVerification(data);
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  if (loading) return <div className="container"><LoadingState /></div>;

  return (
    <div className="container">
      <PageHeader
        eyebrow="Administrator"
        title={t('admin.audit_workspace')}
        description="Review the cryptographic hash-chain audit ledger. Each critical event is linked to the previous record's hash to make later alteration evident."
        actions={
          <button onClick={runVerifyLedger} className="btn btn-secondary" disabled={verifying}>
            {verifying ? t('common.loading') : t('admin.manual_verification')}
          </button>
        }
      />

      {error && <div style={{ marginBottom: '1rem' }}><ErrorState message={error} /></div>}

      {/* Ledger integrity status */}
      {verification && (
        <div className={`audit-status ${verification.isValid ? 'audit-status--valid' : 'audit-status--invalid'}`} style={{ marginBottom: '1.5rem' }}>
          <div>
            <strong style={{ fontSize: '1rem' }}>
              {verification.isValid ? `✓ ${t('admin.ledger_valid')}` : `✗ ${t('admin.ledger_invalid')}`}
            </strong>
            <p style={{ margin: '.2rem 0 0', fontSize: '.85rem', color: 'inherit', opacity: .8 }}>
              {t('admin.records_checked')}: {verification.checkedCount} · {t('trust.audit_title')}
            </p>
          </div>
          {!verification.isValid && verification.firstInvalidRecord && (
            <div style={{ fontSize: '.82rem' }}>
              <strong>Tamper detected at:</strong> {verification.firstInvalidRecord.eventType} · ID {verification.firstInvalidRecord.id}
            </div>
          )}
        </div>
      )}

      {/* Audit trail info card */}
      <div className="card workspace-card" style={{ marginBottom: '1.5rem' }}>
        <SectionHeader title={t('trust.audit_title')} />
        <p style={{ margin: 0, fontSize: '.9rem' }}>{t('trust.audit_description')}</p>
        <p style={{ margin: '.5rem 0 0', fontSize: '.82rem', color: 'var(--ink-muted)' }}>
          Note: This is an academic cryptographic SHA-256 hash chain. It is not a live Hyperledger Fabric deployment.
        </p>
      </div>

      {/* Audit log table */}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>{t('admin.audit_time')}</th>
              <th>{t('admin.audit_event')}</th>
              <th>{t('admin.audit_user')}</th>
              <th>{t('admin.audit_hash')}</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--ink-muted)', padding: '2rem' }}>
                  No audit records found.
                </td>
              </tr>
            )}
            {logs.map(log => (
              <tr key={log.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.timestamp).toLocaleString()}</td>
                <td><StatusBadge status={log.eventType.includes('APPROVED') || log.eventType.includes('SIMULATED') ? 'APPROVED' : log.eventType.includes('REJECTED') ? 'REJECTED' : 'PENDING'} label={log.eventType} /></td>
                <td style={{ color: 'var(--ink-muted)', fontSize: '.85rem' }}>{log.user?.email || 'System'}</td>
                <td className="hash">{log.integrityHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditLogs;
