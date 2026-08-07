import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SeatSelectionPage({ selectedFlight, setSelectedSeat }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [seatData, setSeatData] = useState(null);
  const [chosenSeat, setChosenSeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fallback flight details
  const flight = selectedFlight || {
    id: "ai-801",
    airline: "Air India",
    flightNumber: "AI-801",
    departureAirport: "DEL",
    arrivalAirport: "BOM",
    price: 6800
  };

  // Poll for seat changes (Redis locks, check-ins)
  useEffect(() => {
    const fetchSeatMap = async (showLoader = false) => {
      if (showLoader) setLoading(true);
      try {
        const res = await api.get(`/api/flights/${flight.id}/seats`);
        setSeatData(res);
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to load live seat map. Connecting simulation...');
      } finally {
        if (showLoader) setLoading(false);
      }
    };

    fetchSeatMap(true);
    
    // TODO: consider websockets improvement for real-time seat lock state
    const timer = setInterval(() => {
      fetchSeatMap(false);
    }, 5000);

    return () => clearInterval(timer);
  }, [flight.id]);

  const handleSeatClick = (seat) => {
    if (!seat.available) return; // Occupied

    if (chosenSeat && chosenSeat.seatNumber === seat.seatNumber) {
      setChosenSeat(null);
    } else {
      setChosenSeat(seat);
    }
  };

  const handleConfirm = () => {
    if (!chosenSeat) return;
    
    setSelectedSeat({
      code: chosenSeat.seatNumber,
      price: parseFloat(chosenSeat.price || 0),
      category: chosenSeat.seatClass || 'Standard Seat'
    });

    if (user?.email) {
      const pendingData = {
        passengerName: `${user?.firstName || 'Passenger'} ${user?.lastName || ''}`.trim(),
        passengerEmail: user.email,
        pnr: 'AI-PENDING-' + Math.floor(1000 + Math.random() * 9000),
        flightRoute: `${flight.departureAirport || 'DEL'} to ${flight.arrivalAirport || 'BOM'} (Seat ${chosenSeat.seatNumber})`,
        amount: (flight.price || 6800) + parseFloat(chosenSeat.price || 0)
      };
      sessionStorage.setItem('pendingBooking', JSON.stringify(pendingData));
    }

    navigate('/review');
  };

  if (loading && !seatData) {
    return (
      <div className="centered-loading-page animate-fade-in">
        <div>
          <div className="loading-badge">
            <Loader2 className="spin" size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Fetching Seat Map...</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Connecting to AeroIndia flight systems
          </p>
        </div>
      </div>
    );
  }

  // Group seats by row
  const seatsList = seatData?.seatMap?.seats || [];
  const rowsMap = {};
  seatsList.forEach(seat => {
    if (!rowsMap[seat.row]) {
      rowsMap[seat.row] = [];
    }
    rowsMap[seat.row].push(seat);
  });

  // Sort columns in each row (A, B, C, D, E, F)
  Object.keys(rowsMap).forEach(rowNum => {
    rowsMap[rowNum].sort((a, b) => a.column.localeCompare(b.column));
  });

  // On hold simulated visual flair seats
  const simulatedOnHold = ['1C', '5B', '8E'];

  const baseFare = flight.price;
  const seatFee = chosenSeat ? parseFloat(chosenSeat.price || 0) : 0;
  const grandTotal = baseFare + seatFee;

  return (
    <div className="seat-map-wrapper animate-fade-in">
      <div className="review-card-header" style={{ borderBottom: 'none', marginBottom: '8px' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem' }}>Select Your Seat</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            {flight.airline} &bull; {flight.flightNumber} &bull; {flight.departureAirport} to {flight.arrivalAirport}
          </p>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 'var(--radius-md)', color: 'var(--danger-red)', fontSize: '0.85rem', marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="seat-grid-container">
        {/* Fuselage wrapper */}
        <div className="fuselage-wrapper">
          <div className="fuselage-nose">COCKPIT</div>

          {/* Legend */}
          <div className="seat-legend-row">
            <div className="legend-swatch">
              <div className="swatch-box available"></div>
              <span>Available</span>
            </div>
            <div className="legend-swatch">
              <div className="swatch-box selected"></div>
              <span>Selected</span>
            </div>
            <div className="legend-swatch">
              <div className="swatch-box occupied"></div>
              <span>Occupied</span>
            </div>
            <div className="legend-swatch">
              <div className="swatch-box onhold"></div>
              <span>On Hold</span>
            </div>
          </div>

          {/* Dynamic Seat Grid */}
          <div className="seat-layout-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.keys(rowsMap).map(rowNum => {
              const rowSeats = rowsMap[rowNum];
              const isBusiness = parseInt(rowNum) <= 3;
              
              return (
                <div key={rowNum} className="plane-row">
                  <div className="row-num-indicator">{rowNum}</div>
                  
                  {rowSeats.map((seat, idx) => {
                    const isOccupied = !seat.available;
                    const isOnHold = simulatedOnHold.includes(seat.seatNumber);
                    const isSelected = chosenSeat && chosenSeat.seatNumber === seat.seatNumber;
                    
                    // Business aisle space divider (4 seats: A, B, [aisle], C, D)
                    // Economy aisle space divider (6 seats: A, B, C, [aisle], D, E, F)
                    const showAisle = isBusiness ? idx === 2 : idx === 3;

                    return (
                      <React.Fragment key={seat.seatNumber}>
                        {showAisle && <div className="aisle-space" />}
                        <button
                          type="button"
                          disabled={isOccupied}
                          onClick={() => handleSeatClick(seat)}
                          className={`plane-seat ${isBusiness ? 'business' : ''} ${
                            isSelected ? 'selected' : 
                            isOccupied ? (isOnHold ? 'onhold' : 'occupied') : ''
                          }`}
                          title={`${seat.seatNumber} - ${seat.seatClass} (+₹${parseFloat(seat.price).toLocaleString('en-IN')})`}
                        >
                          {seat.seatNumber}
                        </button>
                      </React.Fragment>
                    );
                  })}

                  <div className="row-num-indicator">{rowNum}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Costing & Proceed */}
        <div className="summary-sidebar-box">
          <h3 style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '12px', marginBottom: '16px', fontSize: '1.1rem' }}>
            Seat Selection Fee
          </h3>

          {chosenSeat ? (
            <div className="route-timeline-box" style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--primary-blue)', fontWeight: 700 }}>
                Selected Seat
              </div>
              <div style={{ fontFamily: 'var(--font-sora)', fontSize: '2rem', fontWeight: 800, margin: '4px 0' }}>
                {chosenSeat.seatNumber}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                {chosenSeat.seatClass} Seat
              </div>
            </div>
          ) : (
            <div className="route-timeline-box" style={{ display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', marginBottom: '20px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>Please choose a seat from the cabin layout.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Flight Base Fare:</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>₹{baseFare.toLocaleString('en-IN')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Seat Selection Fee:</span>
              <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>
                {seatFee === 0 ? 'FREE' : `+₹${seatFee.toLocaleString('en-IN')}`}
              </span>
            </div>
            
            <div style={{ borderTop: '1px solid var(--border-light)', margin: '12px 0 6px', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)' }}>Total:</span>
              <span style={{ fontFamily: 'var(--font-sora)', fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-blue)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={!chosenSeat}
            onClick={handleConfirm}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', marginTop: '20px' }}
          >
            Confirm &amp; Proceed
          </button>
        </div>
      </div>
    </div>
  );
}
