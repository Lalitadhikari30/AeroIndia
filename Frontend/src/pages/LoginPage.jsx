import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Where to redirect after login
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      
      // Role based redirect overrides standard "from" if accessing passenger home directly
      if (from === '/') {
        if (user.role === 'STAFF') {
          navigate('/staff', { replace: true });
        } else if (user.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl animate-fade-in" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="sidebar-card" style={{ width: '100%', maxWidth: '450px', padding: '40px 32px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Login to AeroIndia</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Access flights, manage itineraries, and track booking statuses
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Email */}
          <div className="search-field">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g. aditya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="search-field">
            <label className="form-label" htmlFor="password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-light)', border: 'none', background: 'none', padding: '4px' }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Logging in...' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Link to Register */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
            Register Now
          </Link>
        </div>

      </div>
    </div>
  );
}
