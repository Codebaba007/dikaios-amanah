/**
 * Presentation-only formatting helpers.
 * These never alter payloads or API behaviour.
 */

/** `CAMPAIGN_APPROVED` → `Campaign approved` (sentence case, readable). */
export const humanizeEvent = (eventType = '') => {
  const words = String(eventType).toLowerCase().split('_').filter(Boolean);
  if (words.length === 0) return '';
  return words
    .map((word, index) => (index === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
};

export const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString();
};

/** Abbreviate a long integrity hash for table display. */
export const shortHash = (hash = '', visible = 16) => {
  const value = String(hash);
  if (value.length <= visible + 3) return value || '—';
  return `${value.slice(0, visible)}…`;
};

/** Tone key for an audit event, used to colour status badges consistently. */
export const auditEventTone = (eventType = '') => {
  const value = String(eventType).toUpperCase();
  if (value.includes('REJECTED') || value.includes('FAILED')) return 'REJECTED';
  if (value.includes('APPROVED') || value.includes('SIMULATED') || value.includes('SUBMITTED')) return 'APPROVED';
  return 'PENDING';
};
