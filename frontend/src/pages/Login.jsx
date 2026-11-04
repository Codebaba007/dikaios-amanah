import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';
import { ErrorState, SmartImage } from '../components/UI';
import { getImage } from '../lib/images';
import { apiRequest } from '../lib/api';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { ok, data } = await apiRequest('/api/auth/login', { method: 'POST', body: formData });
      if (!ok) throw new Error(data?.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.user.role);

      if (data.user.role === 'BUSINESS_OWNER') navigate('/business');
      else if (data.user.role === 'INVESTOR') navigate('/investor');
      else if (data.user.role === 'ADMINISTRATOR') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const hero = getImage('heroAuth');

  return (
    <div className="container">
      <div className="auth-layout">
        <aside className="auth-layout__aside">
          <div className="auth-layout__aside-img">
            <img src={hero.src} alt={hero.alt} />
          </div>
          <span className="brand__seal" style={{ width: 44, height: 44, fontSize: '1.1rem' }}>DA</span>
          <div style={{ marginTop: 'auto' }}>
            <p className="eyebrow eyebrow--light">{t('nav.login')}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem' }}>Dikaios Amanah</h1>
            <p>{t('auth.login_intro')}</p>
          </div>
        </aside>

        <div className="auth-layout__form">
          <p className="eyebrow">{t('auth.login_title')}</p>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>{t('auth.login_title')}</h2>

          {error && <div style={{ marginBottom: '1rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="loginEmail">{t('auth.email')}</label>
              <input
                id="loginEmail"
                type="email"
                className="form-input"
                autoComplete="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="loginPassword">{t('auth.password')}</label>
              <input
                id="loginPassword"
                type="password"
                className="form-input"
                autoComplete="current-password"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1.1rem' }} disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.submit')}
            </button>
          </form>

          <p className="auth-footnote">
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.35rem', color: 'var(--ink-muted)' }}>
              <BadgeCheck size={15} aria-hidden="true" /> {t('home.trust_signal_one')}
            </span>
          </p>
          <p className="auth-footnote" style={{ marginTop: '0.9rem' }}>
            {t('auth.login_prompt')}{' '}
            <Link to="/register">{t('nav.register')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
