import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function ReviewPage({ selectedFlight, selectedSeat, setLatestBooking, setLatestPayment }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Timer State (starts at 10 minutes = 600 seconds)
  const [timeLeft, setTimeLeft] = useState(600);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Base flight details (defaults to DEL -> BOM)
  const flight = selectedFlight || {
    id: "ai-801",
    airline: "Air India",
    flightNumber: "AI-801",
    departureAirport: "DEL",
    arrivalAirport: "BOM",
    price: 6800,
    classLabel: "Economy Flex"
  };

  // Seat selection cost
  const seatFee = selectedSeat ? selectedSeat.price : 0;
  const seatLabel = selectedSeat ? `Seat Selection (${selectedSeat.code} - ${selectedSeat.category})` : "Seat Selection";

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoError, setPromoError] = useState('');

  // Fare calculations
  const baseFare = flight.price;
  const taxes = 1450;    // Fixed conv
  const convenienceFee = 300; // Fixed conv
  const insuranceFee = 249;   // Fixed conv
  const rawTotal = baseFare + taxes + convenienceFee + insuranceFee + seatFee;
  const totalAmount = Math.max(0, rawTotal - discount);

  // Store pending booking session details for abandoned payment notifications
  useEffect(() => {
    if (!user?.email) return;
    const pendingData = {
      passengerName: `${user?.firstName || 'Passenger'} ${user?.lastName || ''}`.trim(),
      passengerEmail: user.email,
      pnr: 'AI-PENDING-' + Math.floor(1000 + Math.random() * 9000),
      flightRoute: `${flight.departureAirport || 'DEL'} to ${flight.arrivalAirport || 'BOM'}`,
      amount: totalAmount
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(pendingData));
  }, [user, flight, totalAmount]);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoMessage('');
    const cleanCode = promoCode.trim().toUpperCase();

    if (!cleanCode) return;

    if (cleanCode === 'PAYSAFE5' || cleanCode === 'FLY2026' || cleanCode === 'AERO10') {
      setDiscount(500);
      setPromoMessage('🎉 Promo code applied! ₹500 discount added.');
    } else {
      setPromoError('Invalid code. Use code PAYSAFE5 to save ₹500!');
    }
  };

  const handleProceed = async () => {
    if (!agreed) return;
    setLoading(true);
    setError('');

    try {
      const passengerName = `${user?.firstName || 'Rajesh'} ${user?.lastName || 'Kumar'}`;
      const passengerEmail = user?.email || 'kumar.rajesh@example.com';
      const userId = user?.id || 'guest-user-123';
      
      // Step 1: Create Booking -> POST /api/bookings
      const seatClassMapped = selectedSeat?.category?.toUpperCase()?.includes('BUSINESS') ? 'BUSINESS' : 'ECONOMY';
      
      const formattedDeparture = flight.departureDate 
        ? `${flight.departureDate}T${flight.departureTime ? flight.departureTime.replace(/\s*[AP]M/i, '').trim() : '08:30:00'}` 
        : '2026-08-10T08:30:00';
      const emailDepTimeFormatted = flight.departureDate 
        ? `${flight.departureDate} ${flight.departureTime || '08:30 AM'}` 
        : '10 Aug 2026 08:30 AM';

      const bookingPayload = {
        flightId: flight.id,
        seatNumber: selectedSeat ? selectedSeat.code : '14A',
        seatClass: seatClassMapped,
        passengerName,
        passengerEmail,
        totalPrice: totalAmount,
        departureTime: formattedDeparture,
        idempotencyKey: Math.random().toString(36).substring(2) + Date.now().toString(36)
      };

      const bookingHeaders = {
        'X-User-Id': userId
      };

      const bookingResponse = await api.post('/api/bookings/', bookingPayload, bookingHeaders);

      // Step 2: Process Payment -> POST /api/payments
      const paymentPayload = {
        bookingId: bookingResponse.id,
        amount: totalAmount,
        currency: 'INR',
        paymentMethod: 'CREDIT_CARD'
      };

      const paymentResponse = await api.post('/api/payments/', paymentPayload);

      // Save references in global app state
      setLatestBooking(bookingResponse);
      setLatestPayment(paymentResponse);

      // Payment completed! Clear pending booking session
      sessionStorage.removeItem('pendingBooking');

      // Trigger AeroIndia Booking Confirmation & e-Ticket Email (Non-blocking)
      api.fireAndForget('/api/notifications/booking-confirmed', {
        eventType: 'BOOKING_CONFIRMED',
        pnr: bookingResponse.pnr || 'AI-' + Math.floor(1000 + Math.random() * 9000),
        passengerName,
        passengerEmail,
        flightNumber: flight.flightNumber || 'AI-801',
        departureAirport: flight.departureAirport || 'DEL',
        arrivalAirport: flight.arrivalAirport || 'BOM',
        departureTime: emailDepTimeFormatted,
        seatNumber: selectedSeat ? selectedSeat.code : '14A',
        totalPrice: totalAmount
      });

      // Redirect to confirmation pass page immediately
      navigate('/confirmation');
    } catch (err) {
      // Trigger Abandoned Payment / Pending Reminder Notification (Non-blocking)
      api.fireAndForget('/api/notifications/abandoned-payment', {
        passengerName: `${user?.firstName || 'Passenger'}`,
        passengerEmail: user?.email || 'passenger@example.com',
        pnr: 'AI-' + Math.floor(1000 + Math.random() * 9000),
        flightRoute: `${flight.departureAirport || 'DEL'} to ${flight.arrivalAirport || 'BOM'}`,
        amount: totalAmount
      });

      setError(err.message || 'Payment or booking transaction failed. Please check connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl animate-fade-in">
      
      {loading && (
        <div className="centered-loading-page" style={{ position: 'fixed', zIndex: 2000, background: 'rgba(255,255,255,0.9)' }}>
          <div>
            <div className="loading-badge">
              <Loader2 className="spin" size={36} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Processing Payment...</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Authorizing secure transaction and generating e-ticket stubs
            </p>
          </div>
        </div>
      )}

      <div className="review-layout">
        
        {/* Left Column details */}
        <div>
          {/* Header Row */}
          <div className="review-card-header" style={{ borderBottom: 'none', marginBottom: '8px' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Review &amp; Payment</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '6px' }}>
                Select Flights &gt; Passenger Details &gt; <strong style={{ color: 'var(--text-dark)' }}>Payment</strong>
              </p>
            </div>
            
            {/* Live seats held countdown */}
            <div className="seats-held-timer">
              <Clock size={14} />
              <span>⏱ SEATS HELD FOR {formatTime(timeLeft)}</span>
            </div>
          </div>

          {error && (
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '20px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {/* Flight Summary Card */}
          <div className="review-card">
            <div className="review-card-header">
              <h3><span>✈</span> Flight Summary</h3>
              <a href="#change" className="clear-link" onClick={(e) => { e.preventDefault(); navigate('/search'); }}>Change Flights</a>
            </div>

            {/* Departure timeline */}
            <div className="route-timeline-box" style={{ marginBottom: 0 }}>
              <div className="timeline-top">
                <strong>Departure: {flight.departureAirport} to {flight.arrivalAirport}</strong>
                <span className="flexi-badge">{flight.classLabel || 'Economy Flex'}</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Flight Number &bull; {flight.flightNumber}
              </p>
              <div className="timeline-main">
                <div className="timeline-station" style={{ textAlign: 'left' }}>
                  <div className="timeline-time">{flight.departureTime}</div>
                  <div className="timeline-code">{flight.departureAirport}</div>
                </div>

                <div className="timeline-path">
                  <span className="timeline-duration">{flight.duration}</span>
                  <div className="timeline-dots"></div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: 700 }}>{flight.stops || 'NON-STOP'}</span>
                </div>

                <div className="timeline-station" style={{ textAlign: 'right' }}>
                  <div className="timeline-time">{flight.arrivalTime}</div>
                  <div className="timeline-code">{flight.arrivalAirport}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Traveler Information Card */}
          <div className="review-card">
            <div className="review-card-header">
              <h3><span>👤</span> Traveler Information</h3>
            </div>

            <div className="info-grid">
              <div className="info-block">
                <span className="info-label">ADULT 1 (PRIMARY)</span>
                <span className="info-value">{user?.firstName} {user?.lastName}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Email Address</span>
                <span className="info-value">{user?.email}</span>
              </div>
              <div className="info-block">
                <span className="info-label">Mobile Number</span>
                <span className="info-value">+91 98765 43210</span>
              </div>
              <div className="info-block">
                <span className="info-label">AEROINDIA FREQUENT FLYER</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                  <span className="info-value">AI-99203341</span>
                  <span className="badge-info" style={{ padding: '2px 8px', fontSize: '0.65rem' }}>Silver Tier</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column Fare Summary Card */}
        <aside>
          <div className="fare-sticky-box">
            <h3><span>₹</span> Fare Summary</h3>
            <p className="fare-title-sub">All prices in Indian Rupees (₹)</p>

            <div className="fare-divider"></div>

            {/* Base breakdown */}
            <div className="fare-item-row">
              <span>Base Fare (1 Adult)</span>
              <span>₹{baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div className="fare-item-row">
              <span>Taxes &amp; Surcharges</span>
              <span>₹{taxes.toLocaleString('en-IN')}</span>
            </div>
            <div className="fare-item-row">
              <span>Convenience Fee</span>
              <span>₹{convenienceFee.toLocaleString('en-IN')}</span>
            </div>

            {/* Add-ons */}
            <div className="fare-item-row" style={{ marginTop: '16px', fontWeight: 700, color: 'var(--text-dark)' }}>
              <span>ADD-ONS &amp; INSURANCE</span>
            </div>
            <div className="fare-item-row">
              <span>Travel Insurance</span>
              <span>₹{insuranceFee.toLocaleString('en-IN')}</span>
            </div>
            <div className="fare-item-row">
              <span>{seatLabel}</span>
              <span>{seatFee === 0 ? 'FREE' : `₹${seatFee.toLocaleString('en-IN')}`}</span>
            </div>

            {/* Promo Code Form */}
            <div style={{ marginTop: '16px' }}>
              <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Coupon Code (e.g. PAYSAFE5)"
                  className="form-input"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', textTransform: 'uppercase' }}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button type="submit" className="btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                  Apply
                </button>
              </form>
              {promoMessage && <div style={{ color: '#16a34a', fontSize: '0.75rem', marginTop: '4px', fontWeight: 600 }}>{promoMessage}</div>}
              {promoError && <div style={{ color: 'var(--danger-red)', fontSize: '0.75rem', marginTop: '4px' }}>{promoError}</div>}
            </div>

            {discount > 0 && (
              <div className="fare-item-row" style={{ color: '#16a34a', fontWeight: 600, marginTop: '8px' }}>
                <span>Promo Discount</span>
                <span>-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}

            <div className="fare-divider"></div>

            {/* Total */}
            <div className="fare-total-row">
              <span className="total-label">Total Amount</span>
              <span className="total-price">₹{totalAmount.toLocaleString('en-IN')}</span>
            </div>

            {/* Verification Checkbox */}
            <label className="checkbox-label" style={{ alignItems: 'flex-start', margin: '24px 0 16px', fontSize: '0.8rem', lineHeight: '1.4' }}>
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <span>
                I agree to the Fare Rules, Privacy Policy and Terms of Service. I confirm that all passenger names match the Government ID.
              </span>
            </label>

            {/* Payment Button */}
            <button
              type="button"
              disabled={!agreed || loading}
              onClick={handleProceed}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '0.95rem' }}
            >
              {agreed ? `Pay ₹${totalAmount.toLocaleString('en-IN')}` : "Agree to terms to proceed"}
            </button>

            {/* SSL text */}
            <div style={{ textAlign: 'center', color: 'var(--text-light)', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '12px' }}>
              <Shield size={12} />
              <span>Secure SSL Encryption</span>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
