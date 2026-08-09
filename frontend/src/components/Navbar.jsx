import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'bn' : 'en';
    i18n.changeLanguage(newLang);
  };

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container flex justify-between items-center">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>Dikaios Amanah</h2>
        </Link>
        <div className="flex items-center gap-4">
          <button className="btn btn-secondary" onClick={toggleLanguage}>
            {i18n.language === 'en' ? 'বাংলা' : 'English'}
          </button>
          {token ? (
            <>
              {role === 'BUSINESS_OWNER' && <Link to="/business" className="btn btn-secondary">Dashboard</Link>}
              {role === 'INVESTOR' && <Link to="/investor" className="btn btn-secondary">Dashboard</Link>}
              {role === 'ADMINISTRATOR' && <Link to="/admin" className="btn btn-secondary">Admin</Link>}
              <button className="btn btn-primary" onClick={handleLogout}>
                {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-primary">{t('nav.register')}</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
