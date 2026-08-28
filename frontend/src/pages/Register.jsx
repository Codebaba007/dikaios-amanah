import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { ErrorState } from '../components/UI';

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
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

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

  return (
    <div className="container" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
      <div className="auth-layout">
        <aside className="auth-layout__aside">
          <div>
            <span className="brand__seal" style={{ width: 44, height: 44, fontSize: '1.35rem', marginBottom: '1.5rem', display: 'grid', placeItems: 'center', borderRadius: '50%', background: 'rgba(255,255,255,.15)' }}>DA</span>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.2rem' }}>Dikaios Amanah</h1>
            <p>{t('auth.register_intro')}</p>
          </div>
        </aside>
        <div className="auth-layout__form">
          <p className="eyebrow">{t('nav.register')}</p>
          <h2 style={{ marginBottom: '1.5rem' }}>{t('auth.register_title')}</h2>

          {error && <div style={{ marginBottom: '1rem' }}><ErrorState message={error} /></div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="regName">{t('auth.name')}</label>
              <input
                id="regName"
                type="text"
                className="form-input"
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
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="regRole">{t('auth.role')}</label>
              <select
                id="regRole"
                className="form-input"
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="INVESTOR">{t('auth.role_investor')}</option>
                <option value="BUSINESS_OWNER">{t('auth.role_business')}</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1.25rem' }} disabled={submitting}>
              {submitting ? t('common.loading') : t('auth.submit')}
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', fontSize: '.9rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--brand)', fontWeight: 600 }}>
              {t('nav.login')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
