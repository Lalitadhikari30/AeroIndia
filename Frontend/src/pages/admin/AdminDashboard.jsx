import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Sparkles, Plus, AlertCircle, CheckCircle, Search, DollarSign, Database, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Flights', 'Users', 'Bookings', 'GenAI'

  // Admin stats
  const [stats] = useState({
    totalFlights: 12,
    totalBookings: 144,
    revenue: 894500,
    occupancyRate: '78.5%'
  });

  // Flight states
  const [flights, setFlights] = useState([]);
  const [newFlight, setNewFlight] = useState({
    flightNumber: 'AI-',
    airline: 'AeroIndia',
    departureAirport: 'DEL',
    arrivalAirport: 'BOM',
    departureTime: '2026-07-31T08:30:00',
    arrivalTime: '2026-07-31T10:45:00',
    aircraftType: 'Airbus A320neo',
    totalRows: 10,
    seatsPerRow: 6,
    basePrice: 5500
  });

  // Dynamic pricing stub
  const [pricingUpdate, setPricingUpdate] = useState({
    flightId: '',
    multiplier: 1.0
  });

  // User management state
  const [users, setUsers] = useState([]);

  // Bookings oversight PNR lookup
  const [searchPnr, setSearchPnr] = useState('');
  const [searchedBooking, setSearchedBooking] = useState(null);
  
  // GenAI content states
  const [ingestTitle, setIngestTitle] = useState('');
  const [ingestContent, setIngestContent] = useState('');
  const [ingestCategory, setIngestCategory] = useState('BAGGAGE');
  
  // Shared feedback logs
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch initial flights list
  const loadFlights = async () => {
    try {
      const res = await api.get('/api/flights/search?from=DEL&to=BOM&date=2026-07-31');
      setFlights(res.flights || []);
    } catch {
      // Fallback
    }
  };

  // Fetch registered users list
  const loadUsers = async () => {
    try {
      const data = await api.get('/api/auth/users');
      const normalized = (data || []).map(u => ({
        id: u.id,
        email: u.email,
        name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'No Name',
        role: u.role
      }));
      setUsers(normalized);
    } catch (err) {
      console.error('Failed to load users', err);
    }
  };

  useEffect(() => {
    loadFlights();
    loadUsers();
  }, []);

  // Handle Flight Creation
  const handleCreateFlight = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const totalRowsVal = parseInt(newFlight.totalRows);
      const businessRows = Math.max(1, Math.floor(totalRowsVal * 0.2));
      
      const seatClasses = [
        { className: 'BUSINESS', fromRow: 1, toRow: businessRows, priceMultiplier: 2.5 },
        { className: 'ECONOMY', fromRow: businessRows + 1, toRow: totalRowsVal, priceMultiplier: 1.0 }
      ];

      const payload = {
        ...newFlight,
        basePrice: parseFloat(newFlight.basePrice),
        totalRows: totalRowsVal,
        seatsPerRow: parseInt(newFlight.seatsPerRow),
        seatClasses
      };

      // Header role needs to be ADMIN
      const headers = { 'X-User-Role': 'ADMIN' };
      const created = await api.post('/api/flights/', payload, headers);
      setSuccess(`Flight ${created.flightNumber} created successfully!`);
      loadFlights();
      
      // Reset form
      setNewFlight({
        flightNumber: 'AI-',
        airline: 'AeroIndia',
        departureAirport: 'DEL',
        arrivalAirport: 'BOM',
        departureTime: '2026-07-31T08:30:00',
        arrivalTime: '2026-07-31T10:45:00',
        aircraftType: 'Airbus A320neo',
        totalRows: 10,
        seatsPerRow: 6,
        basePrice: 5500
      });
    } catch (err) {
      setError(err.message || 'Failed to create flight.');
    } finally {
      setLoading(false);
    }
  };

  // Pricing Rule update (stubbed)
  const handleUpdatePricing = (e) => {
    e.preventDefault();
    // // TODO: backend endpoint needed for PUT /api/flights/{id}/pricing
    alert('Dynamic pricing tier updated in simulation. (Backend endpoint pending)');
  };

  // User Role edit
  const handleRoleChange = async (userId, newRole) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = { role: newRole };
      await api.put(`/api/auth/users/${userId}/role`, payload);
      setSuccess(`User role updated to ${newRole}!`);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user role.');
    } finally {
      setLoading(false);
    }
  };

  // Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${userName}"?`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.delete(`/api/auth/users/${userId}`);
      setSuccess(`User "${userName}" deleted successfully!`);
      loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    } finally {
      setLoading(false);
    }
  };

  // Bookings search by PNR
  const handlePnrSearch = async (e) => {
    e.preventDefault();
    if (!searchPnr) return;
    setLoading(true);
    setError('');
    setSearchedBooking(null);
    try {
      const b = await api.get(`/api/bookings/pnr/${searchPnr}`);
      setSearchedBooking(b);
    } catch {
      setError('PNR not found or invalid.');
    } finally {
      setLoading(false);
    }
  };

  // Refund handler
  const handleRefund = async (booking) => {
    if (!window.confirm(`Are you sure you want to process a full refund for PNR ${booking.pnr}?`)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      // Find payment by booking ID: GET /api/payments/booking/{bookingId}
      const payment = await api.get(`/api/payments/booking/${booking.id}`);
      
      if (!payment || !payment.id) {
        throw new Error('No associated payment transaction found for this booking.');
      }

      // Process refund: POST /api/payments/{id}/refund
      const refundRequest = {
        amount: payment.amount,
        reason: 'Cancelled by Administrator'
      };

      const refundResult = await api.post(`/api/payments/${payment.id}/refund`, refundRequest);
      setSuccess(`Refund processed successfully. Status: ${refundResult.status || 'SUCCESS'}`);
      
      // Update searched booking status locally
      if (searchedBooking && searchedBooking.id === booking.id) {
        setSearchedBooking(prev => ({ ...prev, status: 'CANCELLED' }));
      }
    } catch (err) {
      setError(err.message || 'Refund processing failed.');
    } finally {
      setLoading(false);
    }
  };

  // GenAI policy doc ingestion
  const handleIngestDocument = async (e) => {
    e.preventDefault();
    if (!ingestTitle || !ingestContent) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        title: ingestTitle,
        content: ingestContent,
        category: ingestCategory
      };
      
      await api.post('/api/genai/documents/ingest', payload);
      setSuccess('Policy document embedded and ingested successfully! RAG chatbot has been updated.');
      setIngestTitle('');
      setIngestContent('');
    } catch (err) {
      setError(err.message || 'Failed to ingest document. GenAI microservice might be offline.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-xl animate-fade-in" style={{ paddingTop: '32px' }}>
      
      {/* Admin header console */}
      <div className="my-bookings-header-band" style={{ borderRadius: 'var(--radius-lg)', padding: '24px 32px', marginBottom: '32px', background: 'var(--primary-navy-dark)' }}>
        <h1 style={{ color: 'var(--bg-white)', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛡</span> Admin Operations Command
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '4px' }}>
          Configure pricing formulas, add flight itineraries, manage user access, and ingest GenAI RAG policies.
        </p>
      </div>

      {/* Tabs */}
      <div className="search-tabs" style={{ marginBottom: '24px' }}>
        {['Overview', 'Flight Management', 'User Control', 'Bookings Oversight', 'GenAI RAG Ingest'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Global Toast Messages */}
      {error && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: 'var(--radius-md)', color: 'var(--success-green)', fontSize: '0.85rem', marginBottom: '24px' }}>
          <CheckCircle size={18} />
          <span>{success}</span>
        </div>
      )}

      {/* Overview tab */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--primary-blue)', backgroundColor: '#eff6ff' }}>
                <Database size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL DEPARTURES</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.totalFlights}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: '#0369a1', backgroundColor: '#e0f2fe' }}>
                <Users size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL REGISTERED USERS</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {users.length}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--success-green)', backgroundColor: 'var(--success-bg)' }}>
                <DollarSign size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REVENUE STREAM</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                ₹{stats.revenue.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--warning-amber)', backgroundColor: 'var(--warning-bg)' }}>
                <Sparkles size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OCCUPANCY RATE</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.occupancyRate}
              </p>
            </div>

          </div>
        </div>
      )}

      {/* Flight Management Tab */}
      {activeTab === 'Flight Management' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
          
          {/* Create Flight Form */}
          <div className="sidebar-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={18} /> Schedule New Departure
            </h3>
            
            <form onSubmit={handleCreateFlight} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="search-field">
                  <label className="form-label">Flight Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.flightNumber}
                    onChange={(e) => setNewFlight({ ...newFlight, flightNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="search-field">
                  <label className="form-label">Airline Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.airline}
                    onChange={(e) => setNewFlight({ ...newFlight, airline: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="search-field">
                  <label className="form-label">Departure Airport (IATA)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.departureAirport}
                    onChange={(e) => setNewFlight({ ...newFlight, departureAirport: e.target.value.toUpperCase() })}
                    maxLength={3}
                    required
                  />
                </div>
                <div className="search-field">
                  <label className="form-label">Arrival Airport (IATA)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.arrivalAirport}
                    onChange={(e) => setNewFlight({ ...newFlight, arrivalAirport: e.target.value.toUpperCase() })}
                    maxLength={3}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="search-field">
                  <label className="form-label">Departure Date &amp; Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.departureTime}
                    onChange={(e) => setNewFlight({ ...newFlight, departureTime: e.target.value })}
                    required
                  />
                </div>
                <div className="search-field">
                  <label className="form-label">Arrival Date &amp; Time</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.arrivalTime}
                    onChange={(e) => setNewFlight({ ...newFlight, arrivalTime: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '12px' }}>
                <div className="search-field">
                  <label className="form-label">Aircraft Type</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newFlight.aircraftType}
                    onChange={(e) => setNewFlight({ ...newFlight, aircraftType: e.target.value })}
                    required
                  />
                </div>
                <div className="search-field">
                  <label className="form-label">Total Rows</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newFlight.totalRows}
                    onChange={(e) => setNewFlight({ ...newFlight, totalRows: e.target.value })}
                    required
                  />
                </div>
                <div className="search-field">
                  <label className="form-label">Seats Per Row</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newFlight.seatsPerRow}
                    onChange={(e) => setNewFlight({ ...newFlight, seatsPerRow: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="search-field">
                <label className="form-label">Base Seat Ticket Price (₹)</label>
                <input
                  type="number"
                  className="form-input"
                  value={newFlight.basePrice}
                  onChange={(e) => setNewFlight({ ...newFlight, basePrice: e.target.value })}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '12px' }}
              >
                Create Flight Route
              </button>
            </form>

          </div>

          {/* Pricing multiplier edit */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="sidebar-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Adjust Pricing Rule (Dynamic Pricing)</h3>
              
              <form onSubmit={handleUpdatePricing} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="search-field">
                  <label className="form-label">Target Flight</label>
                  <select
                    className="form-select"
                    value={pricingUpdate.flightId}
                    onChange={(e) => setPricingUpdate({ ...pricingUpdate, flightId: e.target.value })}
                  >
                    <option value="">Choose Flight</option>
                    {flights.map(f => (
                      <option key={f.id} value={f.id}>{f.flightNumber} ({f.departureAirport} to {f.arrivalAirport})</option>
                    ))}
                  </select>
                </div>
                <div className="search-field">
                  <label className="form-label">Base Price Multiplier</label>
                  <input
                    type="number"
                    className="form-input"
                    step="0.1"
                    min="0.5"
                    max="5.0"
                    value={pricingUpdate.multiplier}
                    onChange={(e) => setPricingUpdate({ ...pricingUpdate, multiplier: parseFloat(e.target.value) })}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', color: 'var(--primary-blue)' }}
                >
                  Adjust Tiers (// TODO: endpoint needed)
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* User Control Tab */}
      {activeTab === 'User Control' && (
        <div className="sidebar-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '20px' }}>User Role Management</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '16px' }}>
            Modify authorization groups or remove user records from the central identity registry.
          </p>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px' }}>User Name</th>
                  <th style={{ padding: '12px' }}>Email Address</th>
                  <th style={{ padding: '12px' }}>Active Role</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Modify Access</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '12px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span className={u.role === 'ADMIN' ? 'badge-warning' : u.role === 'STAFF' ? 'badge-info' : 'badge-success'}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <select
                        className="form-select"
                        style={{ width: '140px', padding: '6px', fontSize: '0.8rem', display: 'inline-block' }}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="PASSENGER">PASSENGER</option>
                        <option value="STAFF">STAFF</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        className="btn-cancel"
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bookings Oversight Tab */}
      {activeTab === 'Bookings Oversight' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* PNR search lookup card */}
          <div className="sidebar-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Fetch Booking by PNR</h3>
            <form onSubmit={handlePnrSearch} style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                placeholder="Enter PNR e.g. AER882Z"
                className="form-input"
                style={{ maxWidth: '300px' }}
                value={searchPnr}
                onChange={(e) => setSearchPnr(e.target.value.toUpperCase())}
                required
              />
              <button type="submit" className="btn-primary">
                <Search size={16} /> Lookup PNR
              </button>
            </form>
          </div>

          {/* Searched Booking display */}
          {searchedBooking && (
            <div className="booking-card animate-fade-in" style={{ margin: 0 }}>
              <div className="booking-details-box" style={{ padding: '24px' }}>
                
                <div className="booking-title-row" style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '16px', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem' }}>
                      Passenger: {searchedBooking.passengerName}
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                      Booking ID: {searchedBooking.id} &bull; PNR: <strong style={{ color: 'var(--primary-blue)' }}>{searchedBooking.pnr}</strong>
                    </p>
                  </div>
                  <div>
                    <span className={searchedBooking.status === 'CONFIRMED' ? 'badge-success' : 'badge-warning'}>
                      {searchedBooking.status}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px', fontSize: '0.85rem' }}>
                  <div>
                    <span className="info-label">Flight Number</span>
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>{searchedBooking.flightNumber}</div>
                  </div>
                  <div>
                    <span className="info-label">Route</span>
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>{searchedBooking.departureAirport} &rarr; {searchedBooking.arrivalAirport}</div>
                  </div>
                  <div>
                    <span className="info-label">Total Amount paid</span>
                    <div style={{ fontWeight: 600, color: 'var(--primary-blue)', marginTop: '4px' }}>₹{searchedBooking.totalPrice.toLocaleString('en-IN')}</div>
                  </div>
                  <div>
                    <span className="info-label">Seat Assigned</span>
                    <div style={{ fontWeight: 600, marginTop: '4px' }}>{searchedBooking.seatNumber || 'Not assigned'}</div>
                  </div>
                </div>

                {searchedBooking.status !== 'CANCELLED' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '16px', marginTop: '24px' }}>
                    <button
                      className="btn-cancel"
                      onClick={() => handleRefund(searchedBooking)}
                      disabled={loading}
                    >
                      Process System Refund
                    </button>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      )}

      {/* GenAI RAG Ingest Tab */}
      {activeTab === 'GenAI RAG Ingest' && (
        <div className="sidebar-card" style={{ padding: '24px', maxWidth: '800px' }}>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <Sparkles size={20} style={{ color: 'var(--primary-blue)' }} />
            <h3 style={{ fontSize: '1.1rem' }}>Ingest Policy Document into RAG Database</h3>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: '1.5', marginBottom: '24px' }}>
            Add travel policy guidelines, student discount definitions, or baggage rules into the vector database. The AeroConcierge bot immediately references these embedded documents.
          </p>

          <form onSubmit={handleIngestDocument} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="search-field">
              <label className="form-label">Document Title</label>
              <input
                type="text"
                placeholder="e.g. Baggage Rules Summer 2026"
                className="form-input"
                value={ingestTitle}
                onChange={(e) => setIngestTitle(e.target.value)}
                required
              />
            </div>

            <div className="search-field">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={ingestCategory}
                onChange={(e) => setIngestCategory(e.target.value)}
              >
                <option value="BAGGAGE">Baggage Allowance</option>
                <option value="CANCELLATION">Cancellation Fees</option>
                <option value="DISCOUNT">Student / Senior Citizen Discount</option>
                <option value="WAITLIST">Waitlist &amp; Refund Statuses</option>
              </select>
            </div>

            <div className="search-field">
              <label className="form-label">Content (Markdown or Plain Text)</label>
              <textarea
                placeholder="Input details here..."
                className="form-input"
                rows={10}
                style={{ fontFamily: 'var(--font-inter)', fontSize: '0.9rem', resize: 'vertical' }}
                value={ingestContent}
                onChange={(e) => setIngestContent(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ alignSelf: 'flex-start' }}
            >
              Embed &amp; Ingest Document
            </button>
          </form>

        </div>
      )}

    </div>
  );
}
