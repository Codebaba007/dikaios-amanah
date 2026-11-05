import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, ImageOff, Inbox, ShieldCheck } from 'lucide-react';

const statusClass = (status = '') => {
  const normalized = status.toUpperCase();
  if (['APPROVED', 'ACTIVE', 'COMPLETED'].includes(normalized)) return 'status-badge--success';
  if (['REJECTED', 'FAILED', 'REJECTED_CAMPAIGN'].includes(normalized)) return 'status-badge--danger';
  return 'status-badge--warning';
};

/* --------------------------------------------------------------------------
   Image with graceful fallback
   -------------------------------------------------------------------------- */

export const SmartImage = ({ src, alt, className = '', aspectClass = 'media--3x2', overlay = false, children }) => {
  const [failed, setFailed] = useState(false);
  return (
    <figure className={`media ${aspectClass} ${className}`} style={{ margin: 0 }}>
      {!failed ? (
        <img src={src} alt={alt || ''} loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <div className="media media--fallback" role="img" aria-label={alt || 'Business imagery placeholder'}>
          <ImageOff size={30} aria-hidden="true" />
        </div>
      )}
      {overlay && <div className="media__overlay" aria-hidden="true" />}
      {children}
    </figure>
  );
};

/* --------------------------------------------------------------------------
   Page scaffolding
   -------------------------------------------------------------------------- */

export const PageHeader = ({ eyebrow, title, description, actions, badge }) => (
  <header className="page-header">
    <div>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 style={{ display: 'flex', gap: '.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {title}
        {badge}
      </h1>
      {description && <p className="page-header__description">{description}</p>}
    </div>
    {actions && <div className="page-header__actions">{actions}</div>}
  </header>
);

export const SectionHeader = ({ title, description, action }) => (
  <div className="section-header">
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {action}
  </div>
);

/* --------------------------------------------------------------------------
   Status & progress
   -------------------------------------------------------------------------- */

export const StatusBadge = ({ status, label, variant = '' }) => (
  <span className={`status-badge ${statusClass(status)} ${variant}`}>{label || status}</span>
);

export const VerificationBadge = ({ status }) => {
  const { t } = useTranslation();
  const label =
    status === 'APPROVED' ? t('trust.verification_approved') :
    status === 'REJECTED' ? t('trust.verification_rejected') :
    t('trust.verification_pending');
  return <StatusBadge status={status} label={label} />;
};

export const ProgressBar = ({ value, label, compact = false }) => {
  const progress = Number.isFinite(value) ? Math.max(0, Math.min(value, 100)) : 0;
  return (
    <div className={`progress ${compact ? 'progress--compact' : ''}`} aria-label={label}>
      <div className="progress__track"><div className="progress__fill" style={{ width: `${progress}%` }} /></div>
      {!compact && label && <span className="progress__label">{label}</span>}
    </div>
  );
};

/* --------------------------------------------------------------------------
   Data display
   -------------------------------------------------------------------------- */

export const StatCard = ({ label, value, hint = '', accent = false }) => (
  <div className={`card stat-card ${accent ? 'stat-card--accent' : ''}`}>
    <span className="stat-card__label">{label}</span>
    <span className="stat-card__value">{value}</span>
    {hint && <span className="stat-card__hint">{hint}</span>}
  </div>
);

export const DataTable = ({ columns, rows, keyField = 'id', emptyMessage, caption }) => (
  <div className="table-wrap">
    <table>
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {columns.map(column => (
            <th key={column.key} scope="col" style={column.width ? { width: column.width } : undefined}>
              {column.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="table-empty">{emptyMessage}</td>
          </tr>
        ) : rows.map(row => (
          <tr key={row[keyField]}>
            {columns.map(column => (
              <td key={column.key} className={column.className}>
                {column.render ? column.render(row) : row[column.key]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const SpecList = ({ items }) => (
  <dl className="spec-list">
    {items.map(({ term, detail, strong = false }) => (
      <div key={term}>
        <dt>{term}</dt>
        <dd style={strong ? { fontSize: '1.15rem' } : undefined}>{detail}</dd>
      </div>
    ))}
  </dl>
);

/* --------------------------------------------------------------------------
   Feedback & states
   -------------------------------------------------------------------------- */

export const TrustIndicator = ({ title, description }) => (
  <div className="trust-indicator">
    <span className="trust-indicator__mark" aria-hidden="true"><ShieldCheck size={15} /></span>
    <div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  </div>
);

export const SimulatedNotice = () => {
  const { t } = useTranslation();
  return (
    <div className="simulated-notice" role="note">
      <span aria-hidden="true">⚠</span>
      <span>{t('campaign.simulated_notice')}</span>
    </div>
  );
};

export const EmptyState = ({ title, description, action, icon = null }) => (
  <div className="empty-state">
    <div className="empty-state__icon" aria-hidden="true">{icon || <Inbox size={22} />}</div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action}
  </div>
);

export const LoadingState = ({ lines = 4 }) => (
  <div className="loading-state" role="status" aria-live="polite">
    <div className="skeleton skeleton--title" />
    {Array.from({ length: lines }).map((_, i) => (
      <div key={i} className="skeleton" style={{ width: `${90 - (i % 3) * 18}%` }} />
    ))}
  </div>
);

export const CardSkeleton = ({ count = 3 }) => (
  <div className="grid grid--masonry" aria-busy="true">
    {Array.from({ length: count }).map((_, i) => <div key={i} className="skeleton skeleton--card" />)}
  </div>
);

export const ErrorState = ({ message }) => {
  const { t } = useTranslation();
  return <div className="alert alert--error" role="alert">{message || t('common.error')}</div>;
};

export const SuccessState = ({ message }) => (
  <div className="alert alert--success" role="status">
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.4rem' }}>
      <CheckCircle2 size={16} aria-hidden="true" />
      {message}
    </span>
  </div>
);

/* --------------------------------------------------------------------------
   Modal dialog
   -------------------------------------------------------------------------- */

export const ConfirmDialog = ({
  open, title, description, children, confirmLabel, cancelLabel,
  onConfirm, onCancel, tone = 'primary', busy = false
}) => {
  const { t } = useTranslation();
  const confirmRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel?.();
    };
    document.addEventListener('keydown', onKeyDown);
    const focusTimer = window.setTimeout(() => confirmRef.current?.focus(), 0);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
    };
  }, [open, busy, onCancel]);

  if (!open) return null;

  return (
    <div
      className="dialog-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onCancel?.();
      }}
    >
      <div className="dialog" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
        <div className="dialog__head">
          <span className={`dialog__icon dialog__icon--${tone}`} aria-hidden="true">
            {tone === 'danger' ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
          </span>
          <h2 id="confirm-dialog-title">{title}</h2>
        </div>
        {description && <p className="dialog__body">{description}</p>}
        {children}
        <div className="dialog__actions">
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>
            {cancelLabel || t('common.cancel')}
          </button>
          <button
            ref={confirmRef}
            type="button"
            className={`btn ${tone === 'danger' ? 'btn-danger-solid' : 'btn-primary'}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? t('common.loading') : (confirmLabel || t('common.confirm'))}
          </button>
        </div>
      </div>
    </div>
  );
};

/* Kept for backward compatibility with existing alert usage. */
export const FieldRow = ({ label, children }) => (
  <div className="form-group">
    <label className="form-label">{label}</label>
    {children}
  </div>
);
