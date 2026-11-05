import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, Store } from 'lucide-react';
import { PageHeader, EmptyState, CardSkeleton, ErrorState } from '../../components/UI';
import CampaignCard from '../../components/CampaignCard';
import BusinessCard from '../../components/BusinessCard';
import { apiRequest } from '../../lib/api';

const BrowseCampaigns = () => {
  const { t } = useTranslation();
  const [campaigns, setCampaigns] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Discovery controls
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState('');
  const [sort, setSort] = useState('newest');
  const [activeView, setActiveView] = useState('campaigns');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [campaignsRes, businessesRes] = await Promise.all([
          apiRequest('/api/investor/campaigns'),
          apiRequest('/api/investor/businesses')
        ]);
        if (!campaignsRes.ok || !businessesRes.ok) throw new Error(t('common.error'));
        setCampaigns(campaignsRes.data || []);
        setBusinesses(businessesRes.data || []);
      } catch (err) {
        setError(err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [t]);

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

  const filteredAndSortedBusinesses = useMemo(() => {
    let result = [...businesses];

    if (search) {
      const lowerSearch = search.toLowerCase().trim();
      result = result.filter(b =>
        (b.businessName || '').toLowerCase().includes(lowerSearch) ||
        (b.industry || '').toLowerCase().includes(lowerSearch) ||
        (b.description || '').toLowerCase().includes(lowerSearch)
      );
    }

    if (industry) {
      result = result.filter(b => (b.industry || '').toLowerCase() === industry.toLowerCase());
    }

    if (sort === 'name') {
      result.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
    } else if (sort === 'campaigns_count') {
      result.sort((a, b) => (b.activeCampaignCount || 0) - (a.activeCampaignCount || 0));
    } else {
      result.sort((a, b) => (a.businessName || '').localeCompare(b.businessName || ''));
    }

    return result;
  }, [businesses, search, industry, sort]);

  const handleViewChange = (view) => {
    setActiveView(view);
    if (view === 'campaigns') setSort('newest');
    else setSort('name');
  };

  const handleClearFilters = () => {
    setSearch('');
    setIndustry('');
    setSort(activeView === 'campaigns' ? 'newest' : 'name');
  };

  if (loading) return <div><CardSkeleton count={6} /></div>;
  if (error) return <ErrorState message={error} />;

  const defaultSort = activeView === 'campaigns' ? 'newest' : 'name';
  const hasActiveFilters = search !== '' || industry !== '' || sort !== defaultSort;

  const currentItems = activeView === 'campaigns' ? filteredAndSortedCampaigns : filteredAndSortedBusinesses;

  const resultCountText = activeView === 'campaigns'
    ? (currentItems.length === 1 ? t('investor.showing_one_result') : t('investor.showing_results', { count: currentItems.length }))
    : (currentItems.length === 1 ? t('investor.showing_one_business') : t('investor.showing_businesses', { count: currentItems.length }));

  const noMatchText = activeView === 'campaigns' ? t('investor.no_matches') : t('investor.no_business_matches');

  return (
    <div>
      <PageHeader
        eyebrow={t('investor.dashboard')}
        title={t('investor.browse_campaigns')}
        description={t('investor.discover_intro')}
      />

      <div className="discovery-tabs" role="tablist" aria-label={t('investor.browse_campaigns')}>
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

      <div className="filter-bar">
        <div style={{ position: 'relative', flex: '1 1 260px', display: 'flex', alignItems: 'center' }}>
          <Search size={16} aria-hidden="true" style={{ position: 'absolute', left: '.8rem', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder={t('investor.search_placeholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '2.4rem' }}
            aria-label={t('investor.search_placeholder')}
          />
        </div>

        <select
          value={industry}
          onChange={e => setIndustry(e.target.value)}
          className="form-input"
          style={{ flex: '1 1 190px' }}
          aria-label={t('investor.all_industries')}
        >
          <option value="">{t('investor.all_industries')}</option>
          {availableIndustries.map(ind => (
            <option key={ind} value={ind}>{ind}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          className="form-input"
          style={{ flex: '1 1 190px' }}
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
          <button className="btn btn-secondary btn-sm" onClick={handleClearFilters} style={{ flex: '0 0 auto' }}>
            {t('investor.clear_filters')}
          </button>
        )}
        <span className="hero-strip__item" style={{ fontSize: '.85rem' }}>
          <SlidersHorizontal size={15} aria-hidden="true" /> {resultCountText}
        </span>
      </div>

      {currentItems.length === 0 ? (
        <EmptyState
          title={noMatchText}
          action={<button className="btn btn-primary" onClick={handleClearFilters}>{t('investor.clear_filters')}</button>}
          icon={activeView === 'campaigns' ? <Search size={20} aria-hidden="true" /> : <Store size={20} aria-hidden="true" />}
        />
      ) : activeView === 'campaigns' ? (
        <div className="grid campaign-grid-mobile" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {filteredAndSortedCampaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
        </div>
      ) : (
        <div className="grid campaign-grid-mobile" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          {filteredAndSortedBusinesses.map(b => <BusinessCard key={b.id} business={b} />)}
        </div>
      )}
    </div>
  );
};

export default BrowseCampaigns;
