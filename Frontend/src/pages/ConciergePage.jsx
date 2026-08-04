import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Send, Calendar, MessageSquare, Clipboard, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../api/client';
import { FAQ_RESPONSES } from '../data/mockData';

export default function ConciergePage({ setSearchParams }) {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Chat message history state
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Namaste! I'm your Aero\u0907\u0902\u0921\u093f\u092f\u093a Concierge. How can I assist your journey today? You can ask me to search for flights, check our latest travel policies, or manage your existing bookings.",
      timestamp: "11:59 AM"
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [conversationId, setConversationId] = useState(`conv-${Date.now()}`);
  const [typing, setTyping] = useState(false);

  // Scroll to bottom whenever messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Canned fallback scanner matching keywords (Local Fallback when backend is offline)
  const getCannedResponse = (query) => {
    const text = query.toLowerCase();
    
    // Cargo
    if (text.includes('cargo') || text.includes('demurrage') || text.includes('consignee') || text.includes('awb')) {
      return "Based on official AAI Cargo Guidelines:\n\n• Cargo Damage/Loss Claims: Register claim at Cargo Administration with copy of AWB, invoice, packing list, Joint Survey Report, and FIR application.\n• Grievances: Submit to In-charge at Air Cargo Complex or Airport Director. Written complaints acknowledged within 2 working days and resolved within 15 working days.\n• Escalation: Contact Executive Director (Cargo) at AAI HQ Delhi (Tel: 011-24657930).\n\n📌 Source: AAI Cargo FAQs";
    }
    
    // Security & Baggage Loss
    if (text.includes('security') || text.includes('cisf') || text.includes('lost') || text.includes('stolen') || text.includes('cctv')) {
      return "Based on official AAI Security Guidelines:\n\n• Baggage Safety at Screening: Report immediate loss to Security Hold Area in-charge & CISF. CCTV recordings retained for 30 days.\n• Checked Baggage Loss: Contact the concerned airline directly. For loss at airport building, report to Airport Director / Terminal Manager.\n• Police FIR: Passengers are responsible for lodging an FIR with State Police for lost items.\n\n📌 Source: AAI Security FAQs";
    }

    // UDF / Fees
    if (text.includes('udf') || text.includes('user development') || text.includes('development fee') || text.includes('psf')) {
      return "Based on official AAI Fee Guidelines:\n\n• User Development Fee (UDF): Levied on departing passengers at Greenfield/JVC airports (Delhi: ₹200 domestic / ₹1300 intl; Bangalore: ₹260 domestic / ₹1070 intl; Hyderabad: ₹375 domestic / ₹1000 intl).\n• Passenger Service Fee (PSF): Collected as part of fare to meet security & facility costs.\n\n📌 Source: AAI General FAQs";
    }

    // Vigilance & Staff Misconduct
    if (text.includes('misconduct') || text.includes('vigilance') || text.includes('bribe') || text.includes('corrupt') || text.includes('cvo')) {
      return "Based on official AAI Vigilance Guidelines:\n\n• Reporting Misconduct/Corruption: File complaints via (1) AAI Vigilance Web Portal, (2) Toll-Free Hotline 1800-11-0402, or (3) Written complaint to Chief Vigilance Officer (CVO), AAI HQ, Rajiv Gandhi Bhawan, New Delhi - 110003.\n• Timelines: Verification takes 1 month; investigation takes 3 months.\n\n📌 Source: AAI Vigilance FAQs";
    }

    // Baggage
    if (text.includes('baggage') || text.includes('luggage')) {
      return FAQ_RESPONSES.baggage;
    }
    // Cancellation
    if (text.includes('cancel') || text.includes('refund')) {
      return FAQ_RESPONSES.cancellation;
    }
    // Check-in
    if (text.includes('checkin') || text.includes('check-in') || text.includes('web check')) {
      return FAQ_RESPONSES.checkin;
    }
    // Waitlist
    if (text.includes('waitlist') || text.includes('status') || text.includes('pnr')) {
      return FAQ_RESPONSES.waitlist;
    }

    return FAQ_RESPONSES.default;
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    // Get current time
    const timeStr = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // Append user message
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      timestamp: timeStr
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setTyping(true);

    try {
      // Step A: Check if query contains flight search intent (e.g. from Delhi to Mumbai, fly, book, search)
      const lowercaseText = text.toLowerCase();
      const isSearchIntent = (lowercaseText.includes('from') && lowercaseText.includes('to')) || 
                             lowercaseText.includes('fly') || 
                             lowercaseText.includes('book a flight') || 
                             lowercaseText.includes('search a flight') ||
                             lowercaseText.includes('flights from');

      if (isSearchIntent) {
        // Try calling GenAI Natural Language Search: POST /api/genai/search
        try {
          const res = await api.post('/api/genai/search', { query: text });
          
          if (res.interpretedIntent && res.interpretedIntent.departureAirport && res.interpretedIntent.arrivalAirport) {
            const intent = res.interpretedIntent;
            
            setTimeout(() => {
              setSearchParams({
                fromCity: intent.departureAirport === 'DEL' ? 'Delhi' : 'Origin',
                fromCode: intent.departureAirport,
                toCity: intent.arrivalAirport === 'BOM' ? 'Mumbai' : 'Destination',
                toCode: intent.arrivalAirport,
                departureDate: intent.date || '2026-08-05',
                travelers: '1 Adult',
                cabinClass: 'Economy',
                directOnly: true
              });
              navigate('/search');
            }, 1800);

            addBotMessage(res.aiSummary || `✈ Searching flights from ${intent.departureAirport} to ${intent.arrivalAirport} on ${intent.date || '2026-08-05'}... Redirecting to search results!`);
            return;
          }
        } catch {
          console.warn('GenAI Search API offline, using smart local intent parser...');
        }

        // Smart Local Intent Parser Fallback
        let fromCode = 'DEL';
        let fromCity = 'Delhi';
        let toCode = 'BOM';
        let toCity = 'Mumbai';

        if (lowercaseText.includes('bangalore') || lowercaseText.includes('bengaluru') || lowercaseText.includes('blr')) {
          if (lowercaseText.indexOf('bangalore') < lowercaseText.indexOf('delhi') || lowercaseText.indexOf('bengaluru') < lowercaseText.indexOf('delhi')) {
            fromCode = 'BLR'; fromCity = 'Bengaluru';
          } else {
            toCode = 'BLR'; toCity = 'Bengaluru';
          }
        }
        if (lowercaseText.includes('goa') || lowercaseText.includes('goi')) {
          toCode = 'GOI'; toCity = 'Goa';
        }

        // Extract specific dates like "10 August", "10th August", "August 10" or relative date "tomorrow"
        let dateStr = '2026-08-10';
        const monthNames = { august: '08', aug: '08', july: '07', jul: '07', september: '09', sep: '09', october: '10', oct: '10' };
        
        const datePattern1 = lowercaseText.match(/(\d{1,2})(st|nd|rd|th)?\s+(august|aug|july|jul|september|sep|october|oct)/i);
        const datePattern2 = lowercaseText.match(/(august|aug|july|jul|september|sep|october|oct)\s+(\d{1,2})(st|nd|rd|th)?/i);

        if (datePattern1) {
          const dayPadded = String(datePattern1[1]).padStart(2, '0');
          const monthCode = monthNames[datePattern1[3].toLowerCase()] || '08';
          dateStr = `2026-${monthCode}-${dayPadded}`;
        } else if (datePattern2) {
          const dayPadded = String(datePattern2[2]).padStart(2, '0');
          const monthCode = monthNames[datePattern2[1].toLowerCase()] || '08';
          dateStr = `2026-${monthCode}-${dayPadded}`;
        } else if (lowercaseText.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          dateStr = tomorrow.toISOString().split('T')[0];
        }

        addBotMessage(`✈ Found flights! Searching best fares from ${fromCity} (${fromCode}) to ${toCity} (${toCode}) for ${dateStr}... Redirecting to search results!`);

        setTimeout(() => {
          setSearchParams({
            fromCity: fromCity,
            fromCode: fromCode,
            toCity: toCity,
            toCode: toCode,
            departureDate: dateStr,
            travelers: '1 Adult',
            cabinClass: 'Economy',
            directOnly: true
          });
          navigate('/search');
        }, 1600);

        return;
      }

      // Step B: Treat as FAQ or chat message
      // Try calling RAG Passenger Support Chatbot: POST /api/genai/chat/support
      try {
        const supportRes = await api.post('/api/genai/chat/support', { query: text, conversationId });
        if (supportRes.answer) {
          let sourcesText = "";
          if (supportRes.sources && supportRes.sources.length > 0) {
            sourcesText = "\n\n📌 **Sources:** " + supportRes.sources.join(" | ");
          }
          addBotMessage(supportRes.answer + sourcesText);
          if (supportRes.conversationId) setConversationId(supportRes.conversationId);
          return;
        }
      } catch (err) {
        console.warn('RAG Support API offline, trying standard chat...', err);
        try {
          const chatRes = await api.post('/api/genai/chat', { message: text, conversationId });
          if (chatRes.response) {
            addBotMessage(chatRes.response);
            if (chatRes.conversationId) setConversationId(chatRes.conversationId);
            return;
          }
        } catch {
          console.warn('GenAI Chat offline, using local fallback...');
        }
      }

      // Step C: If all backend endpoints failed, fallback to keyword matcher
      const fallbackText = getCannedResponse(text);
      addBotMessage(fallbackText);

    } catch {
      addBotMessage("I encountered an issue processing that query. How else can I assist your journey?");
    } finally {
      setTyping(false);
    }
  };

  const addBotMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'bot',
        text: text,
        timestamp: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      }
    ]);
  };

  const handleChipClick = (chipText) => {
    let query = chipText;
    if (chipText === "📦 Damaged cargo claim") {
      query = "how do I claim for damaged cargo";
    } else if (chipText === "🛡 Baggage loss at security") {
      query = "I lost my bag at security check";
    } else if (chipText === "💰 UDF fee at Delhi") {
      query = "what is UDF fee at Delhi airport";
    } else if (chipText === "⚖ Report staff misconduct") {
      query = "how do I report AAI staff misconduct";
    }
    handleSendMessage(query);
  };

  const handlePolicyLink = (policyName) => {
    let query = "";
    if (policyName === 'baggage') query = "Show me the baggage policy.";
    if (policyName === 'cancel') query = "Tell me about cancellation fees.";
    if (policyName === 'student') query = "Do you have student discounts?";
    if (policyName === 'senior') query = "What is the senior citizen travel policy?";
    handleSendMessage(query);
  };

  const handleUpgrade = () => {
    alert("Thank you for upgrading to AeroConcierge AI Plus! Automatic rebooking is now active for your next flight.");
  };

  return (
    <div className="container-xl animate-fade-in">
      <div className="concierge-layout">
        
        {/* Left Sidebar */}
        <aside className="concierge-sidebar">
          <div className="sidebar-card">
            <h4 style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '16px' }}>
              TRAVEL POLICY LINKS
            </h4>
            
            <div className="policy-links-list">
              <div className="policy-link-item" onClick={() => handlePolicyLink('baggage')}>
                <Clipboard size={16} style={{ color: 'var(--primary-blue)' }} />
                <span>Baggage Allowance</span>
              </div>
              <div className="policy-link-item" onClick={() => handlePolicyLink('cancel')}>
                <FileText size={16} style={{ color: 'var(--primary-blue)' }} />
                <span>Cancellation Fees</span>
              </div>
              <div className="policy-link-item" onClick={() => handlePolicyLink('student')}>
                <CheckCircle2 size={16} style={{ color: 'var(--primary-blue)' }} />
                <span>Student Discounts</span>
              </div>
              <div className="policy-link-item" onClick={() => handlePolicyLink('senior')}>
                <AlertCircle size={16} style={{ color: 'var(--primary-blue)' }} />
                <span>Senior Citizen Policy</span>
              </div>
            </div>
          </div>

          {/* Plus Promo Card */}
          <div className="concierge-plus-card">
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--primary-navy-dark)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={16} style={{ color: 'var(--primary-blue)' }} />
              <span>AI Concierge Plus</span>
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '8px 0 16px', lineHeight: '1.4' }}>
              Enable real-time flight tracking and automatic rebooking for just ₹299 per trip.
            </p>
            <button
              onClick={handleUpgrade}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', fontSize: '0.8rem' }}
            >
              Upgrade Now
            </button>
          </div>
        </aside>

        {/* Main Chat Panel */}
        <section className="chat-panel">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="bot-avatar">AI</div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong style={{ fontSize: '0.95rem' }}>AeroConcierge AI</strong>
                  <span className="badge-success" style={{ padding: '2px 8px', fontSize: '0.6rem' }}>VERIFIED BOT</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Available 24/7 &bull; English &amp; Hindi
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', color: 'var(--text-light)' }}>
              <Calendar size={18} />
              <MessageSquare size={18} />
            </div>
          </div>

          {/* Scrollable messages area */}
          <div className="chat-messages-area">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`chat-bubble ${m.sender}`}
              >
                <div>{m.text}</div>
                <div className="chat-bubble-timestamp" style={{ textAlign: m.sender === 'user' ? 'right' : 'left', color: m.sender === 'user' ? '#93c5fd' : undefined }}>
                  {m.timestamp}
                </div>
              </div>
            ))}
            {typing && (
              <div className="chat-bubble bot" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px', color: 'var(--text-muted)' }}>
                <span>Concierge is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick-action chips */}
          <div className="chat-chips-row">
            {[
              "📦 Damaged cargo claim",
              "🛡 Baggage loss at security",
              "💰 UDF fee at Delhi",
              "⚖ Report staff misconduct"
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                className="action-chip"
                onClick={() => handleChipClick(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="chat-input-container">
            <div className="chat-input-bar">
              <Sparkles size={18} style={{ color: 'var(--primary-blue)' }} />
              <input
                type="text"
                placeholder="E.g., 'Find me a flight from Delhi to Mumbai tomorrow morning'..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSendMessage(inputValue);
                }}
              />
              <button
                type="button"
                onClick={() => handleSendMessage(inputValue)}
                style={{ padding: '4px', color: 'var(--primary-blue)' }}
              >
                <Send size={18} />
              </button>
            </div>
            
            <div className="chat-caption-text">
              AEROCONCIERGE MAY PROVIDE INFORMATION SOURCED FROM FLIGHT DATABASES. ALWAYS VERIFY CRITICAL TRAVEL DETAILS BEFORE BOOKING.
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
