# Software Requirements Specification (SRS)
## College Book Exchange Platform

**Version:** 1.0  
**Date:** October 4, 2026  
**Status:** Draft  

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Constraints and Assumptions](#6-constraints-and-assumptions)
7. [Glossary](#7-glossary)

---

## 1. Introduction

### 1.1 Purpose

This document defines the software requirements for the **College Book Exchange** platform — a web-based application that enables college students to buy, sell, exchange, and donate textbooks and academic materials directly with one another. The system reduces the financial burden of acquiring course materials by creating a trusted, campus-connected marketplace.

### 1.2 Scope

The College Book Exchange platform (hereafter "the System") provides:

- A searchable catalog of available books listed by student sellers and donors.
- Transaction workflows for purchases, exchanges, and donations.
- A messaging system for buyer–seller communication.
- A rating and review system to build community trust.
- An administrative portal for moderation and reporting.

The platform is scoped to students and staff of one or more registered colleges. Integration with external payment processors and college enrollment systems is within scope for the initial release.

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|-----------|
| SRS | Software Requirements Specification |
| User | Any authenticated person using the platform |
| Student | A verified college student with an active account |
| Listing | A book posted by a student for sale, exchange, or donation |
| Transaction | A completed sale, exchange, or donation between two users |
| Admin | Platform administrator with moderation privileges |
| ISBN | International Standard Book Number |
| SSO | Single Sign-On via an institutional identity provider |
| PCI-DSS | Payment Card Industry Data Security Standard |
| FERPA | Family Educational Rights and Privacy Act |

### 1.4 References

- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications  
- WCAG 2.1 AA — Web Content Accessibility Guidelines  
- FERPA — Family Educational Rights and Privacy Act  
- PCI-DSS v4.0 — Payment Card Industry Data Security Standard  

### 1.5 Overview

Section 2 describes the product context and user classes. Section 3 covers detailed system features. Sections 4–6 address interface, non-functional, and constraint requirements. Section 7 is the glossary.

---

## 2. Overall Description

### 2.1 Product Perspective

The System is a standalone web application accessible via modern desktop and mobile browsers. It interfaces with:

- **College SSO / Email Verification** — to confirm student enrollment status.
- **Payment Gateway (e.g., Stripe)** — to process monetary transactions securely.
- **Cloud Storage (e.g., AWS S3)** — for book cover and listing image uploads.
- **Email / SMS Notification Service** — for transactional alerts and confirmations.
- **ISBN Lookup API** — for automatic book metadata retrieval.

### 2.2 Product Functions Summary

| Function | Description |
|----------|-------------|
| Account Management | Register, verify, login, and manage user profiles |
| Book Listings | Create, edit, search, and browse book listings |
| Buy / Sell | Monetary transactions between students |
| Exchange | Book-for-book trades with no money involved |
| Donate | Free give-away listings and college donation drives |
| Messaging | In-platform chat between transacting users |
| Ratings & Reviews | Post-transaction peer feedback |
| Notifications | Email and in-app alerts |
| Administration | Moderation, dispute resolution, user management |
| Analytics | Admin dashboards and exportable reports |

### 2.3 User Classes and Characteristics

#### 2.3.1 Student (Primary User)
- Enrolled at a registered college, verified via college email or SSO.
- Can create listings, initiate transactions, message peers, and leave ratings.
- Expected technical proficiency: basic smartphone and web literacy.

#### 2.3.2 Guest (Unauthenticated Visitor)
- Can browse and search listings in read-only mode.
- Cannot contact sellers or initiate any transaction.
- Prompted to register when attempting restricted actions.

#### 2.3.3 Platform Administrator
- College staff or platform operator with full moderation rights.
- Can remove listings, suspend accounts, resolve disputes, and export reports.

#### 2.3.4 College Coordinator (Optional Role)
- Designated staff member per institution.
- Can manage donation drives and drop-off points.
- Holds a subset of admin privileges scoped to their college.

### 2.4 Operating Environment

- **Web:** Chrome 110+, Firefox 110+, Safari 16+, Edge 110+
- **Mobile:** Responsive design targeting iOS 15+ and Android 11+
- **Server:** Cloud-hosted (AWS or GCP), minimum 99.5% uptime SLA
- **Database:** PostgreSQL for transactional data; object storage for media assets

### 2.5 Design and Implementation Constraints

- All student data must comply with FERPA regulations.
- Payment processing must be PCI-DSS compliant via a certified third-party gateway.
- No raw payment card data may be stored on platform servers.
- The platform must support a minimum of 5,000 concurrent users at launch.

### 2.6 Assumptions and Dependencies

- Students possess a valid college-issued email address.
- The institution's email domain is registered with the platform prior to student access.
- A payment gateway contract is established before the platform goes live.
- Users have access to a camera or scanner for uploading book condition photos.

---

## 3. System Features

### 3.1 User Registration and Authentication

**Description:** Students register with a college email. The system sends a verification link. SSO via OAuth 2.0 is supported as an alternative path.

| ID | Requirement |
|----|-------------|
| FR-AUTH-01 | The system shall allow registration using a college-issued email address. |
| FR-AUTH-02 | The system shall send an email verification link upon registration. |
| FR-AUTH-03 | The system shall reject registration from non-whitelisted email domains. |
| FR-AUTH-04 | The system shall support OAuth 2.0 SSO login with college identity providers. |
| FR-AUTH-05 | The system shall enforce password complexity: minimum 8 characters with at least one uppercase letter, one digit, and one special character. |
| FR-AUTH-06 | The system shall lock an account after 5 consecutive failed login attempts and send an unlock email. |
| FR-AUTH-07 | The system shall support password reset via a time-limited token expiring after 60 minutes. |
| FR-AUTH-08 | The system shall maintain authenticated sessions with a configurable expiry (default: 7 days). |

---

### 3.2 User Profile Management

**Description:** Each student has a profile showing their activity, ratings, and preferences.

| ID | Requirement |
|----|-------------|
| FR-PROF-01 | The system shall allow users to upload a profile photo. |
| FR-PROF-02 | The system shall display a user's average star rating and total completed transaction count. |
| FR-PROF-03 | The system shall allow users to set their preferred college campus and notification preferences. |
| FR-PROF-04 | The system shall allow users to view their full transaction history (bought, sold, exchanged, donated). |
| FR-PROF-05 | The system shall allow users to save and manage a watchlist of listings. |
| FR-PROF-06 | The system shall allow users to deactivate or permanently delete their account. |

---

### 3.3 Book Listing Management

**Description:** Students post books they want to sell, exchange, or donate, with details, condition, and photos.

| ID | Requirement |
|----|-------------|
| FR-LIST-01 | The system shall allow authenticated users to create a listing including: title, author, ISBN, edition, course/subject, condition, and at least one photo. |
| FR-LIST-02 | The system shall auto-populate book metadata (title, author, cover image) via an ISBN lookup API. |
| FR-LIST-03 | The system shall allow a listing to be tagged as For Sale, For Exchange, For Donation, or any combination. |
| FR-LIST-04 | The system shall allow the poster to set an asking price for sale listings. |
| FR-LIST-05 | The system shall allow the poster to specify desired books in return for exchange listings. |
| FR-LIST-06 | The system shall allow users to edit their active listings at any time before completion. |
| FR-LIST-07 | The system shall allow users to manually close a listing by marking it as Sold, Exchanged, or Donated. |
| FR-LIST-08 | The system shall auto-deactivate listings after 90 days, preceded by a 7-day expiry warning notification. |
| FR-LIST-09 | The system shall allow users to delete their own listings at any time. |
| FR-LIST-10 | The system shall support up to 10 photos per listing. |

---

### 3.4 Search and Discovery

**Description:** All users, including guests, can search and filter the book catalog.

| ID | Requirement |
|----|-------------|
| FR-SRCH-01 | The system shall provide full-text search across book title, author, ISBN, and course name. |
| FR-SRCH-02 | The system shall support filtering by: transaction type, book condition, price range, college/campus, subject, and date posted. |
| FR-SRCH-03 | The system shall support sorting by: relevance, price (ascending and descending), date posted, and seller rating. |
| FR-SRCH-04 | Each search result card shall display: thumbnail, title, transaction type, price or free indicator, condition, and seller rating. |
| FR-SRCH-05 | The system shall allow authenticated users to save search queries as alert subscriptions. |
| FR-SRCH-06 | The system shall notify subscribed users when a new listing matches a saved search. |
| FR-SRCH-07 | The system shall return search results within 2 seconds for catalogs of up to 50,000 listings. |

---

### 3.5 Buy / Sell Transactions

**Description:** Buyers purchase books from sellers via a secure, escrow-backed payment flow.

| ID | Requirement |
|----|-------------|
| FR-BUY-01 | The system shall allow authenticated students to initiate a purchase on any active For Sale listing. |
| FR-BUY-02 | The system shall process payments via a PCI-DSS compliant third-party payment gateway. |
| FR-BUY-03 | The system shall hold buyer payment in escrow until the buyer confirms receipt of the book. |
| FR-BUY-04 | The system shall release escrow funds to the seller within 3 business days of buyer confirmation, or automatically after 7 days post-shipment with no dispute. |
| FR-BUY-05 | The system shall email a transaction receipt to both buyer and seller upon completion. |
| FR-BUY-06 | The system shall support in-person pickup and postal/courier shipping as delivery options. |
| FR-BUY-07 | The system shall allow a buyer to raise a dispute within 72 hours of confirming receipt. |
| FR-BUY-08 | The system shall deduct a configurable platform fee (default 5%) from the seller's payout before release. |

---

### 3.6 Book Exchange

**Description:** Students propose book-for-book swaps, with no money changing hands.

| ID | Requirement |
|----|-------------|
| FR-XCHG-01 | The system shall allow a user to propose an exchange by offering one of their own active listings. |
| FR-XCHG-02 | The system shall notify the listing owner of an incoming exchange proposal. |
| FR-XCHG-03 | The system shall allow the listing owner to accept, decline, or counter an exchange proposal. |
| FR-XCHG-04 | Upon mutual acceptance and handoff confirmation, the system shall mark both listings as Exchanged. |
| FR-XCHG-05 | The system shall support both in-person and shipped exchange arrangements. |
| FR-XCHG-06 | Exchange transactions shall involve no monetary payment through the platform. |

---

### 3.7 Book Donations

**Description:** Students give books away for free, either directly to a peer or via a college donation drive.

| ID | Requirement |
|----|-------------|
| FR-DON-01 | The system shall allow a user to list a book as a free donation. |
| FR-DON-02 | The system shall allow any authenticated student to claim a donation on a first-come, first-served basis. |
| FR-DON-03 | The system shall support college-organized donation drives with designated drop-off locations. |
| FR-DON-04 | The system shall allow the donor to specify pickup or shipping preferences. |
| FR-DON-05 | The system shall send a confirmation notification to both donor and recipient upon completion. |

---

### 3.8 Messaging System

**Description:** In-platform chat lets transacting users coordinate without sharing personal contact details.

| ID | Requirement |
|----|-------------|
| FR-MSG-01 | The system shall allow two users engaged in a transaction to exchange messages via an in-platform inbox. |
| FR-MSG-02 | The system shall notify a user of a new message via in-app notification and email. |
| FR-MSG-03 | The system shall allow users to report and block other users directly from a message thread. |
| FR-MSG-04 | The system shall retain message history for a minimum of 12 months. |
| FR-MSG-05 | The system shall not expose personal contact information (phone numbers, personal email addresses) by default. |
| FR-MSG-06 | The system shall allow admins to view flagged message threads for moderation. |

---

### 3.9 Ratings and Reviews

**Description:** Both parties rate each other after every completed transaction to build a trust reputation.

| ID | Requirement |
|----|-------------|
| FR-RATE-01 | The system shall prompt both parties to submit a 1–5 star rating and optional written review within 14 days of transaction completion. |
| FR-RATE-02 | The system shall display a user's average rating and total review count on their public profile. |
| FR-RATE-03 | The system shall allow a user to post a response to a review left on their profile. |
| FR-RATE-04 | The system shall allow users to flag reviews as inappropriate for admin review. |
| FR-RATE-05 | The system shall prevent users from rating themselves. |
| FR-RATE-06 | The system shall allow only one rating per party per completed transaction. |

---

### 3.10 Notifications

**Description:** The system delivers timely in-app and email alerts for all key events.

| ID | Requirement |
|----|-------------|
| FR-NOTIF-01 | The system shall send email notifications for: account verification, transaction status changes, new messages, listing expiry warnings, and saved-search matches. |
| FR-NOTIF-02 | The system shall display in-app notifications in a notification center accessible from the main navigation. |
| FR-NOTIF-03 | The system shall allow users to configure notification preferences by category (opt-in / opt-out). |
| FR-NOTIF-04 | The system shall mark notifications as read when a user views them. |

---

### 3.11 Administration and Moderation

**Description:** Admins maintain platform health through moderation tools, dispute resolution, and reporting.

| ID | Requirement |
|----|-------------|
| FR-ADMIN-01 | The system shall provide an admin dashboard showing counts of: active listings, completed transactions, open disputes, and flagged content. |
| FR-ADMIN-02 | The system shall allow admins to remove any listing that violates platform policies. |
| FR-ADMIN-03 | The system shall allow admins to suspend or permanently ban user accounts. |
| FR-ADMIN-04 | The system shall allow admins to review and resolve disputes, including issuing full or partial refunds from escrow. |
| FR-ADMIN-05 | The system shall allow admins to manage registered college email domains and college coordinators. |
| FR-ADMIN-06 | The system shall log all admin actions with a timestamp and the acting admin's ID for audit purposes. |
| FR-ADMIN-07 | The system shall generate exportable reports (CSV/PDF) on transactions, listings, and user activity. |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- Responsive web UI for desktop (1280 px+) and mobile (375 px+).
- WCAG 2.1 AA accessibility compliance throughout.
- Primary navigation: Browse, My Listings, Messages, Notifications, Profile.
- College branding customization: logo and primary color theming.

### 4.2 Hardware Interfaces

- No proprietary hardware dependencies.
- Camera access via the browser Media Capture API for mobile photo uploads.

### 4.3 Software Interfaces

| External System | Purpose | Protocol |
|-----------------|---------|----------|
| College SSO (OAuth 2.0) | Student identity verification | HTTPS / OAuth 2.0 |
| ISBN Lookup API (Open Library / Google Books) | Book metadata auto-fill | HTTPS / REST |
| Payment Gateway (e.g., Stripe) | Payment processing and escrow | HTTPS / REST SDK |
| Cloud Storage (e.g., AWS S3) | Image and file storage | HTTPS / SDK |
| Email Service (e.g., SendGrid) | Transactional and notification emails | HTTPS / SMTP |
| SMS Gateway (optional) | SMS alert delivery | HTTPS / REST |

### 4.4 Communications Interfaces

- All client–server traffic over HTTPS with TLS 1.2 or higher.
- WebSockets for real-time in-app messaging and live notification delivery.

---

## 5. Non-Functional Requirements

### 5.1 Performance

| ID | Requirement |
|----|-------------|
| NFR-PERF-01 | Page load time shall not exceed 3 seconds on a 25 Mbps broadband connection. |
| NFR-PERF-02 | Search results shall be returned within 2 seconds for catalogs up to 50,000 active listings. |
| NFR-PERF-03 | The system shall support 5,000 concurrent users without measurable performance degradation. |
| NFR-PERF-04 | API responses shall be under 500 ms at the 95th percentile under normal load. |

### 5.2 Reliability and Availability

| ID | Requirement |
|----|-------------|
| NFR-REL-01 | The system shall maintain 99.5% uptime, excluding announced maintenance windows. |
| NFR-REL-02 | Scheduled maintenance windows shall not exceed 4 hours per month and shall be announced 48 hours in advance. |
| NFR-REL-03 | The system shall perform daily automated database backups retained for 30 days. |
| NFR-REL-04 | Recovery Time Objective (RTO): 4 hours. Recovery Point Objective (RPO): 24 hours. |

### 5.3 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-01 | All data in transit shall be encrypted with TLS 1.2 or higher. |
| NFR-SEC-02 | User passwords shall be hashed with bcrypt at a minimum cost factor of 12. |
| NFR-SEC-03 | The platform shall implement mitigations for all OWASP Top 10 vulnerabilities. |
| NFR-SEC-04 | No raw payment card data shall be stored on platform servers (PCI-DSS SAQ A). |
| NFR-SEC-05 | Authentication endpoints shall be rate-limited to prevent brute-force attacks. |
| NFR-SEC-06 | Session tokens shall be invalidated immediately upon logout or expiry. |

### 5.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-01 | A new user shall be able to create their first listing within 5 minutes of completing registration. |
| NFR-USE-02 | The platform shall meet WCAG 2.1 Level AA accessibility standards. |
| NFR-USE-03 | The UI shall be delivered in English with an extensible i18n framework for future language support. |

### 5.5 Maintainability and Scalability

| ID | Requirement |
|----|-------------|
| NFR-MAINT-01 | The system shall use a modular architecture that allows individual features to be updated or replaced independently. |
| NFR-MAINT-02 | The system shall be horizontally scalable to onboard new colleges without architectural changes. |
| NFR-MAINT-03 | Core business logic shall maintain a minimum of 80% automated test coverage. |

---

## 6. Constraints and Assumptions

### 6.1 Constraints

- Platform access is limited to enrolled students of registered institutions; guests may browse only.
- Monetary transactions are limited to currencies and regions supported by the chosen payment gateway.
- Book listings are restricted to academic and educational materials; enforcement is moderation-based.

### 6.2 Assumptions

- Students have reliable internet access via campus Wi-Fi or a personal mobile data plan.
- Partner colleges will allow use of their email domain or SSO system for student verification.
- Each college will designate at least one administrator for onboarding and ongoing moderation.
- The ISBN Lookup API offers rate limits adequate for expected platform traffic volumes.

---

## 7. Glossary

| Term | Definition |
|------|-----------|
| Escrow | Funds held by the platform pending transaction confirmation by both parties. |
| Listing | A book entry created by a student describing its availability and transaction type. |
| Exchange | A book-for-book swap between two students involving no monetary payment. |
| Donation | A book given freely to another student or to a college donation drive. |
| Condition | A standardized description of a book's physical state: New, Like New, Good, Fair, or Poor. |
| Platform Fee | A percentage of the sale price retained by the platform operator on completed sales. |
| Dispute | A formal complaint by a buyer when the received book does not match the listing. |
| SSO | Single Sign-On — federated login via an institutional identity provider. |
| ISBN | International Standard Book Number — a unique identifier for each book edition. |

---

*End of SRS — College Book Exchange Platform v1.0*
