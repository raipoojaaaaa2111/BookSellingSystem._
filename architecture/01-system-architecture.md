# System Architecture
## College Book Exchange Platform

**Version:** 1.0 | **Date:** October 12, 2026

---

## 1. Architecture Overview

The platform follows a **three-tier, API-first architecture** with a clear separation between the presentation layer (React SPA), the business logic layer (Node.js/Express REST API), and the data layer (MongoDB Atlas + Redis). All tiers communicate over HTTPS and are independently deployable on AWS.

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT TIER                              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         React SPA (Vite + TypeScript)                    │   │
│  │   Browser  /  Mobile Browser  /  PWA                     │   │
│  └──────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS / WSS
┌──────────────────────────────▼──────────────────────────────────┐
│                       EDGE / GATEWAY TIER                       │
│  ┌──────────────┐   ┌───────────────┐   ┌───────────────────┐   │
│  │  CloudFront  │   │  AWS WAF       │   │  Route 53 DNS     │   │
│  │  CDN (Static)│   │  (Rate Limit) │   │                   │   │
│  └──────────────┘   └───────────────┘   └───────────────────┘   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              API Gateway / AWS ALB (Load Balancer)         │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                      APPLICATION TIER                           │
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────────────┐    │
│  │  API Server          │    │  WebSocket Server             │    │
│  │  Node.js + Express   │    │  (Socket.io / ws)             │    │
│  │  (ECS Fargate)       │    │  (ECS Fargate)                │    │
│  └──────────┬──────────┘    └──────────────┬───────────────┘   v
│             │                               │                    │
│  ┌──────────▼───────────────────────────────▼───────────────┐   │
│  │              Internal Service Bus (AWS SQS)               │   │
│  └──────────────────────────┬────────────────────────────────┘   │
│                             │                                    │
│  ┌──────────────────────────▼────────────────────────────────┐   │
│  │               Background Workers (ECS Fargate)             │   │
│  │  • Email Worker (SendGrid)   • Notification Worker         │   │
│  │  • Escrow Release Worker     • Listing Expiry Worker       │   │
│  │  • Report Export Worker                                    │   │
│  └────────────────────────────────────────────────────────────┘   │
└──────────────────────────────┬──────────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────────┐
│                         DATA TIER                               │
│                                                                  │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────────────────┐  │
│  │  MongoDB Atlas    │  │  Redis        │  │  AWS S3            │  │
│  │  (Primary DB)     │  │  (Cache +     │  │  (Images, exports) │  │
│  │  Multi-AZ Replica │  │   Sessions)   │  │                   │  │
│  └──────────────────┘  └──────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite |
| State Management | Zustand (client) + React Query (server state) |
| Styling | Tailwind CSS + shadcn/ui |
| Real-time | Socket.io Client |
| Routing | React Router v6 |
| Forms | React Hook Form + Zod |
| HTTP Client | Axios |

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Framework | Express.js |
| Language | TypeScript |
| Auth | JWT (jsonwebtoken) + Passport.js |
| Real-time | Socket.io |
| Queue | BullMQ + Redis |
| Validation | Zod |
| ORM/ODM | Mongoose |
| Payments | Stripe SDK |
| Email | SendGrid |
| File Upload | Multer + AWS S3 SDK |
| ISBN Lookup | Open Library API |

### Data
| Store | Technology | Purpose |
|-------|-----------|---------|
| Primary DB | MongoDB Atlas | All application data |
| Cache | Redis (ElastiCache) | Sessions, rate limiting, queues |
| Object Storage | AWS S3 | Images, generated reports |
| Search | MongoDB Atlas Search | Full-text listing search |

### Infrastructure
| Component | Technology |
|-----------|-----------|
| Compute | AWS ECS Fargate (containers) |
| CDN | AWS CloudFront |
| DNS | AWS Route 53 |
| WAF | AWS WAF |
| Load Balancer | AWS Application Load Balancer |
| CI/CD | GitHub Actions |
| Containers | Docker |
| Secrets | AWS Secrets Manager |
| Monitoring | AWS CloudWatch + Datadog |

---

## 3. Component Interaction Flow

```
User Action (e.g., Buy Book)
        │
        ▼
React SPA  ──► Axios HTTP Request
        │
        ▼
CloudFront / ALB
        │
        ▼
Express API Server
   ├── Auth Middleware (JWT verify)
   ├── Rate Limiter (Redis)
   ├── Request Validator (Zod)
   ├── Route Handler
   │     ├── Business Logic
   │     ├── MongoDB Query (Mongoose)
   │     └── Stripe Charge (Payment)
   ├── Response
   └── SQS Message → Worker
             │
             ▼
       Email Worker → SendGrid → User Email
       Notification Worker → WebSocket → Browser
```

---

## 4. Multi-College Tenancy

The platform uses a **soft-multi-tenancy** model:
- A `college` collection stores all registered institutions.
- Every `user` document carries a `collegeId` foreign key.
- Every `listing` document carries a `collegeId` for scoped search.
- Admins are scoped by role: `platform_admin` (global) or `college_coordinator` (per-college).
- College-specific branding (logo, primary color) is stored per college and injected at runtime via a public `/colleges/:id/config` endpoint.

---

## 5. Scalability Strategy

| Concern | Strategy |
|---------|---------|
| API throughput | Horizontal scaling via ECS Fargate auto-scaling |
| DB read load | MongoDB Atlas read replicas + Redis query caching |
| Search | MongoDB Atlas Search (Lucene-based) with dedicated search nodes |
| File storage | AWS S3 with CloudFront CDN for image delivery |
| Background jobs | BullMQ workers scaled independently from API |
| WebSocket | Sticky sessions on ALB + Redis pub/sub for multi-node fan-out |
