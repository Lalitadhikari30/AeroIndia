import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowRight, Eye, EyeOff, Plane, Shield, Users } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('PASSENGER');
  const [accessCode, setAccessCode] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      await register(email, password, firstName, lastName, role, accessCode);
      navigate(role === 'ADMIN' ? '/admin' : role === 'STAFF' ? '/staff' : '/', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl animate-fade-in" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
      <div className="sidebar-card" style={{ width: '100%', maxWidth: '500px', padding: '40px 32px' }}>
        
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '8px' }}>Create an Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Register to book flights or manage your airline operations
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '24px' }}>
            <ShieldAlert size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Role Selector */}
          <div>
            <label className="form-label" style={{ marginBottom: '10px', display: 'block' }}>I am registering as</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setRole('PASSENGER')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 8px',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease',
                  border: role === 'PASSENGER' ? '2px solid var(--primary-blue)' : '2px solid var(--border-light)',
                  backgroundColor: role === 'PASSENGER' ? '#eff6ff' : 'var(--bg-white)',
                  color: role === 'PASSENGER' ? 'var(--primary-blue)' : 'var(--text-dark)'
                }}
              >
                <Plane size={20} />
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Passenger</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('STAFF')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 8px',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease',
                  border: role === 'STAFF' ? '2px solid var(--primary-blue)' : '2px solid var(--border-light)',
                  backgroundColor: role === 'STAFF' ? '#eff6ff' : 'var(--bg-white)',
                  color: role === 'STAFF' ? 'var(--primary-blue)' : 'var(--text-dark)'
                }}
              >
                <Users size={20} />
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Operations Staff</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('ADMIN')}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', padding: '10px 8px',
                  borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.2s ease',
                  border: role === 'ADMIN' ? '2px solid var(--warning-amber)' : '2px solid var(--border-light)',
                  backgroundColor: role === 'ADMIN' ? '#fffbeb' : 'var(--bg-white)',
                  color: role === 'ADMIN' ? '#b45309' : 'var(--text-dark)'
                }}
              >
                <Shield size={20} />
                <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>Airline Admin</div>
              </button>
            </div>
            {role === 'STAFF' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--primary-blue)', marginTop: '8px', lineHeight: '1.4' }}>
                ✦ Operations staff access lets you view flight passenger manifests and manage queue waitlists.
              </p>
            )}
            {role === 'ADMIN' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--warning-amber)', marginTop: '8px', lineHeight: '1.4' }}>
                ✦ Admin access lets you create flight routes, adjust dynamic pricing, and manage user authorization.
              </p>
            )}
          </div>

          {/* Verification Code for staff/admin */}
          {(role === 'STAFF' || role === 'ADMIN') && (
            <div className="search-field">
              <label className="form-label" htmlFor="accessCode">
                {role === 'STAFF' ? 'Staff Verification Code' : 'Admin Verification Code'}
              </label>
              <input
                type="text"
                id="accessCode"
                className="form-input"
                placeholder={role === 'STAFF' ? 'Enter staff registration key' : 'Enter admin registration key'}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                required
              />
            </div>
          )}

          {/* Name Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="search-field">
              <label className="form-label" htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                className="form-input"
                placeholder="Rajesh"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="search-field">
              <label className="form-label" htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                className="form-input"
                placeholder="Kumar"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="search-field">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="e.g. rajesh@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="search-field">
            <label className="form-label" htmlFor="password">Password (Min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="Choose a secure password"
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

          {/* Confirm Password */}
          <div className="search-field">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="Re-enter password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '8px' }}
          >
            {loading ? 'Registering...' : 'Register Account'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Link to Login */}
        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-blue)' }}>
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
}
