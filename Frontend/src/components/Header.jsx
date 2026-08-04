import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { User, ChevronDown, LogOut, Settings, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, isAuthenticated, logout, isPassenger, isStaff, isAdmin, role } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleAccountClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setDropdownOpen(!dropdownOpen);
    }
  };

  const handleLogoutClick = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header className="global-header">
      <div className="container-xl header-container">
        {/* Left: Logo */}
        <Link to="/" className="logo-lockup" onClick={() => setDropdownOpen(false)}>
          <div className="logo-mark">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
            >
              <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
            </svg>
          </div>
          <div className="logo-text">
            <span className="brand-name">
              <span className="aero">Aero</span>
              <span className="india">इंडिया</span>
            </span>
            <span className="logo-subtitle">FLIGHT SERVICES</span>
          </div>
        </Link>

        {/* Center: Navigation Links depending on logged-in role */}
        <nav className="nav-links">
          {(!isAuthenticated || isPassenger) && (
            <>
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
                end
              >
                <span>🌐</span> Flights (उड़ानें)
              </NavLink>
              <NavLink
                to="/my-bookings"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span>🧳</span> My Bookings (मेरी बुकिंग)
              </NavLink>
            </>
          )}

          {isAuthenticated && isStaff && (
            <NavLink
              to="/staff"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              <span>🛠</span> Operations Console
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span>🛡</span> Admin Console
              </NavLink>
              <NavLink
                to="/staff"
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                <span>🛠</span> Operations Console
              </NavLink>
            </>
          )}
        </nav>

        {/* Right: Actions */}
        <div className="header-actions" style={{ position: 'relative' }}>
          <div className="lang-switch">
            EN | HI <ChevronDown size={14} style={{ display: 'inline', marginLeft: '2px', verticalAlign: 'middle' }} />
          </div>
          
          <button className="btn-account" onClick={handleAccountClick}>
            <User size={16} />
            <span>
              {isAuthenticated ? `${user?.firstName || 'User'}` : 'Account'}
            </span>
            {isAuthenticated && <ChevronDown size={14} />}
          </button>

          {/* Profile Dropdown */}
          {isAuthenticated && dropdownOpen && (
            <div className="header-dropdown-menu animate-fade-in">
              <div className="dropdown-user-info">
                <strong>{user?.firstName} {user?.lastName}</strong>
                <span>{user?.email}</span>
                <span className={`role-tag ${role?.toLowerCase()}`}>{role}</span>
              </div>
              
              <div className="dropdown-divider"></div>
              
              {isPassenger && (
                <Link to="/my-bookings" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <ClipboardList size={16} /> My Bookings
                </Link>
              )}
              {isStaff && (
                <Link to="/staff" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                  <Settings size={16} /> Staff Controls
                </Link>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} /> Admin Controls
                  </Link>
                  <Link to="/staff" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <Settings size={16} /> Operations Console
                  </Link>
                </>
              )}
              
              <div className="dropdown-divider"></div>
              
              <button className="dropdown-item logout" onClick={handleLogoutClick}>
                <LogOut size={16} /> Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
