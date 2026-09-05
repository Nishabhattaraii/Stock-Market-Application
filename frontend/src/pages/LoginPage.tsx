import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../app/providers';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const setDemoRole = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc', padding: '20px' }}>
      <div className="card" style={{ width: '100%', maxWidth: '420px', padding: '32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#f1f5f9', marginBottom: '12px' }}>
            <Shield size={28} style={{ color: '#0f172a' }} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a' }}>NEPSE Intelligence</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Nepal Stock Market Intelligence Dashboard</p>
        </div>

        {error && (
          <div style={{ padding: '10px 12px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#b91c1c', fontSize: '13px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Email Address</label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#334155', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '10px' }} disabled={loading}>
            <KeyRound size={16} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>Demo Quick Switch:</span>
          <div className="flex gap-2 justify-between">
            <button
              onClick={() => setDemoRole('admin@nepse.com', 'admin123')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
            >
              Admin
            </button>
            <button
              onClick={() => setDemoRole('analyst@nepse.com', 'analyst123')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
            >
              Analyst
            </button>
            <button
              onClick={() => setDemoRole('viewer@nepse.com', 'viewer123')}
              className="btn btn-secondary"
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
            >
              Viewer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
