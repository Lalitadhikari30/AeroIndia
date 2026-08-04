import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftRight, Star, ShieldAlert, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export default function SearchResultsPage({ searchParams, setSelectedFlight }) {
  const navigate = useNavigate();

  // Search results data
  const [flights, setFlights] = useState([]);
  const [connectingFlights, setConnectingFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter States
  const [nonStopChecked, setNonStopChecked] = useState(true);
  const [oneStopChecked, setOneStopChecked] = useState(true);
  const [maxPrice, setMaxPrice] = useState(12000);

  // Parse travelers count
  const passengerCount = parseInt(searchParams.travelers) || 1;

  const fetchSearchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const from = searchParams.fromCode || 'DEL';
      const to = searchParams.toCode || 'BOM';
      const date = searchParams.departureDate || '2026-07-31';
      
      const res = await api.get(
        `/api/flights/search?from=${from}&to=${to}&date=${date}&passengers=${passengerCount}`
      );
      
      // Direct Flights
      const direct = (res.flights || []).map(f => ({
        ...f,
        stops: 'NON-STOP',
        price: parseFloat(f.currentPrice || 6000),
        departureTimeFormatted: formatIsoTime(f.departureTime),
        arrivalTimeFormatted: formatIsoTime(f.arrivalTime),
        classLabel: f.seatClasses && f.seatClasses.length > 0 ? f.seatClasses[0] : 'Economy'
      }));

      // Connecting Flights
      const connecting = (res.connecting || []).map(c => ({
        id: c.id || `conn-${c.firstFlightNumber}-${c.secondFlightNumber}`,
        flightNumber: `${c.firstFlightNumber} ➔ ${c.secondFlightNumber}`,
        airline: c.firstAirline || 'AeroIndia',
        departureAirport: c.departureAirport,
        arrivalAirport: c.arrivalAirport,
        departureTime: c.departureTime,
        arrivalTime: c.arrivalTime,
        duration: c.totalDuration || '5H 20M',
        stops: '1 STOP',
        price: parseFloat(c.totalPrice || 8500),
        departureTimeFormatted: formatIsoTime(c.departureTime),
        arrivalTimeFormatted: formatIsoTime(c.arrivalTime),
        classLabel: 'Economy Flex'
      }));

      setFlights(direct);
      setConnectingFlights(connecting);

      // Dynamically adjust price filter max value
      const allPrices = [...direct, ...connecting].map(f => f.price);
      if (allPrices.length > 0) {
        setMaxPrice(Math.max(...allPrices) + 1000);
      }
    } catch (err) {
      setError(err.message || 'We could not fetch search results. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // ISO Time Formatter Helper (e.g. "2026-07-31T08:30:00" -> "08:30")
  const formatIsoTime = (isoString) => {
    if (!isoString) return '00:00';
    try {
      const parts = isoString.split('T');
      if (parts.length > 1) {
        const timePart = parts[1];
        const timeSub = timePart.split(':');
        return `${timeSub[0]}:${timeSub[1]}`;
      }
    } catch {
      // ignore
    }
    return '00:00';
  };

  // Clear filters function
  const handleClearAll = () => {
    setNonStopChecked(true);
    setOneStopChecked(true);
    setMaxPrice(15000);
  };

  // Perform filtering of aggregated list
  const filteredFlights = useMemo(() => {
    const combined = [...flights, ...connectingFlights];
    return combined.filter((flight) => {
      // Filter by price
      if (flight.price > maxPrice) return false;

      // Filter by stops
      const isNonStop = flight.stops === 'NON-STOP';
      if (nonStopChecked && !oneStopChecked) {
        return isNonStop;
      }
      if (!nonStopChecked && oneStopChecked) {
        return !isNonStop;
      }
      if (!nonStopChecked && !oneStopChecked) {
        return false;
      }
      return true;
    });
  }, [flights, connectingFlights, nonStopChecked, oneStopChecked, maxPrice]);

  const handleSelectFlight = (flight) => {
    // Save normalized selection
    setSelectedFlight({
      ...flight,
      // Map back fields to match expectations of later pages
      price: flight.price,
      departureTime: flight.departureTimeFormatted,
      arrivalTime: flight.arrivalTimeFormatted
    });
    navigate('/seats');
  };

  // If loading, show centered spinner
  if (loading) {
    return (
      <div className="centered-loading-page animate-fade-in">
        <div>
          <div className="loading-badge">
            <Loader2 className="spin" size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Searching Flights...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Querying live ticket inventory for {searchParams.fromCode} to {searchParams.toCode}
          </p>
        </div>
      </div>
    );
  }

  // If error, show warning box with a retry action
  if (error) {
    return (
      <div className="container-xl animate-fade-in" style={{ padding: '80px 24px', display: 'flex', justifyContent: 'center' }}>
        <div className="sidebar-card" style={{ maxWidth: '500px', textAlign: 'center', padding: '40px 32px' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', backgroundColor: '#fef2f2', color: 'var(--danger-red)', marginBottom: '16px' }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px' }}>Search Failed</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px', lineHeight: '1.6' }}>
            {error}
          </p>
          <button onClick={fetchSearchResults} className="btn-primary" style={{ justifyContent: 'center', width: '100%' }}>
            Retry Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-xl animate-fade-in">
      <div className="search-results-layout">
        
        {/* Left Sidebar Filters */}
        <aside className="sidebar-card">
          <div className="sidebar-title">
            <span>▽ Filters</span>
            <span className="clear-link" onClick={handleClearAll}>Clear All</span>
          </div>

          {/* Stops Filter */}
          <div className="filter-group">
            <h4>Stops</h4>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={nonStopChecked}
                onChange={(e) => setNonStopChecked(e.target.checked)}
              />
              <span>Non-stop</span>
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={oneStopChecked}
                onChange={(e) => setOneStopChecked(e.target.checked)}
              />
              <span>1 Stop</span>
            </label>
          </div>

          {/* Price Range Filter */}
          <div className="filter-group">
            <div className="price-range-label">
              <span>Price Range</span>
              <span>₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="2000"
              max="20000"
              step="500"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="slider-input"
            />
            <div className="price-range-label" style={{ color: 'var(--text-light)', fontSize: '0.75rem', marginTop: '4px' }}>
              <span>Min: ₹2,000</span>
              <span>Max: ₹20,000</span>
            </div>
          </div>
        </aside>

        {/* Center Flights Column */}
        <section>
          {/* Top route indicator bar */}
          <div className="results-header-bar">
            <span>From: {searchParams.fromCity} ({searchParams.fromCode})</span>
            <ArrowLeftRight size={16} style={{ color: 'var(--primary-blue)', margin: '0 8px' }} />
            <span>To: {searchParams.toCity} ({searchParams.toCode})</span>
          </div>

          {/* Vertical list of result rows */}
          <div className="results-list">
            {filteredFlights.length > 0 ? (
              filteredFlights.map((flight) => (
                <div key={flight.id} className="flight-result-card">
                  <div className="flight-main-row">
                    {/* Airline details */}
                    <div className="flight-airline-info">
                      <div className="airline-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 15 22 11 13 2 9z"/><path d="M22 2 11 13"/></svg>
                      </div>
                      <div>
                        <div className="airline-name">{flight.airline}</div>
                        <div className="airline-code">{flight.flightNumber} &bull; {flight.classLabel}</div>
                      </div>
                    </div>

                    {/* Flight departure, arrival, duration timeline */}
                    <div className="flight-timeline">
                      <div className="time-box">
                        <div className="time-value">{flight.departureTimeFormatted}</div>
                        <div className="airport-code">{flight.departureAirport}</div>
                      </div>
                      
                      <div className="timeline-stop">
                        <div className="stop-duration">{flight.duration}</div>
                        <div className="stop-line"></div>
                        <div className="stop-label">{flight.stops}</div>
                      </div>

                      <div className="time-box">
                        <div className="time-value">{flight.arrivalTimeFormatted}</div>
                        <div className="airport-code">{flight.arrivalAirport}</div>
                      </div>
                    </div>

                    {/* Price and select action */}
                    <div className="flight-price-action">
                      <div className="flight-price">₹{flight.price.toLocaleString('en-IN')}</div>
                      <button
                        className="btn-primary"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                        onClick={() => handleSelectFlight(flight)}
                      >
                        Choose
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="sidebar-card" style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
                <ShieldAlert size={36} style={{ color: 'var(--warning-amber)', marginBottom: '12px' }} />
                <h3>No flights match your filters.</h3>
                <p style={{ fontSize: '0.85rem', marginTop: '8px' }}>Please try raising your maximum price limit or checking other stop boxes.</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Sidebar Exclusive Lounge Access */}
        <aside className="exclusive-sidebar">
          <div className="exclusive-card">
            <div className="exclusive-header">
              <Star size={12} fill="currentColor" />
              <span>Exclusive</span>
            </div>
            <div className="exclusive-title">Lounge Access at IGI T3</div>
            <p style={{ color: '#166534', fontSize: '0.8rem', lineHeight: '1.4', marginTop: '6px' }}>
              Complimentary gourmet buffet, high-speed Wi-Fi, and premium shower suites for Aeroइंडिया flyers. Upgrade now for just ₹1,200.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
