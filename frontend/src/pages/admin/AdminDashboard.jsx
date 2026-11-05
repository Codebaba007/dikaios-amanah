import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ClipboardList, FileSearch, ScrollText, ShieldCheck
} from 'lucide-react';
import {
  PageHeader, SectionHeader, StatCard, StatusBadge, LoadingState, ErrorState,
  EmptyState, TrustIndicator, DataTable
} from '../../components/UI';
import { apiRequest } from '../../lib/api';
import { humanizeEvent, formatDateTime, shortHash, auditEventTone } from '../../lib/format';

const AdminDashboard = () => {
  const { t } = useTranslation();
  const [queues, setQueues] = useState({ business: [], investor: [], campaigns: [], audits: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const load = async () => {
      const results = await Promise.allSettled([
        apiRequest('/api/admin/verifications/pending'),
        apiRequest('/api/admin/investor-verifications/pending'),
        apiRequest('/api/admin/campaigns/pending'),
        apiRequest('/api/admin/audits')
      ]);

      if (!active) return;

      const [business, investor, campaigns, audits] = results;
      const read = (result) => (result.status === 'fulfilled' && result.value.ok && Array.isArray(result.value.data))
        ? result.value.data
        : [];

      setQueues({
        business: read(business),
        investor: read(investor),
        campaigns: read(campaigns),
        audits: read(audits)
      });

      if (results.every(result => result.status === 'rejected' || !result.value.ok)) {
        setError(t('common.error'));
      }

      setLoading(false);
    };

    load();
    return () => { active = false; };
  }, [t]);

  if (loading) return <LoadingState lines={6} />;

  const verificationCount = queues.business.length + queues.investor.length;
  const recentAudits = queues.audits.slice(0, 6);

  const queueCards = [
    {
      key: 'verifications',
      to: '/admin/verifications',
      count: verificationCount,
      title: t('admin.verification_queue'),
      description: t('admin.queue_verifications_description'),
      icon: FileSearch
    },
    {
      key: 'campaigns',
      to: '/admin/campaigns',
      count: queues.campaigns.length,
      title: t('admin.campaign_queue'),
      description: t('admin.queue_campaigns_description'),
      icon: ClipboardList
    },
    {
      key: 'audits',
      to: '/admin/audits',
      count: queues.audits.length,
      title: t('admin.audit_workspace'),
      description: t('admin.queue_audits_description'),
      icon: ScrollText
    }
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t('admin.role_label')}
        title={t('admin.dashboard')}
        description={t('admin.workspace_intro')}
        actions={<Link to="/admin/audits" className="btn btn-secondary">{t('nav.audit_logs')}</Link>}
      />

      {error && <div style={{ marginBottom: '1.5rem' }}><ErrorState message={error} /></div>}

      <div className="grid grid--4" style={{ marginBottom: '1rem' }}>
        <StatCard label={t('admin.stat_verifications_business')} value={queues.business.length} accent />
        <StatCard label={t('admin.stat_verifications_investor')} value={queues.investor.length} />
        <StatCard label={t('admin.stat_campaigns')} value={queues.campaigns.length} />
        <StatCard label={t('admin.stat_audit_records')} value={queues.audits.length} />
      </div>

      <SectionHeader
        title={t('admin.review_queues')}
        description={t('admin.review_intro')}
      />

      <div className="queue-grid">
        {queueCards.map(card => {
          const Icon = card.icon;
          const attention = card.key !== 'audits' && card.count > 0;
          return (
            <Link
              key={card.key}
              to={card.to}
              className={`queue-card ${attention ? 'queue-card--attention' : ''}`}
            >
              <span className="queue-card__label">
                <Icon size={13} style={{ verticalAlign: '-2px' }} aria-hidden="true" /> {t('admin.queue_label')}
              </span>
              <span className="queue-card__count">{card.count}</span>
              <h3>{card.title}</h3>
              <p>{card.description}</p>
              <span className="queue-card__foot">
                {t('admin.open_queue')} <ArrowRight size={14} aria-hidden="true" />
              </span>
            </Link>
          );
        })}
      </div>

      <SectionHeader
        title={t('admin.activity_title')}
        description={t('admin.activity_description')}
        action={<Link to="/admin/audits" className="btn btn-secondary btn-sm">{t('nav.audit_logs')}</Link>}
      />

      {recentAudits.length === 0 ? (
        <EmptyState
          title={t('admin.no_audits')}
          description={t('admin.no_audits_description')}
          icon={<ScrollText size={20} aria-hidden="true" />}
        />
      ) : (
        <DataTable
          rows={recentAudits}
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
              key: 'user',
              label: t('admin.audit_actor'),
              className: 'td-muted',
              render: row => row.user?.email || t('admin.system_actor')
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

      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="workspace-card__heading">
          <div>
            <p className="eyebrow" style={{ margin: 0 }}>{t('trust.audit_title')}</p>
            <h2 style={{ fontSize: '1.15rem', margin: '0.2rem 0 0' }}>{t('admin.trust_panel_title')}</h2>
          </div>
          <span className="trust-indicator__mark" aria-hidden="true"><ShieldCheck size={15} /></span>
        </div>
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <TrustIndicator title={t('trust.audit_title')} description={t('trust.audit_description')} />
          <TrustIndicator title={t('trust.document_title')} description={t('trust.document_description')} />
        </div>
        <p style={{ margin: '0.9rem 0 0', fontSize: '0.82rem', color: 'var(--ink-muted)' }}>
          {t('admin.ledger_note')}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
