// Mock data fallback systems for AeroIndia Flight Services

export const TRENDING_ROUTES = [
  {
    id: 1,
    from: "New Delhi",
    to: "Mumbai",
    price: 4599,
    duration: "2h 10m",
    stops: "Non-stop",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=800" // Mumbai Gate of India
  },
  {
    id: 2,
    from: "Bangalore",
    to: "New Delhi",
    price: 5240,
    duration: "2h 45m",
    stops: "Non-stop",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&q=80&w=800" // Delhi Red Fort
  },
  {
    id: 3,
    from: "Goa",
    to: "Bangalore",
    price: 3199,
    duration: "1h 15m",
    stops: "Non-stop",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=800" // Goa Beach
  }
];

export const FAQ_RESPONSES = {
  baggage: "AeroIndia allows 15kg of checked baggage and 7kg of cabin baggage on all standard domestic flights. Business class passengers enjoy a generous allowance of 25kg checked baggage.",
  cancellation: "Cancellations made more than 24 hours prior to departure incur a fee of \u20B93,000. Within 24 hours, bookings are non-refundable unless a Flexi ticket option was purchased.",
  checkin: "Web check-in opens 48 hours prior to your scheduled departure and closes 60 minutes before takeoff. You can complete it on our mobile app or website.",
  waitlist: "Waitlisted tickets (WL) are updated automatically. If seats become available due to cancellations, your status will change to Confirmed. You can track this using the PNR tracker.",
  refund: "Refunds for cancelled flights are processed automatically within 5-7 working days to the original mode of payment.",
  default: "I can help you search for flights or look up travel policies. For example, try asking: 'What is the baggage policy?' or search for a route like 'Fly from Delhi to Mumbai'."
};
