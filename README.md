# ✈️ Distributed Flight Ticketing & Reservation Platform

A modern, highly resilient, event-driven microservices platform built for high-concurrency flight ticket bookings, real-time seat locks, automated notifications, and AI-powered travel assistance.

---

## 📐 Architecture Overview

![System Architecture](architecture_diagram.png)

The system follows a **Database-per-Service** microservices architecture. Microservices register with **Spring Cloud Netflix Eureka** for service discovery and communicate via **API Gateway**, synchronous **OpenFeign** REST calls, and asynchronous **Apache Kafka** event streams.

```mermaid
flowchart TD
    subgraph Client ["Client Layer"]
        FE["React Frontend (Vite)"]
    end

    subgraph Edge ["API Gateway & Service Discovery Layer"]
        GW["API Gateway (Port 8080)<br/>- Route Dispatcher<br/>- JWT Token Validator<br/>- Swagger Aggregator"]
        EUR["Eureka Discovery Server (Port 8761)<br/>- Central Service Registry"]
    end

    subgraph CoreServices ["Microservices Domain Layer"]
        AUTH["Auth Service (Port 8081)<br/>- Login & User Signup<br/>- JWT Generation"]
        FLIGHT["Flight Service (Port 8082)<br/>- Catalog & Schedules<br/>- Seat Maps & Pricing"]
        BOOKING["Booking Service (Port 8083)<br/>- PNR & Booking Logic<br/>- Concurrency Handling<br/>- Waitlist Management"]
        PAYMENT["Payment Service (Port 8084)<br/>- Card / UPI Payments<br/>- Refunds"]
        NOTIF["Notification Service (Port 8085)<br/>- Email & SMS Sender"]
        GENAI["GenAI Service (Port 8086)<br/>- AI Travel Assistant"]
    end

    subgraph Infrastructure ["Async Messaging & Caching Layer"]
        REDIS[("Redis / Redisson Cache<br/>- Distributed Seat Locking")]
        KAFKA{{"Kafka / Redpanda Broker<br/>- Topics: booking-events, booking-waitlist"}}
    end

    subgraph DBs ["Isolated Databases (DB-per-Service)"]
        DB1[("ticketing_auth")]
        DB2[("ticketing_flight")]
        DB3[("ticketing_booking")]
        DB4[("ticketing_payment")]
        DB5[("ticketing_genai")]
    end

    %% Routing
    FE -->|HTTP / REST| GW
    GW <-->|Lookup Routes| EUR
    GW -->|/api/auth/*| AUTH
    GW -->|/api/flights/*| FLIGHT
    GW -->|/api/bookings/*| BOOKING
    GW -->|/api/payments/*| PAYMENT
    GW -->|/api/notifications/*| NOTIF
    GW -->|/api/genai/*| GENAI

    %% Inter-service Sync (Feign)
    BOOKING -->|Feign REST + Resilience4j| FLIGHT
    BOOKING -->|Feign REST + Resilience4j| PAYMENT
    GENAI -->|Feign REST| FLIGHT

    %% Redis Locks & Kafka Events
    BOOKING <-->|Acquire / Release Lock| REDIS
    BOOKING -->|Publish Events| KAFKA
    KAFKA -->|Consume booking-events| NOTIF
    KAFKA -->|Consume booking-waitlist| BOOKING

    %% Database connections
    AUTH --> DB1
    FLIGHT --> DB2
    BOOKING --> DB3
    PAYMENT --> DB4
    GENAI --> DB5
```

---

## 🛠️ Technology & Infrastructure Breakdown

| Service / Component | Technology Used | Purpose & Functionality |
| :--- | :--- | :--- |
| **Eureka Server** | Spring Cloud Netflix Eureka | Service discovery & registration registry (`http://localhost:8761`). |
| **API Gateway** | Spring Cloud Gateway, Netty, JWT | Single entry point (Port 8080), route dispatching, CORS management, JWT authorization verification, and unified Swagger API aggregation. |
| **Auth Service** | Spring Security, JWT, PostgreSQL | User sign-up, login authentication, role-based access control (User/Admin), password hashing, and JWT token issuance. |
| **Flight Service** | Spring Boot, JPA, PostgreSQL | Flight catalogs, schedules, origin/destination routes, seat inventory, pricing tiers, and admin management. |
| **Booking Service** | Spring Boot, Redisson, Kafka, Feign, Resilience4j, PostgreSQL | Booking orchestration, PNR generation, concurrency control via Redis locks, waitlist management, and publishing lifecycle events to Kafka. |
| **Payment Service** | Spring Boot, PostgreSQL | Payment processing (Credit Card, UPI, Netbanking simulation), refunds, and idempotent transaction handling. |
| **Notification Service** | Spring Boot, Kafka Consumer | Event-driven consumer listening to Kafka topics to asynchronously send booking confirmations, e-tickets, and cancellation alerts via Email/SMS. |
| **GenAI Service** | Spring Boot, Claude / LLM API, OpenFeign, PostgreSQL | Conversational AI assistant helping passengers query flights, luggage rules, and itinerary details in natural language. |
| **Frontend** | React, Vite, Modern CSS | Responsive user interface with real-time seat maps, dark mode, booking management, and interactive AI chatbot drawer. |

---

## 🚀 Key Feature Implementations

### 1. ⚡ Event-Driven Architecture (Apache Kafka / Redpanda Cloud)
- **Producers**: `booking-service` publishes lifecycle events (`BOOKING_CREATED`, `BOOKING_CONFIRMED`, `BOOKING_CANCELLED`, `SEAT_FREED`) to topic `booking-events`, and waitlist items to `booking-waitlist`.
- **Consumers**:
  - `notification-service` consumes `booking-events` to trigger asynchronous Email/SMS alerts.
  - `booking-service` (`WaitlistConsumer`) consumes `booking-waitlist` to automatically promote waiting passengers when seats free up.

### 2. 🔴 Concurrency & Race-Condition Prevention (Redis / Redisson)
- Uses **Redisson Distributed Locking** (`lock:flight:<flightId>:seat:<seatNumber>`) in `booking-service`.
- Guarantees that if two passengers attempt to book seat `14B` on the same flight at the exact same millisecond, only **one** transaction succeeds, avoiding double-booking.

### 3. 🛡️ Fault Tolerance & Resilience (Resilience4j)
- `booking-service` wraps inter-service calls to `payment-service` using **Resilience4j Circuit Breakers** and **Exponential Backoff Retries** (up to 3 attempts).
- Protects the platform from cascading failures during high payment gateway latencies or transient network glitches.

### 4. 🔗 Inter-Service REST (Spring Cloud OpenFeign)
- Declarative HTTP clients enable synchronous communication between microservices via Eureka dynamic lookup (`lb://flight-service`, `lb://payment-service`).

---

## 🔄 Sequence Flows

### Flight Booking & Seat Lock Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger (React UI)
    participant GW as API Gateway (8080)
    participant BS as Booking Service (8083)
    participant Redis as Redis (Upstash)
    participant FS as Flight Service (8082)
    participant PS as Payment Service (8084)
    participant DB as Postgres (ticketing_booking)
    participant Kafka as Kafka Broker

    User->>GW: POST /api/bookings (flightId, seat "14B", passenger details)
    GW->>GW: Validate JWT Token in Header
    GW->>BS: Forward Request to Booking Service

    Note over BS,Redis: 1. Prevent Concurrent Seat Double-Booking
    BS->>Redis: Acquire Lock ("lock:flight:F101:seat:14B")
    alt Lock Failed (Seat locked by another user)
        Redis-->>BS: Lock Denied
        BS-->>User: 409 Conflict ("Seat is currently being booked")
    else Lock Granted
        Redis-->>BS: Lock Acquired
    end

    Note over BS,FS: 2. Inter-Service Verification (Feign)
    BS->>FS: Feign Call: GET /api/flights/F101/seats/14B
    FS-->>BS: Return Seat Available

    BS->>DB: Save Booking in State PENDING (Generate PNR)

    Note over BS,PS: 3. Resilience4j Protected Payment Call
    BS->>PS: Feign Call: POST /api/payments/process
    alt Payment Successful
        PS-->>BS: 200 OK (Transaction ID: TXN9988)
        BS->>DB: Update Booking State to CONFIRMED
    else Payment Gateway Fail / Timeout
        PS-->>BS: 500 Error / Timeout
        Note over BS: Resilience4j Retries (up to 3x with Backoff)
        BS->>DB: Update Booking State to FAILED
    end

    Note over BS,Kafka: 4. Asynchronous Event Publishing
    BS->>Kafka: Publish "BOOKING_CONFIRMED" to "booking-events"
    BS->>Redis: Release Lock ("lock:flight:F101:seat:14B")

    BS-->>GW: Return Booking Response (PNR, Status: CONFIRMED)
    GW-->>User: Display Booking Success & E-ticket
```

### Kafka Async Notifications & Waitlist Flow

```mermaid
sequenceDiagram
    autonumber
    participant BS as Booking Service (Producer)
    participant Kafka as Kafka Broker (Topics)
    participant NS as Notification Service (Consumer)
    participant WC as Waitlist Consumer (Booking Service)
    participant Email as Email / SMS Gateway

    rect rgb(235, 245, 255)
        Note over BS,NS: Scenario A: Booking Confirmation Notification
        BS->>Kafka: Publish BookingEvent (Type: BOOKING_CONFIRMED) to "booking-events"
        Kafka-->>NS: Kafka Listener receives BookingEvent
        NS->>NS: Format HTML E-ticket & Boarding Pass
        NS->>Email: Send Email/SMS to passenger (Async)
    end

    rect rgb(255, 245, 235)
        Note over BS,WC: Scenario B: Flight Fully Booked (Waitlist Flow)
        BS->>Kafka: Publish Waitlist ID to "booking-waitlist"
        Kafka-->>WC: WaitlistConsumer receives message
        WC->>WC: Check if seat has been cancelled/freed
        alt Seat becomes available
            WC->>BS: Promote passenger from WAITING to CONFIRMED
            BS->>Kafka: Publish "WAITLIST_PROMOTED" event
            Kafka-->>NS: Send "You have been promoted from Waitlist!" Email
        end
    end
```

### AI Travel Assistant Flow (GenAI Service)

```mermaid
sequenceDiagram
    autonumber
    actor User as Passenger
    participant UI as React Chatbot Widget
    participant GW as API Gateway
    participant AI as GenAI Service (8086)
    participant FS as Flight Service (8082)
    participant LLM as Anthropic Claude / LLM API

    User->>UI: Types: "Are there any available flights from Delhi to Mumbai tomorrow?"
    UI->>GW: POST /api/genai/chat (prompt)
    GW->>AI: Forward request to GenAI Service

    Note over AI,FS: Fetch Real-Time Context
    AI->>FS: Feign Call: GET /api/flights/search?origin=DEL&destination=BOM
    FS-->>AI: Returns Live Flight Catalog Data

    Note over AI,LLM: AI Recommendation Generation
    AI->>LLM: Send Prompt + Live Flight Context to LLM API
    LLM-->>AI: Returns formatted natural language response

    AI-->>GW: Return AI Response JSON
    GW-->>UI: Display response in AI Chat drawer
```

---

## 📡 Service Ports & Database Mapping

| Service Name | Port | Context Path | PostgreSQL Database |
| :--- | :---: | :--- | :--- |
| **API Gateway** | `8080` | `/` | — |
| **Eureka Server** | `8761` | `/` | — |
| **Auth Service** | `8081` | `/api/auth` | `ticketing_auth` |
| **Flight Service** | `8082` | `/api/flights` | `ticketing_flight` |
| **Booking Service** | `8083` | `/api/bookings` | `ticketing_booking` |
| **Payment Service** | `8084` | `/api/payments` | `ticketing_payment` |
| **Notification Service** | `8085` | `/api/notifications` | — |
| **GenAI Service** | `8086` | `/api/genai` | `ticketing_genai` |

---

## ⚡ Quick Start & Execution Guide

### Prerequisites
- Java 17+
- Node.js 18+ & npm
- PostgreSQL running locally on port `5432` with databases created (`ticketing_auth`, `ticketing_flight`, `ticketing_booking`, `ticketing_payment`, `ticketing_genai`).

### 1. Launch All Microservices
Run the automated script from the root directory:
```bash
./start-backend.bat
```
*(Or run `start-all.ps1` in PowerShell)*

Check Eureka Dashboard at: `http://localhost:8761`

### 2. Launch Frontend Application
```bash
cd Frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
