import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Download, Share2, Plane } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Barcode from 'react-barcode';

export default function ConfirmationPage({ latestBooking, latestPayment }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Helper date formatter (e.g. "2026-07-31T08:30:00" -> "31 Jul 2026")
  const formatIsoDate = (isoString) => {
    if (!isoString) return '31 Jul 2026';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return '31 Jul 2026';
    }
  };

  // Helper time formatter (e.g. "2026-07-31T08:30:00" -> "08:30 AM")
  const formatIsoTime = (isoString) => {
    if (!isoString) return '08:30 AM';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '08:30 AM';
    }
  };

  // Fallback booking details if none exists in state (e.g. direct url hits)
  const booking = latestBooking || {
    pnr: "AE9X24P",
    totalPrice: 8450.00,
    flightNumber: "AI-864",
    departureAirport: "DEL",
    arrivalAirport: "BOM",
    departureTime: "2026-07-31T08:30:00",
    seatNumber: "14A",
    passengerName: `${user?.firstName || 'Rajesh'} ${user?.lastName || 'Kumar'}`,
    seatClass: "ECONOMY",
    createdAt: "2026-07-31T08:00:00"
  };

  const passengerName = booking.passengerName || `${user?.firstName || 'Rajesh'} ${user?.lastName || 'Kumar'}`;
  
  // Calculate display times
  const displayDepartureDate = formatIsoDate(booking.departureTime);
  const displayDepartureTime = formatIsoTime(booking.departureTime);
  const displayAmount = latestPayment?.amount || booking.totalPrice || 8450;
  


  return (
    <div className="container-xl animate-fade-in" style={{ paddingBottom: '48px' }}>
      
      {/* Centered Success Checkmark Banner */}
      <div className="success-banner">
        <div className="success-check-circle">
          <CheckCircle2 size={40} strokeWidth={2.5} />
        </div>
        <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Booking Confirmed!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Your flight is secured. We've sent the confirmation and e-ticket to <strong style={{ color: 'var(--text-dark)' }}>{user?.email || 'kumar.rajesh@example.com'}</strong>.
        </p>

        {/* Side-by-side Stats pills */}
        <div className="pnr-box-grid">
          <div className="pnr-stat-card">
            <div className="pnr-stat-label">PNR NUMBER</div>
            <div className="pnr-stat-value" style={{ color: 'var(--primary-blue)' }}>{booking.pnr}</div>
          </div>
          <div className="pnr-stat-card">
            <div className="pnr-stat-label">TOTAL PAID</div>
            <div className="pnr-stat-value">₹{parseFloat(displayAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Boarding Pass Card Section */}
      <div className="boarding-pass-section">
        <div className="boarding-pass-header-bar">
          <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🎫</span> Digital Boarding Pass
          </h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
              <Download size={14} /> Save PDF
            </button>
            <button className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', gap: '4px' }}>
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>

        {/* Boarding Pass structure */}
        <div className="boarding-pass-card">
          
          {/* Left Wide Section */}
          <div className="boarding-pass-left">
            <div className="bp-row" style={{ marginBottom: '12px' }}>
              <div className="info-block">
                <span className="info-label">FLIGHT NO.</span>
                <span className="info-value" style={{ color: 'var(--primary-blue)', fontSize: '1.15rem' }}>{booking.flightNumber}</span>
              </div>
              <div>
                <span className="badge-success">CONFIRMED</span>
              </div>
            </div>

            {/* Route row */}
            <div className="bp-airport-flow">
              <div className="bp-station">
                <span className="bp-city-code">{booking.departureAirport}</span>
                <span className="bp-city-desc">AeroIndia Departure Station</span>
                <span className="bp-time">{displayDepartureTime}</span>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 20px', position: 'relative' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>2H 15M</span>
                <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border-light)', margin: '6px 0', position: 'relative' }}>
                  <Plane size={12} style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%) rotate(90deg)', color: 'var(--primary-blue)', backgroundColor: 'var(--bg-white)', padding: '0 2px' }} />
                </div>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-light)', fontWeight: 700 }}>NON-STOP</span>
              </div>

              <div className="bp-station" style={{ alignItems: 'flex-end', textAlign: 'right' }}>
                <span className="bp-city-code">{booking.arrivalAirport}</span>
                <span className="bp-city-desc">AeroIndia Arrival Station</span>
                <span className="bp-time">Scheduled Arrival</span>
              </div>
            </div>

            {/* Bottom fields row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '12px', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '16px' }}>
              <div className="info-block">
                <span className="info-label">DATE</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>{displayDepartureDate}</span>
              </div>
              <div className="info-block">
                <span className="info-label">GATE</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>T3-G12</span>
              </div>
              <div className="info-block">
                <span className="info-label">BOARDING</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>45 Mins Prior</span>
              </div>
              <div className="info-block">
                <span className="info-label">SEAT</span>
                <span className="info-value" style={{ fontSize: '0.85rem', color: 'var(--primary-blue)' }}>
                  {booking.seatNumber}
                </span>
              </div>
            </div>
          </div>

          {/* Right Stub Section */}
          <div className="boarding-pass-right">
            <div>
              <div className="info-block" style={{ marginBottom: '14px' }}>
                <span className="info-label">PASSENGER</span>
                <span className="info-value" style={{ fontSize: '0.9rem' }}>{passengerName}</span>
              </div>

              <div className="info-block" style={{ marginBottom: '14px' }}>
                <span className="info-label">CLASS</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>{booking.seatClass || "ECONOMY"}</span>
              </div>

              <div className="info-block">
                <span className="info-label">BAGGAGE</span>
                <span className="info-value" style={{ fontSize: '0.85rem' }}>Standard Allowance</span>
              </div>
            </div>

            {/* Real Barcode of PNR */}
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center', backgroundColor: '#fff', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <Barcode
                value={booking.pnr || "AE9X24P"}
                format="CODE128"
                width={1.2}
                height={50}
                displayValue={true}
                fontSize={12}
                background="#ffffff"
                lineColor="#000000"
                margin={0}
              />
            </div>
          </div>

        </div>
      </div>
      
      {/* Return to home button */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '36px' }}>
        <button className="btn-primary" onClick={() => navigate('/')}>
          Book Another Flight
        </button>
      </div>

    </div>
  );
}
