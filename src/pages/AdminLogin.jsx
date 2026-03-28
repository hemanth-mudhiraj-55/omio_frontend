import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../config/api';
import '../styles/admin.css';

export default function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(creds),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', data.username);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-shell">
      <div className="admin-login-card">
        <p className="admin-login-logo">OmiO <span>Admin</span></p>
        <p className="admin-login-sub">Sign in to the console</p>
        <h2>Welcome back</h2>
        {error && <div className="admin-error-msg">{error}</div>}
        <form onSubmit={handleSubmit} autoComplete="on">
          <div className="admin-input-group">
            <label htmlFor="adm-user">Username</label>
            <input
              id="adm-user"
              className="admin-input"
              value={creds.username}
              onChange={e => setCreds(c => ({ ...c, username: e.target.value }))}
              autoComplete="username"
              required
              maxLength={100}
            />
          </div>
          <div className="admin-input-group">
            <label htmlFor="adm-pass">Password</label>
            <input
              id="adm-pass"
              type="password"
              className="admin-input"
              value={creds.password}
              onChange={e => setCreds(c => ({ ...c, password: e.target.value }))}
              autoComplete="current-password"
              required
              maxLength={200}
            />
          </div>
          <button
            className="admin-btn admin-btn--primary"
            style={{ width: '100%', padding: '11px', marginTop: '10px', fontSize: '0.9rem', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
