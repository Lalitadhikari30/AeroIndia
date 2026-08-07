import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Info, HelpCircle, PhoneCall, Loader2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function MyBookingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTab, setActiveTab] = useState('Upcoming'); // 'Upcoming', 'Completed', 'Cancelled'
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFlightNum, setTrackFlightNum] = useState('');

  const fetchBookings = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      // GET /api/bookings/passenger/{passengerId}
      const data = await api.get(`/api/bookings/passenger/${user.id}`);
      
      // Normalize and add thumbnails
      const normalized = (data || []).map(b => ({
        id: b.id,
        fromCity: b.departureAirport === 'DEL' ? 'Delhi' : b.departureAirport === 'BLR' ? 'Bangalore' : 'Goa',
        fromCode: b.departureAirport,
        toCity: b.arrivalAirport === 'BOM' ? 'Mumbai' : b.arrivalAirport === 'DEL' ? 'Delhi' : 'Bangalore',
        toCode: b.arrivalAirport,
        pnr: b.pnr,
        flightNumber: b.flightNumber,
        airline: 'AeroIndia',
        status: b.status, // PENDING, CONFIRMED, PAYMENT_PENDING, CANCELLED, WAITLISTED
        departureDate: formatIsoDate(b.departureTime),
        departureTime: formatIsoTime(b.departureTime),
        arrivalDate: formatIsoDate(b.departureTime), // Mock same day
        arrivalTime: formatIsoTime(b.departureTime, 2), // Mock +2 hours arrival
        travelers: '1 Passenger',
        passengerNames: [b.passengerName],
        amountPaid: parseFloat(b.totalPrice || 6000),
        fareClass: b.seatClass || 'ECONOMY',
        image: b.arrivalAirport === 'BOM' 
          ? 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=300'
          : b.arrivalAirport === 'DEL'
            ? 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=300'
            : 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=300'
      }));

      setBookingsList(normalized);
    } catch (err) {
      setError(err.message || 'Failed to load bookings. Connecting offline simulation databases...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ISO DateTime helper to display date (e.g. "2026-07-31T08:30:00" -> "Jul 31, 2026")
  const formatIsoDate = (isoString) => {
    if (!isoString) return 'Jul 31, 2026';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Jul 31, 2026';
    }
  };

  // ISO DateTime helper to display time
  const formatIsoTime = (isoString, hoursOffset = 0) => {
    if (!isoString) return '08:30 AM';
    try {
      const date = new Date(isoString);
      if (hoursOffset > 0) {
        date.setHours(date.getHours() + hoursOffset);
      }
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '08:30 AM';
    }
  };

  // Handle Cancellation
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    setLoading(true);
    setError('');
    try {
      // PUT /api/bookings/{id}/cancel
      const headers = { 'X-User-Id': user.id };
      await api.put(`/api/bookings/${bookingId}/cancel`, {}, headers);
      
      alert("Your booking cancellation request has been processed. Refund will be processed shortly.");
      fetchBookings();
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
      setLoading(false);
    }
  };

  const handleTrackStatus = (e) => {
    e.preventDefault();
    if (!trackFlightNum) return;
    alert(`Flight Status for ${trackFlightNum}: ON TIME. Scheduled departure is at 08:30 AM.`);
  };

  // Perform search query filtering
  const filteredBookings = bookingsList.filter((b) => {
    // Tab filtering
    const statusLower = b.status?.toLowerCase() || '';
    if (activeTab === 'Upcoming') {
      if (statusLower === 'cancelled' || statusLower === 'expired') return false;
    } else if (activeTab === 'Completed') {
      if (statusLower !== 'completed' && statusLower !== 'confirmed') return false;
    } else if (activeTab === 'Cancelled') {
      if (statusLower !== 'cancelled') return false;
    }

    // Search query filtering
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const routeStr = `${b.fromCity} to ${b.toCity}`.toLowerCase();
    const codesStr = `${b.fromCode} ${b.toCode}`.toLowerCase();
    const pnrStr = b.pnr?.toLowerCase() || '';
    return routeStr.includes(query) || codesStr.includes(query) || pnrStr.includes(query);
  });

  if (loading && bookingsList.length === 0) {
    return (
      <div className="centered-loading-page animate-fade-in">
        <div>
          <div className="loading-badge">
            <Loader2 className="spin" size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Fetching Your Bookings...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Accessing AeroIndia travel registry database
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Dark navy header band */}
      <section className="my-bookings-header-band">
        <div className="container-xl">
          <h1><span>🧳</span> My Bookings</h1>
          <p>
            Manage your travel itinerary, download e-tickets, or request cancellations. Keep track of all your journeys with AeroIndia.
          </p>
        </div>
      </section>

      {/* Main body wrapper */}
      <div className="container-xl">
        <div className="my-bookings-layout">
          
          {/* Left Column list */}
          <div>
            {/* Filter Bar with Tabs and Search */}
            <div className="bookings-filter-bar">
              <div className="search-tabs" style={{ marginBottom: 0, borderBottom: 'none', paddingBottom: 0 }}>
                {['Upcoming', 'Completed', 'Cancelled'].map((tabName) => (
                  <button
                    key={tabName}
                    type="button"
                    className={`tab-pill ${activeTab === tabName ? 'active' : ''}`}
                    onClick={() => setActiveTab(tabName)}
                  >
                    {tabName}
                  </button>
                ))}
              </div>

              {/* Search PNR Input */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="🔍 Search PNR or Route..."
                  className="bookings-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '20px' }}>
                <ShieldAlert size={18} />
                <span>{error}</span>
              </div>
            )}

            {/* List of cards */}
            <div className="bookings-list">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((b) => {
                  const isWL = b.status?.toLowerCase() === 'waitlisted';
                  const isCancel = b.status?.toLowerCase() === 'cancelled';
                  
                  return (
                    <div key={b.id} className="booking-card">
                      {/* Destination Thumbnail */}
                      <div
                        className="booking-thumbnail"
                        style={{ backgroundImage: `url(${b.image})` }}
                      ></div>

                      {/* Booking Details Box */}
                      <div className="booking-details-box">
                        <div className="booking-title-row">
                          <div>
                            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>✈</span> {b.fromCity} ({b.fromCode}) to {b.toCity} ({b.toCode})
                            </h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
                              PNR: {b.pnr} &bull; AeroIndia {b.flightNumber}
                            </p>
                          </div>
                          <div>
                            <span className={isWL ? 'badge-warning' : isCancel ? 'badge-warning' : 'badge-success'} style={{ backgroundColor: isCancel ? '#fee2e2' : undefined, color: isCancel ? 'var(--danger-red)' : undefined }}>
                              {b.status}
                            </span>
                          </div>
                        </div>

                        {/* Detail row fields */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '16px', fontSize: '0.85rem' }}>
                          <div>
                            <span className="info-label" style={{ fontSize: '0.65rem' }}>DEPARTURE</span>
                            <div style={{ fontWeight: 600 }}>{b.departureDate}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.departureTime}</div>
                          </div>
                          <div>
                            <span className="info-label" style={{ fontSize: '0.65rem' }}>ARRIVAL</span>
                            <div style={{ fontWeight: 600 }}>{b.arrivalDate}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.arrivalTime}</div>
                          </div>
                          <div>
                            <span className="info-label" style={{ fontSize: '0.65rem' }}>TRAVELERS</span>
                            <div style={{ fontWeight: 600 }}>{b.travelers}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {b.passengerNames ? b.passengerNames.join(', ') : 'Primary Traveler'}
                            </div>
                          </div>
                          <div>
                            <span className="info-label" style={{ fontSize: '0.65rem' }}>AMOUNT PAID</span>
                            <div style={{ fontWeight: 800, color: 'var(--primary-blue)' }}>₹{b.amountPaid.toLocaleString('en-IN')}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{b.fareClass}</div>
                          </div>
                        </div>

                        {/* Action buttons */}
                        {!isCancel && (
                          <div className="booking-actions-row">
                            <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px' }}>
                              ⬇ E-Ticket
                            </button>
                            <button className="btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px' }}>
                              🖨 Print
                            </button>
                            <button
                              className="btn-outline"
                              style={{ padding: '6px 14px', fontSize: '0.8rem', gap: '4px', color: 'var(--primary-blue)' }}
                              onClick={() => navigate(`/seats?flightId=${b.flightNumber}`)}
                            >
                              ⇄ Modify
                            </button>
                            <button
                              className="btn-cancel"
                              style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleCancelBooking(b.id)}
                            >
                              🗑 Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="sidebar-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                  <Info size={36} style={{ color: 'var(--text-light)', marginBottom: '12px' }} />
                  <h3>No bookings found.</h3>
                  <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>There are no itineraries matching this status filter or search query.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column sidebar cards */}
          <aside className="my-bookings-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Assistance Card */}
            <div className="sidebar-card" style={{ backgroundColor: '#eff6ff', border: '1px solid rgba(29,78,216,0.1)' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary-blue)', marginBottom: '8px' }}>
                <HelpCircle size={18} />
                <span>⚠ Need Assistance?</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: '1.45', marginBottom: '16px' }}>
                Experiencing issues with your booking? Our 24/7 support team and AI concierge are ready to help.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem', gap: '6px' }}
                  onClick={() => navigate('/concierge')}
                >
                  <PhoneCall size={14} /> Talk to Support
                </button>
                <button
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
                >
                  View FAQs
                </button>
              </div>
            </div>

            {/* Quick Track Card */}
            <div className="sidebar-card">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                Quick Track
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Real-time flight status
              </p>
              <form onSubmit={handleTrackStatus}>
                <input
                  type="text"
                  placeholder="e.g. AI-402"
                  className="form-input"
                  style={{ padding: '8px 12px', fontSize: '0.85rem', marginBottom: '10px' }}
                  value={trackFlightNum}
                  onChange={(e) => setTrackFlightNum(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem', backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: 'transparent' }}
                >
                  Check Status
                </button>
              </form>
            </div>

          </aside>

        </div>
      </div>
    </div>
  );
}
