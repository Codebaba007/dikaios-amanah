import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader, EmptyState, LoadingState, ErrorState } from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';
import BusinessCard from '../../components/BusinessCard';

const BrowseCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Discovery Controls State
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeView, setActiveView] = useState('campaigns');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/investor/campaigns', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(t('common.error'));
      setCampaigns(await res.json());
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique industries from campaign data
  const availableIndustries = useMemo(() => {
    const industrySet = new Set();
    const uniqueIndustries = [];
    campaigns.forEach(c => {
      const ind = c.business?.industry;
      if (ind) {
        const lowerInd = ind.toLowerCase();
        if (!industrySet.has(lowerInd)) {
          industrySet.add(lowerInd);
          uniqueIndustries.push(ind);
        }
      }
    });
    return uniqueIndustries.sort();
  }, [campaigns]);

  // Derive unique businesses from campaign data
  const derivedBusinesses = useMemo(() => {
    const businessMap = new Map();
    campaigns.forEach(c => {
      const biz = c.business;
      if (!biz || !biz.id) return;
      if (businessMap.has(biz.id)) {
        const existing = businessMap.get(biz.id);
        existing.campaignCount += 1;
        existing.campaignIds.push(c.id);
      } else {
        businessMap.set(biz.id, {
          id: biz.id,
          businessName: biz.businessName || t('common.not_available'),
          industry: biz.industry || '',
          description: biz.description || '',
          campaignCount: 1,
          campaignIds: [c.id]
        });
      }
    });
    return Array.from(businessMap.values());
  }, [campaigns, t]);

  // --- Campaigns: filter + sort ---
  const filteredAndSortedCampaigns = useMemo(() => {
    let result = [...campaigns];

    if (search) {
      const lowerSearch = search.toLowerCase().trim();
      result = result.filter(c =>
        (c.title || '').toLowerCase().includes(lowerSearch) ||
        (c.business?.businessName || '').toLowerCase().includes(lowerSearch) ||
        (c.business?.industry || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (industry) {
      result = result.filter(c => (c.business?.industry || '').toLowerCase() === industry.toLowerCase());
    }

    result.sort((a, b) => {
      if (sort === 'progress') {
        const progA = a.fundingGoal ? (Number(a.currentFunding) || 0) / Number(a.fundingGoal) : 0;
        const progB = b.fundingGoal ? (Number(b.currentFunding) || 0) / Number(b.fundingGoal) : 0;
        return progB - progA;
      }
      if (sort === 'goal') {
        return (Number(b.fundingGoal) || 0) - (Number(a.fundingGoal) || 0);
      }
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    return result;
  }, [campaigns, search, industry, sort]);

  // --- Businesses: filter + sort ---
  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...derivedBusinesses];

    if (search) {
      const lowerSearch = search.toLowerCase().trim();
      result = result.filter(b =>
        b.businessName.toLowerCase().includes(lowerSearch) ||
        b.industry.toLowerCase().includes(lowerSearch) ||
        b.description.toLowerCase().includes(lowerSearch)
      );
    }

    if (industry) {
      result = result.filter(b => b.industry.toLowerCase() === industry.toLowerCase());
    }

    // Sort options for businesses
    if (sort === 'name') {
      result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    } else if (sort === 'campaigns_count') {
      result.sort((a, b) => b.campaignCount - a.campaignCount);
    } else {
      // Default: alphabetical by name
      result.sort((a, b) => a.businessName.localeCompare(b.businessName));
    }

    return result;
  }, [derivedBusinesses, search, industry, sort]);

  // Adapt sort to the active view when switching tabs
  const handleViewChange = (view) => {
    setActiveView(view);
    // Reset sort to a sensible default for the target view
    if (view === 'campaigns') {
      setSort('newest');
    } else {
      setSort('name');
    }
  };

  const handleClearFilters = () => {
    setSearch('');
    setIndustry('');
    setSort(activeView === 'campaigns' ? 'newest' : 'name');
  };

  if (loading) return <div className="container"><LoadingState /></div>;
  if (error) return <div className="container" style={{ marginTop: '2rem' }}><ErrorState message={error} /></div>;

  const defaultSort = activeView === 'campaigns' ? 'newest' : 'name';
  const hasActiveFilters = search !== '' || industry !== '' || sort !== defaultSort;

  const currentItems = activeView === 'campaigns' ? filteredAndSortedCampaigns : filteredAndSortedBusinesses;

  // Result count text
  const resultCountText = activeView === 'campaigns'
    ? (currentItems.length === 1 ? t('investor.showing_one_result') : t('investor.showing_results', { count: currentItems.length }))
    : (currentItems.length === 1 ? t('investor.showing_one_business') : t('investor.showing_businesses', { count: currentItems.length }));

  // Empty match text
  const noMatchText = activeView === 'campaigns' ? t('investor.no_matches') : t('investor.no_business_matches');

  return (
    <div className="container">
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.browse_campaigns')}
        description={t('investor.discover_intro')}
      />

      {campaigns.length === 0 ? (
        <EmptyState
          title={t('investor.no_campaigns')}
          description={t('investor.discover_intro')}
        />
      ) : (
        <>
          {/* Discovery View Tabs */}
          <div className="discovery-tabs" role="tablist">
            <button
              role="tab"
              aria-selected={activeView === 'campaigns'}
              className={`discovery-tab${activeView === 'campaigns' ? ' discovery-tab--active' : ''}`}
              onClick={() => handleViewChange('campaigns')}
            >
              {t('investor.tab_campaigns')}
            </button>
            <button
              role="tab"
              aria-selected={activeView === 'businesses'}
              className={`discovery-tab${activeView === 'businesses' ? ' discovery-tab--active' : ''}`}
              onClick={() => handleViewChange('businesses')}
            >
              {t('investor.tab_businesses')}
            </button>
          </div>

          {/* Discovery Controls */}
          <div className="discovery-controls" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem', alignItems: 'center' }}>
            <input
              type="text"
              placeholder={t('investor.search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-control"
              style={{ flex: '1 1 250px' }}
            />

            <select
              value={industry}
              onChange={e => setIndustry(e.target.value)}
              className="form-control"
              style={{ flex: '1 1 200px' }}
            >
              <option value="">{t('investor.all_industries')}</option>
              {availableIndustries.map(ind => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>

            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="form-control"
              style={{ flex: '1 1 200px' }}
              aria-label={t('investor.sort_label')}
            >
              {activeView === 'campaigns' ? (
                <>
                  <option value="newest">{t('investor.sort_newest')}</option>
                  <option value="progress">{t('investor.sort_progress')}</option>
                  <option value="goal">{t('investor.sort_goal')}</option>
                </>
              ) : (
                <>
                  <option value="name">{t('investor.sort_name')}</option>
                  <option value="campaigns_count">{t('investor.sort_campaigns_count')}</option>
                </>
              )}
            </select>

            {hasActiveFilters && (
              <button
                className="btn btn-secondary"
                onClick={handleClearFilters}
                style={{ flex: '0 0 auto' }}
              >
                {t('investor.clear_filters')}
              </button>
            )}
          </div>

          {/* Result Count */}
          <div style={{ marginBottom: '1.5rem', color: 'var(--ink-muted, #666)' }}>
            {resultCountText}
          </div>

          {/* Content Grid */}
          {currentItems.length === 0 ? (
            <EmptyState
              title={noMatchText}
              action={
                <button className="btn btn-primary" onClick={handleClearFilters}>
                  {t('investor.clear_filters')}
                </button>
              }
            />
          ) : activeView === 'campaigns' ? (
            <div className="campaign-grid">
              {filteredAndSortedCampaigns.map(c => (
                <CampaignCard key={c.id} campaign={c} />
              ))}
            </div>
          ) : (
            <div className="campaign-grid">
              {filteredAndSortedBusinesses.map(b => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BrowseCampaigns;
