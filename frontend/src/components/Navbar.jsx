import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const roleLinks = {
    BUSINESS_OWNER: [{ to: '/business', label: t('nav.dashboard') }, { to: '/business/verify', label: t('nav.verification') }],
    INVESTOR: [{ to: '/investor', label: t('nav.dashboard') }, { to: '/investor/verify', label: t('nav.verification') }, { to: '/investor/campaigns', label: t('nav.discover') }, { to: '/investor/portfolio', label: t('nav.portfolio') }],
    ADMINISTRATOR: [{ to: '/admin', label: t('nav.dashboard') }, { to: '/admin/verifications', label: t('nav.verifications') }, { to: '/admin/campaigns', label: t('nav.campaigns') }, { to: '/admin/audits', label: t('nav.audit_logs') }]
  };

  const closeMenu = () => setIsMenuOpen(false);
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('role'); closeMenu(); navigate('/login'); };

  return <nav className="navbar"><div className="container nav-shell">
    <Link to="/" className="brand" onClick={closeMenu}><span className="brand__seal" aria-hidden="true">DA</span><span>Dikaios Amanah</span></Link>
    {token && <button className="btn btn-quiet nav-menu-toggle" type="button" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-expanded={isMenuOpen}>{t('nav.menu')}</button>}
    {token && <div className={`nav-links ${isMenuOpen ? 'nav-links--open' : ''}`}>{roleLinks[role]?.map(link => <Link key={link.to} to={link.to} className="nav-link" onClick={closeMenu}>{link.label}</Link>)}</div>}
    <div className="nav-actions"><button className="btn btn-secondary" onClick={toggleLanguage}>{i18n.language === 'en' ? 'বাংলা' : 'English'}</button>{token ? <button className="btn btn-primary" onClick={handleLogout}>{t('nav.logout')}</button> : <><Link to="/login" className="btn btn-secondary">{t('nav.login')}</Link><Link to="/register" className="btn btn-primary">{t('nav.register')}</Link></>}</div>
  </div></nav>;
};

export default Navbar;
