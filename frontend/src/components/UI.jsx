import React from 'react';
import { useTranslation } from 'react-i18next';

const statusClass = (status = '') => {
  const normalized = status.toUpperCase();
  if (['APPROVED', 'ACTIVE', 'COMPLETED'].includes(normalized)) return 'status-badge--success';
  if (['REJECTED', 'FAILED'].includes(normalized)) return 'status-badge--danger';
  return 'status-badge--warning';
};

export const PageHeader = ({ eyebrow, title, description, actions }) => (
  <header className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1>{title}</h1>
      {description && <p className="page-header__description">{description}</p>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </header>
);

export const StatusBadge = ({ status, label }) => <span className={`status-badge ${statusClass(status)}`}>{label || status}</span>;

export const VerificationBadge = ({ status }) => {
  const { t } = useTranslation();
  const label = status === 'APPROVED' ? t('trust.verification_approved') : status === 'REJECTED' ? t('trust.verification_rejected') : t('trust.verification_pending');
  return <StatusBadge status={status} label={label} />;
};

export const ProgressBar = ({ value, label, compact = false }) => {
  const progress = Number.isFinite(value) ? Math.max(0, Math.min(value, 100)) : 0;
  return <div className={`progress ${compact ? 'progress--compact' : ''}`} aria-label={label}><div className="progress__track"><div className="progress__fill" style={{ width: `${progress}%` }} /></div>{!compact && <span className="progress__label">{label}</span>}</div>;
};

export const EmptyState = ({ title, description, action }) => <div className="empty-state"><div className="empty-state__icon" aria-hidden="true">◌</div><h3>{title}</h3><p>{description}</p>{action}</div>;

export const LoadingState = () => { const { t } = useTranslation(); return <div className="loading-state" role="status">{t('common.loading')}</div>; };
export const ErrorState = ({ message }) => { const { t } = useTranslation(); return <div className="alert alert--error" role="alert">{message || t('common.error')}</div>; };
export const TrustIndicator = ({ title, description }) => <div className="trust-indicator"><span className="trust-indicator__mark" aria-hidden="true">✓</span><div><strong>{title}</strong><span>{description}</span></div></div>;
export const SectionHeader = ({ title, description, action }) => <div className="section-header"><div><h2>{title}</h2>{description && <p>{description}</p>}</div>{action}</div>;
