import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Plane, Users, Clipboard, Award, ShieldAlert, CheckCircle } from 'lucide-react';

export default function StaffDashboard() {
  const [activeTab, setActiveTab] = useState('Overview'); // 'Overview', 'Manifest', 'Waitlist'
  
  // Data States
  const [flights, setFlights] = useState([]);
  const [selectedFlightId, setSelectedFlightId] = useState('');
  const [manifestPassengers, setManifestPassengers] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  
  // Statistics States
  const [stats, setStats] = useState({
    todayFlights: 0,
    totalBookings: 0,
    waitlistCount: 0,
    activeCheckIns: 0
  });

  const [error, setError] = useState('');
  
  // Fetch initial flights list
  useEffect(() => {
    async function loadInitialData() {
      setError('');
      try {
        const flightsList = await api.get('/api/flights/');
        setFlights(flightsList || []);
        
        if (flightsList && flightsList.length > 0) {
          setSelectedFlightId(flightsList[0].id);
        }
      } catch {
        setError('Failed to load flights. Please try again.');
      }
    }
    loadInitialData();
  }, []);

  // Fetch manifest when flight changes
  useEffect(() => {
    if (!selectedFlightId) return;

    async function loadManifest() {
      setError('');
      try {
        const data = await api.get(`/api/bookings/flight/${selectedFlightId}`);
        const manifest = (data || []).map(b => {
          const addonStr = (b.addOns || []).map(a => a.type).join(', ') || 'None';
          return {
            id: b.id,
            name: b.passengerName,
            pnr: b.pnr,
            seat: b.seatNumber || 'Not Assigned',
            addOns: addonStr,
            checkedIn: b.status === 'CONFIRMED'
          };
        });
        setManifestPassengers(manifest);
      } catch {
        setError('Failed to fetch manifest.');
      }
    }

    loadManifest();
  }, [selectedFlightId]);

  // Fetch waitlist when flight changes
  useEffect(() => {
    if (!selectedFlightId) return;

    async function loadWaitlist() {
      setError('');
      try {
        const waitlist = await api.get(`/api/bookings/waitlist/${selectedFlightId}`);
        setWaitlistEntries(waitlist || []);
      } catch {
        setWaitlistEntries([]);
      }
    }

    loadWaitlist();
  }, [selectedFlightId]);

  // Update dynamic stats
  useEffect(() => {
    setStats({
      todayFlights: flights.length,
      totalBookings: manifestPassengers.length,
      waitlistCount: waitlistEntries.length,
      activeCheckIns: manifestPassengers.filter(p => p.checkedIn).length
    });
  }, [flights, manifestPassengers, waitlistEntries]);


  // Check-in passenger action
  const handleCheckIn = (passengerId) => {
    // // TODO: backend endpoint needed for passenger checkin (e.g., PUT /api/bookings/{id}/checkin)
    // For now we will update check-in status locally to provide instant visual feedback.
    setManifestPassengers(prev =>
      prev.map(p => p.id === passengerId ? { ...p, checkedIn: true } : p)
    );
    setStats(prev => ({ ...prev, activeCheckIns: prev.activeCheckIns + 1 }));
    alert('Passenger checked in successfully!');
  };

  // Waitlist promotion action
  const handlePromote = (entry) => {
    // // TODO: backend endpoint needed for manual waitlist promotion (e.g., POST /api/bookings/waitlist/{id}/promote)
    // In our backend, Kafka handles waitlist promotion, so we can stub this action client-side.
    alert(`Promotion request for ${entry.passengerName || 'passenger'} submitted. Processing ticket generation...`);
    setWaitlistEntries(prev => prev.filter(e => e.id !== entry.id));
    setStats(prev => ({ ...prev, waitlistCount: Math.max(0, prev.waitlistCount - 1) }));
  };

  return (
    <div className="container-xl animate-fade-in" style={{ paddingTop: '32px' }}>
      
      {/* Header operations banner */}
      <div className="my-bookings-header-band" style={{ borderRadius: 'var(--radius-lg)', padding: '24px 32px', marginBottom: '32px', background: 'var(--primary-navy)' }}>
        <h1 style={{ color: 'var(--bg-white)', fontSize: '1.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🛠</span> Staff Operations Console
        </h1>
        <p style={{ color: 'var(--text-light)', fontSize: '0.85rem', marginTop: '4px' }}>
          Manage real-time manifests, check-in travelers, and control flight waitlists.
        </p>
      </div>

      {/* Tabs list */}
      <div className="search-tabs" style={{ marginBottom: '24px' }}>
        {['Overview', 'Manifest', 'Waitlist'].map((tab) => (
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

      {error && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '24px' }}>
          <ShieldAlert size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* TABS CONTENT */}
      {activeTab === 'Overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Small stat card cards */}
          <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            
            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--primary-blue)', backgroundColor: '#eff6ff' }}>
                <Plane size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TODAY'S FLIGHTS</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.todayFlights}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: '#0369a1', backgroundColor: '#e0f2fe' }}>
                <Users size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>BOOKINGS TODAY</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.totalBookings}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--warning-amber)', backgroundColor: 'var(--warning-bg)' }}>
                <Clipboard size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>WAITLIST COUNT</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.waitlistCount}
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-badge" style={{ color: 'var(--success-green)', backgroundColor: 'var(--success-bg)' }}>
                <Award size={20} />
              </div>
              <h3 className="feature-title" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ACTIVE CHECK-INS</h3>
              <p style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, color: 'var(--primary-navy-dark)', marginTop: '8px' }}>
                {stats.activeCheckIns}
              </p>
            </div>

          </div>

          {/* Today's flight list */}
          <div className="sidebar-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '16px' }}>Scheduled Departures</h3>
            {flights.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Flight No.</th>
                      <th style={{ padding: '12px' }}>Airline</th>
                      <th style={{ padding: '12px' }}>Route</th>
                      <th style={{ padding: '12px' }}>Time</th>
                      <th style={{ padding: '12px' }}>Seats Available</th>
                      <th style={{ padding: '12px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--primary-blue)' }}>{f.flightNumber}</td>
                        <td style={{ padding: '12px' }}>{f.airline}</td>
                        <td style={{ padding: '12px' }}>{f.departureAirport} &rarr; {f.arrivalAirport}</td>
                        <td style={{ padding: '12px' }}>{new Date(f.departureTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</td>
                        <td style={{ padding: '12px' }}>{f.availableSeats}</td>
                        <td style={{ padding: '12px' }}><span className="badge-success">ON TIME</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No active departures registered for today.
              </div>
            )}
          </div>

        </div>
      )}

      {activeTab === 'Manifest' && (
        <div className="sidebar-card" style={{ padding: '24px' }}>
          
          {/* Flight dropdown selector */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Select Flight Manifest:</label>
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={selectedFlightId}
              onChange={(e) => setSelectedFlightId(e.target.value)}
            >
              {flights.map(f => (
                <option key={f.id} value={f.id}>{f.flightNumber} ({f.departureAirport} to {f.arrivalAirport})</option>
              ))}
            </select>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {/* TODO: backend endpoint needed for GET /api/bookings/flight/{flightId} manifest */}
              * Manifest displays simulator passengers (endpoint pending in booking microservice)
            </span>
          </div>

          {/* Passengers Manifest Table */}
          {manifestPassengers.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Passenger Name</th>
                    <th style={{ padding: '12px' }}>PNR</th>
                    <th style={{ padding: '12px' }}>Seat No.</th>
                    <th style={{ padding: '12px' }}>Add-ons</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {manifestPassengers.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '12px', color: 'var(--primary-blue)', fontWeight: 600 }}>{p.pnr}</td>
                      <td style={{ padding: '12px' }}>{p.seat}</td>
                      <td style={{ padding: '12px' }}>{p.addOns}</td>
                      <td style={{ padding: '12px' }}>
                        <span className={p.checkedIn ? 'badge-success' : 'badge-warning'}>
                          {p.checkedIn ? 'CHECKED IN' : 'BOARDING PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {!p.checkedIn ? (
                          <button
                            className="btn-primary"
                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                            onClick={() => handleCheckIn(p.id)}
                          >
                            Check In
                          </button>
                        ) : (
                          <span style={{ color: 'var(--success-green)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
                            <CheckCircle size={14} /> Checked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              No passengers booked for this departure yet.
            </div>
          )}

        </div>
      )}

      {activeTab === 'Waitlist' && (
        <div className="sidebar-card" style={{ padding: '24px' }}>
          
          {/* Flight dropdown selector */}
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
            <label className="form-label" style={{ marginBottom: 0 }}>Select Flight Waitlist:</label>
            <select
              className="form-select"
              style={{ width: '220px' }}
              value={selectedFlightId}
              onChange={(e) => setSelectedFlightId(e.target.value)}
            >
              {flights.map(f => (
                <option key={f.id} value={f.id}>{f.flightNumber} ({f.departureAirport} to {f.arrivalAirport})</option>
              ))}
            </select>
          </div>

          {/* Waitlist table */}
          {waitlistEntries.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-light)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px' }}>Queue Pos.</th>
                    <th style={{ padding: '12px' }}>Passenger ID</th>
                    <th style={{ padding: '12px' }}>Preferred Seat Class</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {waitlistEntries.map(w => (
                    <tr key={w.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '12px', fontWeight: 700 }}>#{w.queuePosition}</td>
                      <td style={{ padding: '12px', color: 'var(--text-muted)' }}>{w.passengerId}</td>
                      <td style={{ padding: '12px' }}>{w.preferredSeatClass}</td>
                      <td style={{ padding: '12px' }}>
                        <span className="badge-warning">WAITING</span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        <button
                          className="btn-primary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', backgroundColor: '#0284c7' }}
                          onClick={() => handlePromote(w)}
                        >
                          Promote (Kafka)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
              No waitlisted passengers for this flight.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
