# AeroIndia — Production Deployment Guide

> **Last updated**: August 2026
> **Architecture**: 7 Spring Boot microservices (Docker on Render) + React/Vite frontend (Vercel)
> **No Eureka in production** — direct URL routing via env vars. Eureka is local-dev only.

---

## Table of Contents

1. [Third-Party Account Setup Checklist](#1-third-party-account-setup-checklist)
2. [Deployment Order](#2-deployment-order)
3. [Environment Variables per Service](#3-environment-variables-per-service)
4. [Render Blueprint Deployment (Recommended)](#4-render-blueprint-deployment)
5. [Manual Render Deployment (Alternative)](#5-manual-render-deployment)
6. [Vercel Frontend Deployment](#6-vercel-frontend-deployment)
7. [Post-Deployment: Set CORS Origin](#7-post-deployment-set-cors-origin)
8. [End-to-End Smoke Test](#8-end-to-end-smoke-test)
9. [Known Limitations](#9-known-limitations)

---

## 1. Third-Party Account Setup Checklist

Complete these steps **before deploying**. Each step requires manual action in a third-party dashboard.

### 1.1 Neon Postgres (Database)

1. Go to [neon.tech](https://neon.tech) → Sign up / Sign in
2. Click **"New Project"** → Name: `aeroindia` → Region: **Asia Pacific (Singapore)**
3. Once created, go to **Databases** tab and create 4 databases:
   - `ticketing_auth`
   - `ticketing_booking`
   - `ticketing_payment`
   - `ticketing_genai`
4. Note: `ticketing_flight` uses the same Neon instance — create a 5th database:
   - `ticketing_flight`
5. Go to **Dashboard** → Copy the **pooled connection string** for each database. Format:
   ```
   postgresql://<user>:<password>@<host>/<dbname>?sslmode=require
   ```
6. For `ticketing_genai`, you need the **pgvector extension**. Run in the Neon SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```

### 1.2 Upstash Redis (Distributed Locking)

1. Go to [upstash.com](https://upstash.com) → Sign up / Sign in
2. Click **"Create Database"** → Name: `aeroindia-redis` → Region: **AP-Southeast-1 (Singapore)**
3. After creation, go to **Details** tab
4. Copy the **Redis URL** (format: `rediss://default:<password>@<host>:<port>`)
5. Copy the **Password** separately

### 1.3 Redpanda Cloud (Kafka-compatible Event Streaming)

1. Go to [cloud.redpanda.com](https://cloud.redpanda.com) → Sign up / Sign in
2. Create a **Serverless cluster** → Region: closest to Singapore
3. Go to **Security** → Create a **SCRAM user** (note the username and password)
4. Go to **Overview** → Copy the **Bootstrap server URL**
5. Go to **Topics** → Create two topics:
   - `booking-events` (3 partitions)
   - `booking-waitlist` (1 partition)

### 1.4 Gmail App Password (Email Notifications)

1. Go to [myaccount.google.com/security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
4. Select **Mail** as the app → Click **Generate**
5. Copy the 16-character app password (e.g., `abcd efgh ijkl mnop`)
6. Note the Gmail address you used

### 1.5 Google Gemini API Key (GenAI)

1. Go to [aistudio.google.com](https://aistudio.google.com) → Sign in
2. Click **"Get API Key"** → **"Create API Key"**
3. Copy the API key

### 1.6 Render Account (Backend Hosting)

1. Go to [render.com](https://render.com) → Sign up / Sign in
2. Go to **Account Settings** → **Git Providers** → Connect your **GitHub** account
3. Authorize Render to access the `Lalitadhikari30/AeroIndia` repository

### 1.7 Vercel Account (Frontend Hosting)

1. Go to [vercel.com](https://vercel.com) → Sign up / Sign in
2. Connect your **GitHub** account
3. Authorize Vercel to access the `Lalitadhikari30/AeroIndia` repository

---

## 2. Deployment Order

| Step | Service | Why this order? |
|------|---------|----------------|
| 1 | `auth-service` | No dependencies on other services |
| 2 | `flight-service` | No dependencies on other services |
| 3 | `payment-service` | No dependencies on other services |
| 4 | `notification-service` | Depends on Redpanda only (external) |
| 5 | `booking-service` | Depends on flight-service + payment-service URLs |
| 6 | `genai-service` | Depends on flight-service URL |
| 7 | `api-gateway` | **Deploy LAST** — needs live URLs of all 6 services above |
| 8 | Frontend (Vercel) | Needs the api-gateway's live URL as `VITE_API_BASE_URL` |

> **Note**: Eureka server is NOT deployed to production. It is only used for local development.

---

## 3. Environment Variables per Service

### 3.1 auth-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8081` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `SPRING_DATASOURCE_URL` | `postgresql://<user>:<pass>@<host>/ticketing_auth?sslmode=require` | Neon dashboard |
| `SPRING_DATASOURCE_USERNAME` | `<neon-user>` | Neon dashboard |
| `SPRING_DATASOURCE_PASSWORD` | `<neon-password>` | Neon dashboard |
| `JWT_SECRET` | `<64-char-hex-string>` | Generate one and use the SAME value for api-gateway |

### 3.2 flight-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8082` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `SPRING_DATASOURCE_URL` | `postgresql://<user>:<pass>@<host>/ticketing_flight?sslmode=require` | Neon dashboard |
| `SPRING_DATASOURCE_USERNAME` | `<neon-user>` | Neon dashboard |
| `SPRING_DATASOURCE_PASSWORD` | `<neon-password>` | Neon dashboard |

### 3.3 payment-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8084` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `SPRING_DATASOURCE_URL` | `postgresql://<user>:<pass>@<host>/ticketing_payment?sslmode=require` | Neon dashboard |
| `SPRING_DATASOURCE_USERNAME` | `<neon-user>` | Neon dashboard |
| `SPRING_DATASOURCE_PASSWORD` | `<neon-password>` | Neon dashboard |

### 3.4 notification-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8085` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `GMAIL_USERNAME` | `your-email@gmail.com` | Your Gmail |
| `GMAIL_APP_PASSWORD` | `xxxx xxxx xxxx xxxx` | Gmail App Passwords |
| `KAFKA_SERVERS` | `<redpanda-bootstrap-url>:9092` | Redpanda dashboard |
| `KAFKA_USERNAME` | `<scram-user>` | Redpanda Security |
| `KAFKA_PASSWORD` | `<scram-password>` | Redpanda Security |
| `ENABLE_KAFKA` | `true` | Fixed |

### 3.5 booking-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8083` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `SPRING_DATASOURCE_URL` | `postgresql://<user>:<pass>@<host>/ticketing_booking?sslmode=require` | Neon dashboard |
| `SPRING_DATASOURCE_USERNAME` | `<neon-user>` | Neon dashboard |
| `SPRING_DATASOURCE_PASSWORD` | `<neon-password>` | Neon dashboard |
| `KAFKA_SERVERS` | `<redpanda-bootstrap-url>:9092` | Redpanda dashboard |
| `KAFKA_USERNAME` | `<scram-user>` | Redpanda Security |
| `KAFKA_PASSWORD` | `<scram-password>` | Redpanda Security |
| `ENABLE_REDIS` | `true` | Fixed |
| `REDIS_ADDRESS` | `rediss://default:<pass>@<host>:<port>` | Upstash dashboard |
| `REDIS_PASSWORD` | `<upstash-password>` | Upstash dashboard |
| `FLIGHT_SERVICE_URL` | `https://aeroindia-flight-service.onrender.com` | Render dashboard (after deploy) |
| `PAYMENT_SERVICE_URL` | `https://aeroindia-payment-service.onrender.com` | Render dashboard (after deploy) |

### 3.6 genai-service

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8086` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `SPRING_DATASOURCE_URL` | `postgresql://<user>:<pass>@<host>/ticketing_genai?sslmode=require` | Neon dashboard |
| `SPRING_DATASOURCE_USERNAME` | `<neon-user>` | Neon dashboard |
| `SPRING_DATASOURCE_PASSWORD` | `<neon-password>` | Neon dashboard |
| `GEMINI_API_KEY` | `<your-gemini-api-key>` | Google AI Studio |
| `FLIGHT_SERVICE_URL` | `https://aeroindia-flight-service.onrender.com` | Render dashboard (after deploy) |

### 3.7 api-gateway (deploy LAST)

| Variable | Value | Source |
|----------|-------|--------|
| `PORT` | `8080` | Fixed |
| `SPRING_PROFILES_ACTIVE` | `prod` | Fixed |
| `JWT_SECRET` | `<same-64-char-hex-as-auth-service>` | **Must match auth-service** |
| `ALLOWED_ORIGINS` | `https://your-app.vercel.app` | Vercel domain (after frontend deploy) |
| `AUTH_SERVICE_URL` | `https://aeroindia-auth-service.onrender.com` | Render dashboard |
| `FLIGHT_SERVICE_URL` | `https://aeroindia-flight-service.onrender.com` | Render dashboard |
| `BOOKING_SERVICE_URL` | `https://aeroindia-booking-service.onrender.com` | Render dashboard |
| `PAYMENT_SERVICE_URL` | `https://aeroindia-payment-service.onrender.com` | Render dashboard |
| `NOTIFICATION_SERVICE_URL` | `https://aeroindia-notification-service.onrender.com` | Render dashboard |
| `GENAI_SERVICE_URL` | `https://aeroindia-genai-service.onrender.com` | Render dashboard |

### 3.8 Frontend (Vercel)

| Variable | Value | Source |
|----------|-------|--------|
| `VITE_API_BASE_URL` | `https://aeroindia-api-gateway.onrender.com` | Render dashboard |

---

## 4. Render Blueprint Deployment (Recommended)

The `render.yaml` at the project root defines all 7 backend services. This is the fastest way to deploy:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Blueprint**
3. Connect to the `Lalitadhikari30/AeroIndia` repository
4. Render will detect `render.yaml` automatically
5. For each `sync: false` variable, Render will prompt you to enter values
6. Fill in the values from the tables above
7. Click **Apply** — all 7 services will deploy

> **Note**: The `fromService` references in `render.yaml` automatically wire service URLs (e.g., `FLIGHT_SERVICE_URL` for booking-service). However, some may resolve to internal hostnames. If a service can't reach another, manually set the full `https://....onrender.com` URL in the Render dashboard.

---

## 5. Manual Render Deployment (Alternative)

If you prefer to deploy services one by one:

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **New** → **Web Service**
3. Connect to the `Lalitadhikari30/AeroIndia` repository
4. Set **Root Directory** to `Backend/<service-name>` (e.g., `Backend/auth-service`)
5. Set **Runtime** to **Docker**
6. Set **Region** to **Singapore**
7. Set **Instance Type** to **Free**
8. Add all environment variables from section 3
9. Click **Create Web Service**
10. Repeat for each service in the order specified in section 2

---

## 6. Vercel Frontend Deployment

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `Lalitadhikari30/AeroIndia` repository
3. Set **Root Directory** to `Frontend`
4. Set **Framework Preset** to **Vite**
5. Add environment variable:
   - `VITE_API_BASE_URL` = `https://aeroindia-api-gateway.onrender.com`
6. Click **Deploy**

---

## 7. Post-Deployment: Set CORS Origin

After the frontend is deployed to Vercel, you'll get a URL like `https://aeroindia.vercel.app`.

1. Go to Render dashboard → `aeroindia-api-gateway` → **Environment**
2. Set `ALLOWED_ORIGINS` to your Vercel URL: `https://aeroindia.vercel.app`
   - For multiple origins: `https://aeroindia.vercel.app,http://localhost:5173`
3. Click **Save Changes** → the gateway will redeploy

---

## 8. End-to-End Smoke Test

After all services are live, run through this checklist:

### 8.1 Basic Connectivity
- [ ] Visit `https://aeroindia-api-gateway.onrender.com/actuator/health` → should return `{"status": "UP"}`
- [ ] Visit each service's health endpoint:
  - `https://aeroindia-auth-service.onrender.com/api/auth/actuator/health`
  - `https://aeroindia-flight-service.onrender.com/api/flights/actuator/health`
  - `https://aeroindia-booking-service.onrender.com/api/bookings/actuator/health`
  - `https://aeroindia-payment-service.onrender.com/api/payments/actuator/health`
  - `https://aeroindia-notification-service.onrender.com/api/notifications/actuator/health`
  - `https://aeroindia-genai-service.onrender.com/api/genai/actuator/health`

### 8.2 User Flow (Passenger)
- [ ] Open the Vercel frontend URL
- [ ] **Register** a new passenger account → confirm the welcome email arrives
- [ ] **Login** with the new credentials → verify JWT token in browser dev tools
- [ ] **Search** for flights (e.g., Delhi → Mumbai) → results appear
- [ ] **Select** a flight → proceed to seat selection
- [ ] **Select** a seat → verify the seat lock is applied (via Redis)
- [ ] **Review** the booking → click Pay
- [ ] **Payment** processes → confirmation page shows booking details
- [ ] **Check email** → confirmation email with booking details arrives
- [ ] **My Bookings** page → the new booking appears
- [ ] **Cancel** the booking → verify status changes to CANCELLED

### 8.3 AI Chatbot
- [ ] Open the floating AI concierge button
- [ ] Ask a policy question (e.g., "What is your cancellation policy?") → RAG chatbot responds
- [ ] Ask a flight search query (e.g., "Find me a flight from Delhi to Mumbai tomorrow") → AI responds with results

### 8.4 Staff/Admin (if applicable)
- [ ] Register/login as STAFF → access `/staff` dashboard
- [ ] Register/login as ADMIN → access `/admin` dashboard

---

## 9. Known Limitations

### 9.1 Free-Tier Cold Starts (Render)
- **Impact**: Render free-tier services spin down after ~15 minutes of inactivity
- **First request latency**: 30–60 seconds while the JVM boots up
- **Mitigation**: Use a free cron monitoring service (e.g., [cron-job.org](https://cron-job.org)) to ping each service's `/actuator/health` endpoint every 14 minutes to keep them warm
- **For demos**: Hit the API gateway's health endpoint 1–2 minutes before the demo starts

### 9.2 Free-Tier Rate Limits
| Service | Free Tier Limit | What happens when hit |
|---------|-----------------|----------------------|
| **Neon Postgres** | 0.5 GB storage, 190 compute hours/mo | DB becomes read-only, then suspends |
| **Upstash Redis** | 10,000 commands/day | Commands rejected with error |
| **Redpanda** | 1 GB/day ingress | Messages rejected |
| **Gemini API** | 15 RPM / 1M tokens/day | 429 Too Many Requests |
| **Render** | 750 hours/month (across all services) | Services stop deploying |
| **Gmail SMTP** | ~500 emails/day | Sending blocked temporarily |

### 9.3 If Rate Limits Are Hit During a Demo
1. **Gemini 429**: The chatbot will show an error. Wait 60 seconds and retry. Reduce usage by asking fewer questions.
2. **Redis limit**: Seat locking will fall back gracefully (the app has a null-check fallback in `RedissonConfig`)
3. **Redpanda limit**: Booking events won't be published to Kafka. The booking still succeeds — email notifications just won't fire via the event-driven path.
4. **Render 750h limit**: With 7 services running 24/7, you'll burn ~5,040h/month. **This exceeds the free tier**. Options:
   - Deploy only during demo hours
   - Upgrade to a paid plan (~$7/service/month)
   - Use the cron-keep-alive only before demos, letting services sleep otherwise

### 9.4 JWT Secret Sync
The `JWT_SECRET` env var **must be identical** in `auth-service` and `api-gateway`. If they differ, the gateway will reject all authenticated requests with `401 Unauthorized`.

### 9.5 Database Schema Management
All services use `ddl-auto: update` which auto-creates/alters tables. This is fine for demos but:
- **Do NOT use in production with real data** — Hibernate's auto-DDL can cause data loss on schema changes
- For real production: switch to Flyway or Liquibase migrations

---

## Architecture Reference

```
┌──────────────┐     ┌──────────────────────────────────────────────────────┐
│   Vercel     │     │                    Render (Singapore)               │
│              │     │                                                      │
│  React/Vite  │────▶│  API Gateway ──▶ auth-service ──▶ Neon (auth DB)    │
│  Frontend    │     │       │                                              │
│              │     │       ├──────▶ flight-service ──▶ Neon (flight DB)   │
│              │     │       │                                              │
│              │     │       ├──────▶ booking-service ─▶ Neon (booking DB)  │
│              │     │       │           │    │                              │
│              │     │       │           │    └──▶ Upstash Redis             │
│              │     │       │           └──────▶ Redpanda (Kafka)           │
│              │     │       │                        │                      │
│              │     │       ├──────▶ payment-service ─▶ Neon (payment DB)  │
│              │     │       │                                              │
│              │     │       ├──────▶ notification-svc ◀── Redpanda         │
│              │     │       │           └──▶ Gmail SMTP                    │
│              │     │       │                                              │
│              │     │       └──────▶ genai-service ───▶ Neon + pgvector    │
│              │     │                   └──▶ Gemini API                    │
└──────────────┘     └──────────────────────────────────────────────────────┘
```
