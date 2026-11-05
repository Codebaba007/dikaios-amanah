import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const roleHome = role === 'BUSINESS_OWNER' ? '/business' : role === 'ADMINISTRATOR' ? '/admin' : '/investor';
  const roleLabel = role === 'BUSINESS_OWNER' ? t('auth.role_business') : role === 'ADMINISTRATOR' ? t('admin.role_label') : t('auth.role_investor');

  const closeMenu = () => setIsMenuOpen(false);
  const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'en' ? 'bn' : 'en');
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    closeMenu();
    navigate('/login');
  };

  return (
    <nav className="navbar" aria-label="Main navigation">
      <div className="container nav-shell">
        <Link to="/" className="brand" onClick={closeMenu}>
          <span className="brand__seal" aria-hidden="true">DA</span>
          <span>Dikaios Amanah</span>
        </Link>

        {token && (
          <span className="nav-chip" aria-label={t('nav.signed_in_as', { role: roleLabel })}>{roleLabel}</span>
        )}

        {token ? (
          <div className="nav-actions">
            <button className="btn btn-quiet" onClick={toggleLanguage} aria-label="Change language">
              {i18n.language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <Link className="btn btn-secondary" to={roleHome}>
              <LayoutDashboard size={16} aria-hidden="true" /> {t('nav.dashboard')}
            </Link>
            <button className="btn btn-primary" onClick={handleLogout}>
              <LogOut size={16} aria-hidden="true" /> {t('nav.logout')}
            </button>
          </div>
        ) : (
          <div className="nav-actions">
            <button className="btn btn-quiet nav-menu-toggle" type="button" aria-expanded={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={t('nav.menu')}>
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <button className="btn btn-quiet" onClick={toggleLanguage} aria-label="Change language">
              {i18n.language === 'en' ? 'বাংলা' : 'English'}
            </button>
            <Link to="/login" className="btn btn-secondary">{t('nav.login')}</Link>
            <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
