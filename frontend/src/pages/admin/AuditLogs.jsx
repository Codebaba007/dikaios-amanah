import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CircleAlert, CircleCheck, CircleDashed, RefreshCw, ScrollText, Search } from 'lucide-react';
import {
  PageHeader, StatusBadge, LoadingState, ErrorState, EmptyState, StatCard, DataTable
} from '../../components/UI';
import { apiRequest } from '../../lib/api';
import { humanizeEvent, formatDateTime, shortHash, auditEventTone } from '../../lib/format';

const AuditLogs = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // `null` means the integrity check has not returned a result in this session.
  const [verification, setVerification] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await apiRequest('/api/admin/audits');
      if (!ok) throw new Error(t('common.error'));
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  const runVerifyLedger = useCallback(async () => {
    setVerifying(true);
    setVerifyError('');
    try {
      const { ok, data } = await apiRequest('/api/admin/audits/verify');
      if (!ok || !data) throw new Error(t('admin.ledger_unavailable'));
      setVerification(data);
    } catch (err) {
      setVerifyError(err.message || t('admin.ledger_unavailable'));
      setVerification(null);
    } finally {
      setVerifying(false);
    }
  }, [t]);

  useEffect(() => {
    fetchLogs();
    runVerifyLedger();
  }, [fetchLogs, runVerifyLedger]);

  const eventTypes = useMemo(
    () => [...new Set(logs.map(log => log.eventType).filter(Boolean))].sort(),
    [logs]
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter(log => {
      if (eventFilter && log.eventType !== eventFilter) return false;
      if (!term) return true;
      const haystack = `${log.eventType || ''} ${log.user?.email || ''} ${log.user?.name || ''} ${log.integrityHash || ''} ${log.entityId || ''}`;
      return haystack.toLowerCase().includes(term);
    });
  }, [logs, eventFilter, search]);

  const hasFilters = search.trim() !== '' || eventFilter !== '';

  const clearFilters = () => { setSearch(''); setEventFilter(''); };

  if (loading) return <LoadingState lines={6} />;

  return (
    <div>
      <PageHeader
        eyebrow={t('admin.role_label')}
        title={t('admin.audit_workspace')}
        description={t('admin.audit_intro')}
        actions={
          <button onClick={runVerifyLedger} className="btn btn-primary" disabled={verifying}>
            <RefreshCw size={15} aria-hidden="true" className={verifying ? 'spin' : undefined} />
            {verifying ? t('admin.ledger_checking') : t('admin.manual_verification')}
          </button>
        }
      />

      {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
      {verifyError && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={verifyError} /></div>}

      <div className="grid grid--3" style={{ marginBottom: '1.25rem' }}>
        <StatCard label={t('admin.stat_audit_records')} value={logs.length} accent />
        <StatCard
          label={t('admin.records_checked')}
          value={verification ? verification.checkedCount ?? 0 : '—'}
          hint={verification ? undefined : t('admin.ledger_not_run')}
        />
        <StatCard
          label={t('admin.integrity_status')}
          value={
            verifying
              ? t('common.loading')
              : verification
                ? (verification.isValid ? t('admin.ledger_valid') : t('admin.ledger_invalid'))
                : t('admin.ledger_not_run')
          }
        />
      </div>

      {/* Integrity verdict — only ever rendered from an API response. */}
      {verification ? (
        <div className={`audit-status ${verification.isValid ? 'audit-status--valid' : 'audit-status--invalid'}`}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start' }}>
            {verification.isValid
              ? <CircleCheck size={20} aria-hidden="true" />
              : <CircleAlert size={20} aria-hidden="true" />}
            <div>
              <strong style={{ fontSize: '1rem' }}>
                {verification.isValid ? t('admin.ledger_valid') : t('admin.ledger_invalid')}
              </strong>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'inherit', opacity: 0.85 }}>
                {t('admin.records_checked')}: {verification.checkedCount ?? 0}
              </p>
            </div>
          </div>
          {!verification.isValid && verification.firstInvalidRecord && (
            <div style={{ fontSize: '0.82rem', textAlign: 'right' }}>
              <strong>{t('admin.tamper_detected')}</strong>
              <div>{humanizeEvent(verification.firstInvalidRecord.eventType)}</div>
              <div className="hash" style={{ color: 'inherit' }}>{verification.firstInvalidRecord.id}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="audit-status" style={{ background: 'var(--surface-subtle)', border: '1px solid var(--border)', color: 'var(--ink-muted)' }}>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            <CircleDashed size={18} aria-hidden="true" />
            <div>
              <strong style={{ fontSize: '0.95rem' }}>{t('admin.ledger_not_run')}</strong>
              <p style={{ margin: '0.15rem 0 0', fontSize: '0.84rem', color: 'inherit' }}>
                {t('admin.ledger_run_hint')}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '.8rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={t('admin.search_audit')}
            aria-label={t('admin.search_audit')}
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <select
          className="form-input"
          style={{ flex: '1 1 200px' }}
          aria-label={t('admin.filter_event_type')}
          value={eventFilter}
          onChange={event => setEventFilter(event.target.value)}
        >
          <option value="">{t('admin.all_events')}</option>
          {eventTypes.map(type => (
            <option key={type} value={type}>{humanizeEvent(type)}</option>
          ))}
        </select>
        {hasFilters && (
          <button className="btn btn-secondary btn-sm" onClick={clearFilters} style={{ flex: '0 0 auto' }}>
            {t('common.clear')}
          </button>
        )}
        <span className="result-count" style={{ margin: 0 }}>
          {t('admin.audit_count', { count: filtered.length })}
        </span>
      </div>

      {logs.length === 0 ? (
        <EmptyState
          title={t('admin.no_audits')}
          description={t('admin.no_audits_description')}
          icon={<ScrollText size={22} aria-hidden="true" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('admin.no_search_matches')}
          action={<button className="btn btn-secondary" onClick={clearFilters}>{t('common.clear')}</button>}
          icon={<Search size={20} aria-hidden="true" />}
        />
      ) : (
        <DataTable
          rows={filtered}
          caption={t('admin.audit_workspace')}
          emptyMessage={t('admin.no_audits')}
          columns={[
            {
              key: 'timestamp',
              label: t('admin.audit_time'),
              className: 'td-muted',
              render: row => <span style={{ whiteSpace: 'nowrap' }}>{formatDateTime(row.timestamp)}</span>
            },
            {
              key: 'eventType',
              label: t('admin.audit_event'),
              render: row => <StatusBadge status={auditEventTone(row.eventType)} label={humanizeEvent(row.eventType)} />
            },
            {
              key: 'entityId',
              label: t('admin.audit_entity'),
              className: 'hash',
              render: row => <span title={row.entityId}>{shortHash(row.entityId, 10)}</span>
            },
            {
              key: 'user',
              label: t('admin.audit_actor'),
              className: 'td-muted',
              render: row => (
                <span>
                  {row.user?.email || t('admin.system_actor')}
                  {row.user?.role && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--ink-faint)' }}>
                      {row.user.role.replace('_', ' ').toLowerCase()}
                    </span>
                  )}
                </span>
              )
            },
            {
              key: 'integrityHash',
              label: t('admin.audit_hash'),
              className: 'hash',
              render: row => <span title={row.integrityHash}>{shortHash(row.integrityHash)}</span>
            }
          ]}
        />
      )}

      <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
        {t('admin.ledger_note')}
      </p>
    </div>
  );
};

export default AuditLogs;
