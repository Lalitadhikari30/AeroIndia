import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Search, ChevronDown, Check } from 'lucide-react';

export default function AirportSelect({ label, value, onChange, airports = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef(null);

  // Find currently selected airport object
  const selectedAirport = airports.find(
    (a) => (a.iataCode || a.code) === value
  ) || { city: value || 'Select City', iataCode: value || '', code: value || '' };

  // Filter airports based on search query (city, state, code, name)
  const filteredAirports = airports.filter((a) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const city = (a.city || '').toLowerCase();
    const code = (a.iataCode || a.code || '').toLowerCase();
    const state = (a.state || '').toLowerCase();
    const name = (a.name || '').toLowerCase();
    return city.includes(q) || code.includes(q) || state.includes(q) || name.includes(q);
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (airportCode) => {
    onChange(airportCode);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="search-field" ref={containerRef} style={{ position: 'relative', zIndex: isOpen ? 1000 : 1 }}>
      <label className="form-label">{label}</label>
      <div
        className="form-select custom-select-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justify: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          paddingRight: '36px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
          <MapPin size={18} style={{ color: 'var(--primary-blue, #0052cc)', shrink: 0 }} />
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: 500 }}>
            {selectedAirport.city} ({selectedAirport.iataCode || selectedAirport.code})
          </span>
        </div>
        <ChevronDown size={16} style={{ color: '#6b7280', transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>

      {/* Downward Dropdown Menu Panel */}
      {isOpen && (
        <div
          className="airport-dropdown-menu animate-fade-in"
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '6px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.18), 0 2px 6px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e5e7eb',
            zIndex: 9999,
            overflow: 'hidden',
            minWidth: '280px'
          }}
        >
          {/* Search Input Header */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f3f4f6', backgroundColor: '#f9fafb' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={16} style={{ position: 'absolute', left: '10px', color: '#9ca3af' }} />
              <input
                type="text"
                autoFocus
                placeholder="Search city, state, or airport..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px 8px 34px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  fontSize: '0.85rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Scrollable Airport List */}
          <div style={{ maxHeight: '250px', overflowY: 'auto', padding: '4px 0' }}>
            {filteredAirports.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem' }}>
                No state or city found
              </div>
            ) : (
              filteredAirports.map((ap) => {
                const code = ap.iataCode || ap.code;
                const isSelected = code === value;
                return (
                  <div
                    key={ap.id || code}
                    onClick={() => handleSelect(code)}
                    style={{
                      padding: '10px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      cursor: 'pointer',
                      backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                      borderLeft: isSelected ? '3px solid #0052cc' : '3px solid transparent',
                      transition: 'background-color 0.15s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = '#f3f4f6';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? '#0052cc' : '#1f2937' }}>
                        {ap.city} <span style={{ color: '#6b7280', fontWeight: 600 }}>({code})</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '2px' }}>
                        {ap.name}
                      </div>
                    </div>
                    {isSelected && <Check size={16} style={{ color: '#0052cc' }} />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
