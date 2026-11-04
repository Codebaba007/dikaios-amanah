import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Search } from 'lucide-react';
import {
  PageHeader, StatusBadge, ProgressBar, EmptyState, LoadingState, ErrorState,
  SuccessState, ConfirmDialog, SmartImage, SpecList
} from '../../components/UI';
import { industryImage } from '../../lib/images';
import { apiRequest } from '../../lib/api';
import { formatDateTime } from '../../lib/format';

const ReviewCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [search, setSearch] = useState('');

  const [decision, setDecision] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [remarkError, setRemarkError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { ok, data } = await apiRequest('/api/admin/campaigns/pending');
      if (!ok) throw new Error(t('common.error'));
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return campaigns;
    return campaigns.filter(campaign =>
      `${campaign.title || ''} ${campaign.business?.businessName || ''} ${campaign.business?.industry || ''}`
        .toLowerCase()
        .includes(term)
    );
  }, [campaigns, search]);

  const openDecision = (campaign, action) => {
    setDecision({ campaign, action });
    setRemarks('');
    setRemarkError('');
    setFeedback('');
  };

  const closeDecision = () => {
    if (submitting) return;
    setDecision(null);
    setRemarks('');
    setRemarkError('');
  };

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.action === 'REJECTED' && !remarks.trim()) {
      setRemarkError(t('admin.rejection_required'));
      return;
    }

    setSubmitting(true);
    const { campaign, action } = decision;

    try {
      const { ok, data } = await apiRequest(`/api/admin/campaigns/${campaign.id}/review`, {
        method: 'POST',
        body: { action, remarks: action === 'REJECTED' ? remarks.trim() : '' }
      });
      if (!ok) throw new Error(data?.error || t('admin.review_failed'));

      setCampaigns(previous => previous.filter(entry => entry.id !== campaign.id));
      setFeedback(t('admin.review_recorded'));
      setDecision(null);
      setRemarks('');
    } catch (err) {
      setRemarkError(err.message || t('admin.review_failed'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingState lines={5} />;

  return (
    <div>
      <PageHeader
        eyebrow={t('admin.role_label')}
        title={t('admin.campaign_queue')}
        description={t('admin.review_intro')}
      />

      {error && <div style={{ marginBottom: '1.25rem' }}><ErrorState message={error} /></div>}
      {feedback && <div style={{ marginBottom: '1.25rem' }}><SuccessState message={feedback} /></div>}

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '.8rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            placeholder={t('admin.search_campaigns')}
            aria-label={t('admin.search_campaigns')}
            value={search}
            onChange={event => setSearch(event.target.value)}
          />
        </div>
        <span className="result-count" style={{ margin: 0 }}>
          {t('admin.pending_count', { count: filtered.length })}
        </span>
      </div>

      {campaigns.length === 0 ? (
        <EmptyState
          title={t('admin.no_pending')}
          description={t('admin.queue_empty_body')}
          icon={<CheckCircle2 size={22} aria-hidden="true" />}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={t('admin.no_search_matches')}
          action={<button className="btn btn-secondary" onClick={() => setSearch('')}>{t('common.clear')}</button>}
          icon={<Search size={20} aria-hidden="true" />}
        />
      ) : (
        <div className="review-grid">
          {filtered.map(campaign => {
            const goal = Number(campaign.fundingGoal) || 0;
            const funded = Number(campaign.currentFunding) || 0;
            const progress = goal ? (funded / goal) * 100 : 0;
            const image = industryImage(campaign.business?.industry, campaign.title);

            return (
              <article key={campaign.id} className="card review-card" style={{ padding: 0, overflow: 'hidden' }}>
                <SmartImage src={image.src} alt={image.alt} aspectClass="media--21x9" />

                <div style={{ padding: '1.25rem' }}>
                  <div className="workspace-card__heading">
                    <div>
                      <p className="eyebrow" style={{ margin: 0 }}>{campaign.business?.industry || t('common.not_available')}</p>
                      <h3 style={{ margin: '0.15rem 0 0' }}>{campaign.title}</h3>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                        {campaign.business?.businessName || t('common.not_available')}
                      </p>
                    </div>
                    <StatusBadge status="PENDING" label={t('campaign.status_pending')} />
                  </div>

                  <p style={{ margin: '0.9rem 0', fontSize: '0.9rem' }}>{campaign.description}</p>

                  <SpecList items={[
                    { term: t('campaign.target'), detail: `$${goal.toLocaleString(undefined, { maximumFractionDigits: 0 })}` },
                    { term: t('campaign.raised'), detail: `$${funded.toLocaleString(undefined, { maximumFractionDigits: 2 })}` },
                    { term: t('admin.submitted_at'), detail: formatDateTime(campaign.createdAt) }
                  ]} />

                  <div style={{ marginTop: '0.9rem' }}>
                    <ProgressBar compact value={progress} label={t('campaign.funding_progress', { value: Math.round(progress) })} />
                  </div>

                  <div className="review-card__actions">
                    <button onClick={() => openDecision(campaign, 'APPROVED')} className="btn btn-primary" style={{ flex: 1 }}>
                      {t('admin.approve')}
                    </button>
                    <button
                      onClick={() => openDecision(campaign, 'REJECTED')}
                      className="btn btn-secondary"
                      style={{ flex: 1, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                    >
                      {t('admin.reject')}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(decision)}
        tone={decision?.action === 'REJECTED' ? 'danger' : 'primary'}
        title={decision?.action === 'REJECTED' ? t('admin.confirm_reject_campaign_title') : t('admin.confirm_approve_campaign_title')}
        description={decision?.action === 'REJECTED' ? t('admin.confirm_reject_body') : t('admin.confirm_approve_campaign_body')}
        confirmLabel={decision?.action === 'REJECTED' ? t('admin.reject') : t('admin.approve')}
        onCancel={closeDecision}
        onConfirm={submitDecision}
        busy={submitting}
      >
        {decision && (
          <div style={{ marginTop: '1rem' }}>
            <p style={{ margin: '0 0 0.35rem', fontSize: '0.85rem', color: 'var(--ink)' }}>
              <strong>{decision.campaign.title}</strong>
            </p>
            <label className="form-label" htmlFor="campaign-remarks" style={{ fontSize: '0.82rem' }}>
              {t('admin.remarks')}
              {decision.action === 'REJECTED' ? ` (${t('common.required')})` : ` (${t('common.optional')})`}
            </label>
            <textarea
              id="campaign-remarks"
              className="form-input"
              rows="3"
              value={remarks}
              onChange={event => { setRemarks(event.target.value); setRemarkError(''); }}
              placeholder={t('admin.remarks_placeholder')}
            />
            {remarkError && <p className="form-error" role="alert">{remarkError}</p>}
          </div>
        )}
      </ConfirmDialog>
    </div>
  );
};

export default ReviewCampaigns;
