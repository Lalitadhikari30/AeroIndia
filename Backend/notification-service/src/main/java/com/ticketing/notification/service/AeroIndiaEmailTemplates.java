package com.ticketing.notification.service;

import com.ticketing.notification.event.BookingEvent;
import org.springframework.stereotype.Component;

@Component
public class AeroIndiaEmailTemplates {

    private static final String EMAIL_STYLE_HEADER = """
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
            .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 28px 24px; text-align: center; color: #ffffff; }
            .logo { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
            .logo span { color: #93c5fd; }
            .subtitle { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color: #bfdbfe; margin-top: 6px; }
            .content { padding: 32px 24px; }
            .ticket-card { background: #f1f5f9; border-left: 4px solid #1d4ed8; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .ticket-row { display: table; width: 100%; margin-bottom: 12px; }
            .ticket-cell { display: table-cell; vertical-align: top; width: 50%; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 4px; }
            .val { font-size: 15px; color: #0f172a; font-weight: 700; }
            .badge { display: inline-block; background: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px; }
            .promo-box { background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border: 1px dashed #3b82f6; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
            .promo-code { font-size: 22px; font-weight: 800; color: #1d4ed8; letter-spacing: 3px; font-family: monospace; }
            .btn { display: inline-block; background: #1d4ed8; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 8px; margin-top: 16px; text-align: center; }
            .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; }
            .footer a { color: #3b82f6; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Aero<span>India</span></div>
              <div class="subtitle">Flight Services &bull; Official Communication</div>
            </div>
            <div class="content">
        """;

    private static final String EMAIL_STYLE_FOOTER = """
            </div>
            <div class="footer">
              <p>&copy; 2026 AeroIndia Flight Services. All rights reserved.</p>
              <p>Corporate HQ: Rajiv Gandhi Bhawan, Safdarjung Airport, New Delhi &bull; Helpline: 1800-11-0402</p>
            </div>
          </div>
        </body>
        </html>
        """;

    public String buildWelcomeEmail(String name, String email) {
        String safeName = (name != null && !name.isBlank()) ? name : "Passenger";
        return EMAIL_STYLE_HEADER + String.format("""
            <div class="badge">Welcome Member</div>
            <h2 style="margin-top:0; color:#0f172a;">Namaste %s, welcome aboard! ✈</h2>
            <p style="line-height:1.6; color:#334155;">
              Thank you for registering with <strong>AeroIndia</strong>. We are thrilled to have you as part of India's preferred aviation platform.
              Enjoy seamless bookings across 50+ domestic airports and exclusive member privileges.
            </p>
            
            <div class="promo-box">
              <div style="font-size:12px; color:#475569; font-weight:600;">EXCLUSIVELY FOR YOU &bull; GET 15%% OFF YOUR FIRST FLIGHT</div>
              <div class="promo-code" style="margin: 10px 0;">AEROFIRST15</div>
              <div style="font-size:11px; color:#64748b;">Use this promo code at checkout on any domestic route.</div>
            </div>

            <p style="line-height:1.6; color:#334155;">Ready to explore the skies?</p>
            <div style="text-align: center;">
              <a href="http://localhost:5173" class="btn">Search Flights Now</a>
            </div>
            """, safeName) + EMAIL_STYLE_FOOTER;
    }

    public String buildBookingConfirmationEmail(BookingEvent event) {
        String safeName = (event.getPassengerName() != null && !event.getPassengerName().isBlank()) ? event.getPassengerName() : "Passenger";
        return EMAIL_STYLE_HEADER + String.format("""
            <div class="badge" style="background:#dcfce7; color:#166534;">CONFIRMED E-TICKET</div>
            <h2 style="margin-top:0; color:#0f172a;">Booking Confirmed! PNR: %s ✈</h2>
            <p style="line-height:1.6; color:#334155;">
              Dear <strong>%s</strong>, your flight booking is confirmed. Your official e-ticket details are provided below:
            </p>

            <div class="ticket-card">
              <div class="ticket-row">
                <div class="ticket-cell">
                  <div class="label">PASSENGER NAME</div>
                  <div class="val">%s</div>
                </div>
                <div class="ticket-cell">
                  <div class="label">PNR / BOOKING REF</div>
                  <div class="val" style="color:#1d4ed8;">%s</div>
                </div>
              </div>
              <div class="ticket-row">
                <div class="ticket-cell">
                  <div class="label">FLIGHT NUMBER</div>
                  <div class="val">%s</div>
                </div>
                <div class="ticket-cell">
                  <div class="label">SEAT ASSIGNED</div>
                  <div class="val">%s</div>
                </div>
              </div>
              <div class="ticket-row">
                <div class="ticket-cell">
                  <div class="label">DEPARTURE ROUTE</div>
                  <div class="val">%s &rarr; %s</div>
                </div>
                <div class="ticket-cell">
                  <div class="label">DEPARTURE TIME</div>
                  <div class="val">%s</div>
                </div>
              </div>
              <div class="ticket-row" style="margin-bottom:0;">
                <div class="ticket-cell">
                  <div class="label">TOTAL FARE PAID</div>
                  <div class="val" style="color:#166534;">₹%s</div>
                </div>
                <div class="ticket-cell">
                  <div class="label">STATUS</div>
                  <div class="val" style="color:#166534;">CONFIRMED</div>
                </div>
              </div>
            </div>

            <p style="line-height:1.6; color:#334155;">
              Please report at the airport terminal 2 hours prior to scheduled departure. Web check-in opens 48 hours before departure.
            </p>

            <div style="text-align: center;">
              <a href="http://localhost:5173/bookings" class="btn">View &amp; Print E-Ticket</a>
            </div>
            """, 
            event.getPnr(), safeName, safeName, event.getPnr(), 
            event.getFlightNumber(), event.getSeatNumber(),
            event.getDepartureAirport(), event.getArrivalAirport(),
            event.getDepartureTime(), event.getTotalPrice()) + EMAIL_STYLE_FOOTER;
    }

    public String buildAbandonedSearchEmail(String name, String email, String fromCity, String toCity, String date) {
        String safeName = (name != null && !name.isBlank()) ? name : "Traveler";
        String routeStr = (fromCity != null && toCity != null) ? fromCity + " to " + toCity : "your selected destination";
        return EMAIL_STYLE_HEADER + String.format("""
            <div class="badge" style="background:#fef3c7; color:#92400e;">SPECIAL FARE DROP</div>
            <h2 style="margin-top:0; color:#0f172a;">Still planning your trip to %s? ✈</h2>
            <p style="line-height:1.6; color:#334155;">
              Hi <strong>%s</strong>, we noticed you were searching for flights from <strong>%s</strong>. Seats are filling fast, but we've held a special discount code for you!
            </p>

            <div class="promo-box">
              <div style="font-size:12px; color:#475569; font-weight:600;">LIMITED-TIME FARE REDUCTION &bull; GET 10%% OFF</div>
              <div class="promo-code" style="margin: 10px 0;">FLYINDIA10</div>
              <div style="font-size:11px; color:#64748b;">Valid for bookings completed within 24 hours on %s.</div>
            </div>

            <div style="text-align: center;">
              <a href="http://localhost:5173/search?fromCity=%s&toCity=%s" class="btn">Complete My Booking Now</a>
            </div>
            """, 
            toCity != null ? toCity : "India", safeName, routeStr, routeStr,
            fromCity != null ? fromCity : "Delhi", toCity != null ? toCity : "Mumbai") + EMAIL_STYLE_FOOTER;
    }

    public String buildAbandonedPaymentEmail(String name, String email, String pnr, String route, Double amount) {
        String safeName = (name != null && !name.isBlank()) ? name : "Traveler";
        String routeStr = route != null ? route : "your flight";
        String fareStr = amount != null ? "₹" + amount : "";
        return EMAIL_STYLE_HEADER + String.format("""
            <div class="badge" style="background:#fee2e2; color:#991b1b;">PAYMENT PENDING</div>
            <h2 style="margin-top:0; color:#0f172a;">Complete your booking before your fare expires! ⏳</h2>
            <p style="line-height:1.6; color:#334155;">
              Hello <strong>%s</strong>, you left your checkout incomplete for <strong>%s</strong> %s. Fares fluctuate dynamically, but your seat is reserved for a short time.
            </p>

            <div class="promo-box" style="background:#fef2f2; border-color:#ef4444;">
              <div style="font-size:12px; color:#991b1b; font-weight:600;">INSTANT DISCOUNT CODE &bull; SAVE ₹500 AT CHECKOUT</div>
              <div class="promo-code" style="margin: 10px 0; color:#dc2626;">PAYSAFE5</div>
              <div style="font-size:11px; color:#7f1d1d;">Apply this code at checkout to claim instant savings.</div>
            </div>

            <div style="text-align: center;">
              <a href="http://localhost:5173/checkout" class="btn" style="background:#dc2626;">Complete Payment &amp; Get Ticket</a>
            </div>
            """, safeName, routeStr, fareStr) + EMAIL_STYLE_FOOTER;
    }
}
