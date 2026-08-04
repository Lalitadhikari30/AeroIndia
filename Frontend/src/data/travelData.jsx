import React from 'react';

export const AIRPORTS = [
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International Airport', country: 'India' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl', country: 'India' },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International Airport', country: 'India' },
  { code: 'MAA', city: 'Chennai', name: 'Chennai International Airport', country: 'India' },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhash Chandra Bose Intl', country: 'India' },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International Airport', country: 'India' },
  { code: 'GOI', city: 'Goa', name: 'Dabolim Airport', country: 'India' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
  { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'UK' }
];

// Vector SVG Airline Logos with EXPLICIT width & height to prevent SVG blowout
export const AIRLINE_LOGOS = {
  AI: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#D91B24" />
      <path d="M10 24L30 14L24 28L20 22L14 24L10 24Z" fill="#FFC72C" />
      <circle cx="27" cy="15" r="2" fill="#FFFFFF" />
    </svg>
  ),
  '6E': (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#002B66" />
      <text x="7" y="27" fill="#00A3E0" fontSize="18" fontWeight="bold" fontFamily="sans-serif">6E</text>
    </svg>
  ),
  UK: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#4A154B" />
      <path d="M20 8L23.5 16.5L32 20L23.5 23.5L20 32L16.5 23.5L8 20L16.5 16.5L20 8Z" fill="#E89923" />
    </svg>
  ),
  SG: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#E31837" />
      <path d="M12 28C12 28 16 12 28 12C28 12 22 24 12 28Z" fill="#FF6B00" />
      <circle cx="28" cy="12" r="3" fill="#FFFFFF" />
    </svg>
  ),
  QP: (
    <svg width="36" height="36" style={{ width: '36px', height: '36px', minWidth: '36px' }} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="8" fill="#FF5000" />
      <path d="M12 26C16 16 26 14 30 14C24 22 18 28 12 26Z" fill="#582C83" />
    </svg>
  )
};

export const AIRLINES = [
  { id: 'AI', name: 'Air India', code: 'AI' },
  { id: '6E', name: 'IndiGo', code: '6E' },
  { id: 'UK', name: 'Vistara', code: 'UK' },
  { id: 'SG', name: 'SpiceJet', code: 'SG' },
  { id: 'QP', name: 'Akasa Air', code: 'QP' }
];

export const PROMO_CODES = [
  { code: 'YATRA15', discountPercent: 15, maxDiscount: 1500, description: 'Flat 15% Instant Discount with HDFC & ICICI Cards' },
  { code: 'WELCOME500', discountAmount: 500, description: '₹500 OFF on your first flight booking' },
  { code: 'FESTIVE1000', discountAmount: 1000, description: 'Special Festive Offer for Round Trips' }
];

export const MOCK_FLIGHTS = [
  {
    id: 'FL-301',
    airline: 'Air India',
    airlineCode: 'AI',
    flightNumber: 'AI-502',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '06:00 AM',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '08:15 AM',
    duration: '2h 15m',
    stops: 'Non-stop',
    price: 4999,
    seatsAvailable: 12,
    badge: 'Cheapest',
    badgeType: 'green',
    amenities: ['Free Meal', 'In-Flight Wifi', 'Baggage 15kg']
  },
  {
    id: 'FL-302',
    airline: 'IndiGo',
    airlineCode: '6E',
    flightNumber: '6E-205',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '08:30 AM',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '10:40 AM',
    duration: '2h 10m',
    stops: 'Non-stop',
    price: 5240,
    seatsAvailable: 6,
    badge: 'Fastest',
    badgeType: 'blue',
    amenities: ['On-time Guarantee', 'Baggage 15kg']
  },
  {
    id: 'FL-303',
    airline: 'Vistara',
    airlineCode: 'UK',
    flightNumber: 'UK-943',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '11:15 AM',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '01:30 PM',
    duration: '2h 15m',
    stops: 'Non-stop',
    price: 6100,
    seatsAvailable: 18,
    badge: 'Premium Comfort',
    badgeType: 'gold',
    amenities: ['Gourmet Meal', 'Extra Legroom Available', 'Free Seat Selection']
  },
  {
    id: 'FL-304',
    airline: 'Akasa Air',
    airlineCode: 'QP',
    flightNumber: 'QP-1102',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '04:45 PM',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '07:05 PM',
    duration: '2h 20m',
    stops: 'Non-stop',
    price: 4450,
    seatsAvailable: 4,
    badge: 'Lowest Price',
    badgeType: 'green',
    amenities: ['Usb Charging', 'Café Akasa']
  },
  {
    id: 'FL-305',
    airline: 'SpiceJet',
    airlineCode: 'SG',
    flightNumber: 'SG-8164',
    departureAirport: 'DEL',
    departureCity: 'New Delhi',
    departureTime: '09:20 PM',
    arrivalAirport: 'BOM',
    arrivalCity: 'Mumbai',
    arrivalTime: '11:35 PM',
    duration: '2h 15m',
    stops: 'Non-stop',
    price: 4890,
    seatsAvailable: 8,
    badge: 'Late Night Saver',
    badgeType: 'purple',
    amenities: ['Baggage 15kg']
  }
];
