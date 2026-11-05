import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  ClipboardList, ExternalLink, FileSearch, LayoutDashboard, LogOut, Menu, X,
  PieChart, ScanSearch, ScrollText, Store, Wallet
} from 'lucide-react';

const NAV_CONFIG = {
  BUSINESS_OWNER: {
    roleKey: 'auth.role_business',
    home: '/business',
    items: [
      { to: '/business', icon: LayoutDashboard, key: 'nav.dashboard', end: true },
      { to: '/business/create', icon: Store, key: 'business.nav_profile' },
      { to: '/business/verify', icon: FileSearch, key: 'business.nav_verification' },
      { to: '/business/campaign/create', icon: ClipboardList, key: 'business.nav_new_campaign' }
    ]
  },
  INVESTOR: {
    roleKey: 'auth.role_investor',
    home: '/investor',
    items: [
      { to: '/investor', icon: LayoutDashboard, key: 'nav.dashboard', end: true },
      { to: '/investor/campaigns', icon: ScanSearch, key: 'nav.discover' },
      { to: '/investor/portfolio', icon: PieChart, key: 'nav.portfolio' },
      { to: '/investor/verify', icon: Wallet, key: 'investor.identity_verification' }
    ]
  },
  ADMINISTRATOR: {
    roleKey: 'admin.role_label',
    home: '/admin',
    items: [
      { to: '/admin', icon: LayoutDashboard, key: 'nav.dashboard', end: true },
      { to: '/admin/verifications', icon: FileSearch, key: 'nav.verifications' },
      { to: '/admin/campaigns', icon: ClipboardList, key: 'nav.campaigns' },
      { to: '/admin/audits', icon: ScrollText, key: 'nav.audit_logs' }
    ]
  }
};

const DashboardLayout = ({ children }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const config = NAV_CONFIG[role];

  useEffect(() => {
    // Close the mobile sidebar whenever the route changes.
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    // Lock background scrolling while the mobile sidebar is open.
    if (!sidebarOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [sidebarOpen]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  if (!config || !token) {
    // Not signed in yet — render children bare (ProtectedRoute will redirect).
    return <>{children}</>;
  }

  return (
    <div className="app-shell__body">
      <aside
        id="workspace-sidebar"
        className={`app-sidebar ${sidebarOpen ? 'app-sidebar--open' : ''}`}
        aria-label={t('nav.menu')}
      >
        <div className="app-sidebar__head">
          <Link to={config.home} className="app-sidebar__brand">
            <span className="brand__seal" aria-hidden="true" style={{ background: 'rgba(255,255,255,.12)' }}>DA</span>
            <span>Dikaios Amanah</span>
          </Link>
          <button className="app-sidebar__close" onClick={() => setSidebarOpen(false)} aria-label={t('common.close')}>
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <p className="app-sidebar__role">{t(config.roleKey)}</p>

        <nav className="app-sidebar__nav">
          {config.items.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
            >
              <item.icon size={17} aria-hidden="true" />
              <span>{t(item.key)}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__foot">
          <Link to="/" className="sidebar-link">
            <ExternalLink size={16} aria-hidden="true" />
            <span>{t('nav.home')}</span>
          </Link>
          <p className="app-sidebar__note">{t('shell.simulation_note')}</p>
        </div>
      </aside>

      {sidebarOpen && (
        <button className="app-scrim" aria-label={t('common.close')} onClick={() => setSidebarOpen(false)} />
      )}

      <div className="app-shell__main">
        <div className="app-topbar">
          <div className="app-topbar__leading">
            <button
              className="btn btn-secondary btn-sm sidebar-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label={t('nav.menu')}
              aria-expanded={sidebarOpen}
              aria-controls="workspace-sidebar"
            >
              <Menu size={16} aria-hidden="true" /> {t('nav.menu')}
            </button>
            <Link to="/" className="app-topbar__brand">
              <span className="brand__seal" aria-hidden="true" style={{ width: 30, height: 30, borderRadius: 8, fontSize: '0.85rem' }}>DA</span>
              <span>Dikaios Amanah</span>
            </Link>
          </div>

          <div className="app-topbar__actions">
            <span className="nav-chip">{t(config.roleKey)}</span>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en')}
              aria-label={t('common.change_language')}
            >
              {i18n.language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <button className="btn btn-quiet btn-sm" onClick={handleLogout} aria-label={t('nav.logout')}>
              <LogOut size={15} aria-hidden="true" />
              <span className="app-topbar__logout-label">{t('nav.logout')}</span>
            </button>
          </div>
        </div>

        <main className="app-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
