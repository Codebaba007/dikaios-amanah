import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, User } from 'lucide-react';
import { ErrorState } from '../components/UI';
import { getImage } from '../lib/images';
import { apiRequest } from '../lib/api';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'INVESTOR' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { ok, data } = await apiRequest('/api/auth/register', { method: 'POST', body: formData });
      if (!ok) throw new Error(data?.error || 'Registration failed');

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
            <p className="eyebrow eyebrow--light">{t('nav.register')}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem' }}>Dikaios Amanah</h1>
            <p>{t('auth.register_intro')}</p>
          </div>
        </aside>

        <div className="auth-layout__form">
          <p className="eyebrow">{t('auth.register_title')}</p>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: "'Playfair Display', serif" }}>{t('auth.register_title')}</h2>

          {error && <div style={{ marginBottom: '1rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="regRole">{t('auth.role')}</label>
              <div className="role-picker" role="radiogroup" aria-label={t('auth.role')}>
                <label className={`role-option ${formData.role === 'INVESTOR' ? 'role-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="INVESTOR"
                    checked={formData.role === 'INVESTOR'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                  <User size={18} aria-hidden="true" />
                  <span>
                    <strong>{t('auth.role_investor')}</strong>
                    <span>{t('auth.role_investor_desc')}</span>
                  </span>
                </label>
                <label className={`role-option ${formData.role === 'BUSINESS_OWNER' ? 'role-option--active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="BUSINESS_OWNER"
                    checked={formData.role === 'BUSINESS_OWNER'}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                  />
                  <Building2 size={18} aria-hidden="true" />
                  <span>
                    <strong>{t('auth.role_business')}</strong>
                    <span>{t('auth.role_business_desc')}</span>
                  </span>
                </label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="regName">{t('auth.name')}</label>
              <input
                id="regName"
                type="text"
                className="form-input"
                autoComplete="name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="regEmail">{t('auth.email')}</label>
              <input
                id="regEmail"
                type="email"
                className="form-input"
                autoComplete="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="regPassword">{t('auth.password')}</label>
              <input
                id="regPassword"
                type="password"
                className="form-input"
                autoComplete="new-password"
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
            {t('auth.register_prompt')}{' '}
            <Link to="/login">{t('nav.login')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
