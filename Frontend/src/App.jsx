import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingAIButton from './components/FloatingAIButton';

import HomePage from './pages/HomePage';
import SearchResultsPage from './pages/SearchResultsPage';
import SeatSelectionPage from './pages/SeatSelectionPage';
import ReviewPage from './pages/ReviewPage';
import ConfirmationPage from './pages/ConfirmationPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ConciergePage from './pages/ConciergePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  // Active flight booking flow state
  const [searchParams, setSearchParams] = useState({
    fromCity: 'Delhi',
    fromCode: 'DEL',
    toCity: 'Mumbai',
    toCode: 'BOM',
    departureDate: '2026-07-31',
    travelers: '1 Adult',
    cabinClass: 'Economy',
    directOnly: false
  });

  const [selectedFlight, setSelectedFlight] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedFlight');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [selectedSeat, setSelectedSeat] = useState(() => {
    try {
      const saved = localStorage.getItem('selectedSeat');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [latestBooking, setLatestBooking] = useState(null);
  const [latestPayment, setLatestPayment] = useState(null);

  React.useEffect(() => {
    if (selectedFlight) {
      localStorage.setItem('selectedFlight', JSON.stringify(selectedFlight));
    } else {
      localStorage.removeItem('selectedFlight');
    }
  }, [selectedFlight]);

  React.useEffect(() => {
    if (selectedSeat) {
      localStorage.setItem('selectedSeat', JSON.stringify(selectedSeat));
    } else {
      localStorage.removeItem('selectedSeat');
    }
  }, [selectedSeat]);

  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          {/* Sticky Header present on every page */}
          <Header />

          {/* Main Content Area */}
          <main className="main-content">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  <HomePage
                    searchParams={searchParams}
                    setSearchParams={setSearchParams}
                  />
                }
              />
              <Route
                path="/search"
                element={
                  <SearchResultsPage
                    searchParams={searchParams}
                    setSelectedFlight={setSelectedFlight}
                  />
                }
              />
              <Route
                path="/concierge"
                element={
                  <ConciergePage
                    setSearchParams={setSearchParams}
                  />
                }
              />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Passenger Protected Routes */}
              <Route
                path="/seats"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'STAFF', 'ADMIN']}>
                    <SeatSelectionPage
                      selectedFlight={selectedFlight}
                      setSelectedSeat={setSelectedSeat}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/review"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'STAFF', 'ADMIN']}>
                    <ReviewPage
                      selectedFlight={selectedFlight}
                      selectedSeat={selectedSeat}
                      setLatestBooking={setLatestBooking}
                      setLatestPayment={setLatestPayment}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'STAFF', 'ADMIN']}>
                    <ConfirmationPage
                      latestBooking={latestBooking}
                      latestPayment={latestPayment}
                    />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute allowedRoles={['PASSENGER', 'STAFF', 'ADMIN']}>
                    <MyBookingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Staff Protected Route */}
              <Route
                path="/staff"
                element={
                  <ProtectedRoute allowedRoles={['STAFF']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Route */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          {/* Sticky Footer */}
          <Footer />

          {/* Floating AI Assistant Concierge Button */}
          <FloatingAIButton />
        </div>
      </Router>
    </AuthProvider>
  );
}
