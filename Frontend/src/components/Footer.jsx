import React from 'react';

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="container-xl">
        <div className="footer-top">
          {/* Left Logo */}
          <div className="logo-lockup">
            <div className="logo-mark" style={{ width: '32px', height: '32px' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
              </svg>
            </div>
            <span className="brand-name" style={{ fontSize: '1.1rem' }}>
              <span className="aero">Aero</span>
              <span className="india">India</span>
            </span>
          </div>

          {/* Center Links */}
          <ul className="footer-links">
            <li><a href="#about">About Us</a></li>
            <li><a href="#careers">Careers</a></li>
            <li><a href="#status">Flight Status</a></li>
            <li><a href="#baggage">Baggage Info</a></li>
            <li><a href="#terms">Terms of Service</a></li>
            <li><a href="#privacy">Privacy Policy</a></li>
          </ul>

          {/* Right Status */}
          <div className="live-status">
            <span className="status-dot"></span>
            <span>Live Network Status</span>
          </div>
        </div>

        {/* Bottom copyright info */}
        <div className="footer-bottom">
          <p>© 2026 AeroIndia Flight Services. Member of the Indian Skies Alliance. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
