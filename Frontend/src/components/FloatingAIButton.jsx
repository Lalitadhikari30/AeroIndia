import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export default function FloatingAIButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide the floating button on the concierge page itself to avoid redundancy
  if (location.pathname === '/concierge') {
    return null;
  }

  return (
    <button
      className="floating-ai-btn"
      onClick={() => navigate('/concierge')}
      title="Open AeroConcierge AI"
      aria-label="AeroConcierge AI"
    >
      <Sparkles className="sparkle-icon" size={24} />
    </button>
  );
}
