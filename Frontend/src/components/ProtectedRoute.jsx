import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="centered-loading-page animate-fade-in">
        <div>
          <div className="loading-badge">
            <Plane className="spin" size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Verifying Credentials...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Securing connection to AeroIndia gateway
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login and save the location they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <div className="container-xl animate-fade-in" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="sidebar-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--danger-red)', marginBottom: '16px' }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Access Denied (उड़ान निषेध)</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
            Your account role <strong>({role})</strong> does not have permission to view this panel.
          </p>
          <button
            onClick={() => window.history.back()}
            className="btn-primary"
            style={{ justifyContent: 'center', width: '100%' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
