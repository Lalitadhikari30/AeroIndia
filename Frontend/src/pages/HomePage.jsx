import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Users, Briefcase, ArrowRightLeft, Shield, ShieldCheck, Headphones, Bot, TrendingUp } from 'lucide-react';
import { api } from '../api/client';
import { TRENDING_ROUTES } from '../data/mockData';

export default function HomePage({ searchParams, setSearchParams }) {
  const navigate = useNavigate();
  const [airports, setAirports] = useState([
    { id: '1', iataCode: 'DEL', city: 'Delhi', name: 'Indira Gandhi Intl' },
    { id: '2', iataCode: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji' },
    { id: '3', iataCode: 'BLR', city: 'Bangalore', name: 'Kempegowda Intl' },
    { id: '4', iataCode: 'GOI', city: 'Goa', name: 'Dabolim Airport' }
  ]);
  const [localFrom, setLocalFrom] = useState(searchParams.fromCode || 'DEL');
  const [localTo, setLocalTo] = useState(searchParams.toCode || 'BOM');
  const [localDate, setLocalDate] = useState(searchParams.departureDate || '2026-07-31');
  const [localTravelers, setLocalTravelers] = useState(searchParams.travelers || '1 Adult');
  const [localClass, setLocalClass] = useState(searchParams.cabinClass || 'Economy');
  const [localDirect, setLocalDirect] = useState(searchParams.directOnly || false);

  // Fetch airports on mount
  useEffect(() => {
    async function fetchAirports() {
      try {
        const list = await api.get('/api/flights/airports');
        if (list && list.length > 0) {
          setAirports(list);
        }
      } catch (err) {
        // Fallback already set, log warning
        console.warn('Failed to load airports from API, using default list.', err);
      }
    }
    fetchAirports();
  }, []);

  const handleSwap = () => {
    const temp = localFrom;
    setLocalFrom(localTo);
    setLocalTo(temp);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const fromAirport = airports.find(a => a.iataCode === localFrom) || { city: 'Delhi', iataCode: 'DEL' };
    const toAirport = airports.find(a => a.iataCode === localTo) || { city: 'Mumbai', iataCode: 'BOM' };

    setSearchParams({
      fromCity: fromAirport.city,
      fromCode: fromAirport.iataCode,
      toCity: toAirport.city,
      toCode: toAirport.iataCode,
      departureDate: localDate,
      travelers: localTravelers,
      cabinClass: localClass,
      directOnly: localDirect
    });
    navigate('/search');
  };

  // Helper for route booking click
  const handleTrendingBook = (route) => {
    const fromAirport = airports.find(a => a.city.toLowerCase() === route.from.toLowerCase() || a.iataCode === (route.from === 'New Delhi' ? 'DEL' : 'BLR')) || { city: 'Delhi', iataCode: 'DEL' };
    const toAirport = airports.find(a => a.city.toLowerCase() === route.to.toLowerCase()) || { city: 'Mumbai', iataCode: 'BOM' };

    setSearchParams({
      fromCity: fromAirport.city,
      fromCode: fromAirport.iataCode,
      toCity: toAirport.city,
      toCode: toAirport.iataCode,
      departureDate: '2026-07-31',
      travelers: '1 Adult',
      cabinClass: 'Economy',
      directOnly: true
    });
    navigate('/search');
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container-xl">
          <h1 className="hero-title">
            <span className="navy">Fly with </span>
            <span className="navy" style={{ fontWeight: 800 }}>Aero</span>
            <span className="blue" style={{ fontWeight: 800 }}>इंडिया</span>
          </h1>
          <p className="hero-subtitle">
            Experience the spirit of India in the skies. Seamlessly book domestic and international flights with the nation's preferred carrier.
          </p>
        </div>

        {/* Search Card - inside hero so background image is visible beside it */}
        <div className="search-card-wrapper" style={{ marginTop: '0' }}>
        <form onSubmit={handleSearch} className="search-card">
          {/* Tabs */}
          <div className="search-tabs">
            <button type="button" className="tab-pill active">One Way</button>
            <button type="button" className="tab-pill">Round Trip</button>
            <button type="button" className="tab-pill">Multi-City</button>
          </div>

          {/* Row 1 */}
          <div className="search-row-1">
            {/* FROM */}
            <div className="search-field">
              <label className="form-label">From</label>
              <div className="field-icon-wrapper">
                <MapPin size={18} />
              </div>
              <select
                className="form-select"
                value={localFrom}
                onChange={(e) => setLocalFrom(e.target.value)}
              >
                {airports.map((airport) => (
                  <option key={airport.id || airport.iataCode} value={airport.iataCode}>
                    {airport.city} ({airport.iataCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <div className="swap-btn-container">
              <button
                type="button"
                className="swap-button"
                onClick={handleSwap}
                title="Swap origin and destination"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* TO */}
            <div className="search-field">
              <label className="form-label">To</label>
              <div className="field-icon-wrapper">
                <MapPin size={18} />
              </div>
              <select
                className="form-select"
                value={localTo}
                onChange={(e) => setLocalTo(e.target.value)}
              >
                {airports.map((airport) => (
                  <option key={airport.id || airport.iataCode} value={airport.iataCode}>
                    {airport.city} ({airport.iataCode})
                  </option>
                ))}
              </select>
            </div>

            {/* DEPARTURE */}
            <div className="search-field">
              <label className="form-label">Departure</label>
              <div className="field-icon-wrapper">
                <Calendar size={18} />
              </div>
              <input
                type="date"
                className="form-input"
                value={localDate}
                onChange={(e) => setLocalDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="search-row-2">
            {/* TRAVELERS */}
            <div className="search-field">
              <label className="form-label">Travelers</label>
              <div className="field-icon-wrapper">
                <Users size={18} />
              </div>
              <select
                className="form-select"
                value={localTravelers}
                onChange={(e) => setLocalTravelers(e.target.value)}
              >
                <option value="1 Adult">1 Adult</option>
                <option value="2 Adults">2 Adults</option>
                <option value="3 Adults">3 Adults</option>
              </select>
            </div>

            {/* CLASS */}
            <div className="search-field">
              <label className="form-label">Class</label>
              <div className="field-icon-wrapper">
                <Briefcase size={18} />
              </div>
              <select
                className="form-select"
                value={localClass}
                onChange={(e) => setLocalClass(e.target.value)}
              >
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
              </select>
            </div>

            {/* Direct Flights Only */}
            <div className="direct-flights-checkbox">
              <input
                type="checkbox"
                id="directOnly"
                checked={localDirect}
                onChange={(e) => setLocalDirect(e.target.checked)}
              />
              <label htmlFor="directOnly">Direct Flights Only</label>
            </div>

            {/* Search Flights Button */}
            <button type="submit" className="btn-primary" style={{ padding: '12px 28px' }}>
              <span>🔍</span> Search Flights
            </button>
          </div>
        </form>
        </div>
      </section>

      {/* Trending Routes Section */}
      <section className="trending-section">
        <div className="container-xl">
          <div className="section-header">
            <div>
              <span className="badge-info" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '8px' }}>
                <TrendingUp size={14} /> POPULAR IN INDIA
              </span>
              <h2>Trending Routes for You</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                Discover the most booked destinations across the subcontinent this month.
              </p>
            </div>
            <button className="btn-outline">View All Routes</button>
          </div>

          <div className="trending-route-grid">
            {TRENDING_ROUTES.map((route) => (
              <div key={route.id} className="route-card hover-lift">
                <div
                  className="route-image-container"
                  style={{ backgroundImage: `url(${route.image})` }}
                >
                  <button
                    className="route-book-btn"
                    onClick={() => handleTrendingBook(route)}
                  >
                    Book Now
                  </button>
                  <div className="route-image-overlay">
                    <span className="route-price-label">STARTING FROM</span>
                    <span className="route-price-value">₹{route.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="route-details">
                  <div className="route-cities">{route.from} &rarr; {route.to}</div>
                  <div className="route-meta">
                    <span>✈</span> {route.stops} &bull; {route.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* "Why Book with Aeroइंडिया?" Section */}
      <section className="why-book-section">
        <div className="container-xl why-book-grid">
          {/* Left info column */}
          <div className="why-book-left">
            <h2 className="why-book-title">Why Book with Aeroइंडिया?</h2>
            <p className="why-book-text">
              We are committed to providing a world-class travel experience that celebrates Indian hospitality and operational excellence.
            </p>
            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-number">50M+</span>
                <span className="stat-label">Happy Travelers</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">120+</span>
                <span className="stat-label">Destinations</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">99%</span>
                <span className="stat-label">On-time Performance</span>
              </div>
            </div>
          </div>

          {/* Right feature grid */}
          <div className="features-grid">
            {/* SECURE PAYMENTS */}
            <div className="feature-card">
              <div className="feature-icon-badge">
                <Shield size={20} />
              </div>
              <h3 className="feature-title">SECURE PAYMENTS</h3>
              <p className="feature-desc">
                All transactions are protected by bank-grade 256-bit SSL encryption for your peace of mind.
              </p>
            </div>

            {/* BEST PRICE GUARANTEE */}
            <div className="feature-card">
              <div className="feature-icon-badge">
                <ShieldCheck size={20} />
              </div>
              <h3 className="feature-title">BEST PRICE GUARANTEE</h3>
              <p className="feature-desc">
                Find a cheaper flight elsewhere within 24 hours and we'll refund the difference.
              </p>
            </div>

            {/* 24/7 PRIORITY SUPPORT */}
            <div className="feature-card">
              <div className="feature-icon-badge">
                <Headphones size={20} />
              </div>
              <h3 className="feature-title">24/7 PRIORITY SUPPORT</h3>
              <p className="feature-desc">
                Our dedicated concierge team is available round-the-clock to assist with your booking needs.
              </p>
            </div>

            {/* AI-POWERED CONCIERGE */}
            <div className="feature-card">
              <div className="feature-icon-badge">
                <Bot size={20} />
              </div>
              <h3 className="feature-title">AI-POWERED CONCIERGE</h3>
              <p className="feature-desc">
                Ask our intelligent assistant to find the best routes or handle complex flight policy queries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter / App Promo Section */}
      <section className="newsletter-section">
        <div className="container-xl">
          <div className="newsletter-card">
            {/* Left newsletter */}
            <div className="newsletter-left">
              <h2>Never miss a flight deal again.</h2>
              <p>
                Subscribe to our newsletter and be the first to know about seasonal offers, new route launches, and exclusive member discounts.
              </p>
              <div className="newsletter-form">
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Enter your email address"
                />
                <button className="btn-subscribe">Subscribe</button>
              </div>
            </div>

            {/* Right app promo */}
            <div className="promo-app-card">
              <h3 className="promo-app-title">AEROइंडिया MOBILE &mdash; Coming Soon to iOS &amp; Android</h3>
              <div className="qr-code-placeholder"></div>
              <p className="promo-app-caption">
                Scan to pre-register for early access &amp; ₹500 off your first booking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
