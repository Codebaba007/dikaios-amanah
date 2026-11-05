import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__main">
          <div>
            <div className="footer__brand">
              <span className="brand__seal" aria-hidden="true">DA</span>
              <span>Dikaios Amanah</span>
            </div>
            <p style={{ marginTop: '0.9rem', maxWidth: '340px' }}>{t('footer.mission')}</p>
          </div>

          <div>
            <h4>{t('footer.platform_heading')}</h4>
            <ul>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/register">{t('nav.register')}</Link></li>
              <li><Link to="/login">{t('nav.login')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.participation_heading')}</h4>
            <ul>
              <li><Link to="/register">{t('footer.join_investor')}</Link></li>
              <li><Link to="/register">{t('footer.join_business')}</Link></li>
            </ul>
          </div>

          <div>
            <h4>{t('footer.assurance_heading')}</h4>
            <ul>
              <li>{t('assurance.verification')}</li>
              <li>{t('assurance.documents')}</li>
              <li>{t('assurance.audit')}</li>
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Dikaios Amanah · {t('footer.academic_note')}</span>
          <span>{t('footer.simulation_note')}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
