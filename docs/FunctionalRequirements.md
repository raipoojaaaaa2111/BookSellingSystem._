# Functional Requirements
## College Book Exchange Platform

**Version:** 1.0  
**Date:** October 4, 2026  

---

## Overview

This document consolidates all functional requirements for the College Book Exchange platform. Requirements are grouped by feature module and follow the naming convention `FR-[MODULE]-[NUMBER]`.

---

## Module Index

| Module | Prefix | Description |
|--------|--------|-------------|
| Authentication | FR-AUTH | Registration, login, SSO, password management |
| Profile | FR-PROF | User profile and account management |
| Listings | FR-LIST | Book listing creation and management |
| Search | FR-SRCH | Search, filtering, and discovery |
| Buy/Sell | FR-BUY | Purchase and payment transactions |
| Exchange | FR-XCHG | Book-for-book swap workflows |
| Donations | FR-DON | Free book donations and college drives |
| Messaging | FR-MSG | In-platform messaging system |
| Ratings | FR-RATE | Post-transaction ratings and reviews |
| Notifications | FR-NOTIF | Email and in-app alert system |
| Administration | FR-ADMIN | Moderation, disputes, reporting |
| Analytics | FR-ANLYT | Admin dashboards and data exports |

---

## FR-AUTH — Authentication

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-AUTH-01 | MUST | The system shall allow user registration using a college-issued email address. |
| FR-AUTH-02 | MUST | The system shall send an email verification link immediately upon registration. |
| FR-AUTH-03 | MUST | The system shall reject registration attempts from email domains not on the college allow-list. |
| FR-AUTH-04 | MUST | The system shall support OAuth 2.0 SSO login via college identity providers. |
| FR-AUTH-05 | MUST | The system shall enforce password complexity: minimum 8 characters with at least one uppercase letter, one digit, and one special character. |
| FR-AUTH-06 | MUST | The system shall lock an account after 5 consecutive failed login attempts and send an unlock email. |
| FR-AUTH-07 | MUST | The system shall support password reset via a time-limited token that expires after 60 minutes. |
| FR-AUTH-08 | MUST | The system shall issue JWT access tokens (15-minute expiry) and refresh tokens (7-day expiry) upon successful login. |
| FR-AUTH-09 | MUST | The system shall invalidate refresh tokens on logout. |
| FR-AUTH-10 | SHOULD | The system shall support optional two-factor authentication (2FA) via authenticator app (TOTP). |

---

## FR-PROF — User Profile

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-PROF-01 | MUST | The system shall allow users to upload a profile photo (JPG, PNG, WebP; max 5 MB). |
| FR-PROF-02 | MUST | The system shall display a user's average star rating and total completed transaction count on their public profile. |
| FR-PROF-03 | MUST | The system shall allow users to set their preferred college campus and notification preferences. |
| FR-PROF-04 | MUST | The system shall allow users to view their full transaction history segmented by type: Bought, Sold, Exchanged, Donated. |
| FR-PROF-05 | MUST | The system shall allow users to save listings to a personal watchlist. |
| FR-PROF-06 | MUST | The system shall allow users to deactivate or permanently delete their account. |
| FR-PROF-07 | SHOULD | The system shall allow users to set a public bio (max 300 characters). |
| FR-PROF-08 | SHOULD | The system shall display a "Member since" date on each public profile. |

---

## FR-LIST — Book Listings

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-LIST-01 | MUST | The system shall allow authenticated users to create a listing with: title, author, ISBN, edition, course/subject, condition, transaction type, and at least one photo. |
| FR-LIST-02 | MUST | The system shall auto-populate book metadata (title, author, cover image, publisher) via an ISBN lookup API when an ISBN is entered. |
| FR-LIST-03 | MUST | The system shall allow a listing to be tagged as For Sale, For Exchange, For Donation, or any combination. |
| FR-LIST-04 | MUST | The system shall require an asking price (≥ $0.01) for listings tagged For Sale. |
| FR-LIST-05 | MUST | The system shall allow the seller to specify desired books or subjects for exchange listings. |
| FR-LIST-06 | MUST | The system shall allow users to edit any field of their active listings. |
| FR-LIST-07 | MUST | The system shall allow users to manually close a listing with a status of Sold, Exchanged, or Donated. |
| FR-LIST-08 | MUST | The system shall auto-deactivate listings after 90 days, preceded by a 7-day expiry warning notification. |
| FR-LIST-09 | MUST | The system shall allow users to delete their own listings at any time. |
| FR-LIST-10 | MUST | The system shall support up to 10 photos per listing (JPG, PNG, WebP; max 10 MB each). |
| FR-LIST-11 | MUST | The system shall record a view count for each listing. |
| FR-LIST-12 | SHOULD | The system shall allow sellers to specify a preferred meeting location for in-person pickups. |
| FR-LIST-13 | COULD | The system shall allow sellers to offer shipping and specify whether shipping cost is included or extra. |

---

## FR-SRCH — Search and Discovery

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-SRCH-01 | MUST | The system shall provide full-text search across: book title, author, ISBN, course name, and description. |
| FR-SRCH-02 | MUST | The system shall support filtering by: transaction type, book condition, price range, college/campus, subject, and date posted. |
| FR-SRCH-03 | MUST | The system shall support sorting by: relevance, price ascending, price descending, date posted (newest/oldest), and seller rating. |
| FR-SRCH-04 | MUST | Each search result card shall display: thumbnail, title, transaction type badge, price or Free label, condition, and seller rating. |
| FR-SRCH-05 | MUST | The system shall return results within 2 seconds for catalogs up to 50,000 active listings. |
| FR-SRCH-06 | SHOULD | The system shall allow authenticated users to save search queries as alert subscriptions with instant or daily-digest delivery. |
| FR-SRCH-07 | SHOULD | The system shall notify subscribed users when a new listing matches their saved search. |
| FR-SRCH-08 | COULD | The system shall display a "Similar Listings" section on each listing detail page. |

---

## FR-BUY — Buy / Sell Transactions

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-BUY-01 | MUST | The system shall allow authenticated students to initiate a purchase on any active For Sale listing. |
| FR-BUY-02 | MUST | The system shall process payments through a PCI-DSS compliant third-party payment gateway. |
| FR-BUY-03 | MUST | The system shall hold buyer payment in escrow until the buyer confirms receipt of the book. |
| FR-BUY-04 | MUST | The system shall release escrow funds to the seller within 3 business days of buyer confirmation, or automatically after 7 days post-shipment with no dispute raised. |
| FR-BUY-05 | MUST | The system shall email a transaction receipt to both buyer and seller upon payment completion. |
| FR-BUY-06 | MUST | The system shall support in-person pickup and postal/courier shipping as delivery methods. |
| FR-BUY-07 | MUST | The system shall allow a buyer to raise a dispute within 72 hours of confirming receipt. |
| FR-BUY-08 | MUST | The system shall deduct a configurable platform fee (default 5%) from the seller's payout before release. |
| FR-BUY-09 | MUST | The system shall prevent a user from purchasing their own listing. |
| FR-BUY-10 | SHOULD | The system shall allow buyers to make a counter-offer on the listed price. |

---

## FR-XCHG — Book Exchange

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-XCHG-01 | MUST | The system shall allow a user to propose an exchange by selecting one of their own active listings as the offered book. |
| FR-XCHG-02 | MUST | The system shall notify the listing owner of an incoming exchange proposal via in-app and email notification. |
| FR-XCHG-03 | MUST | The system shall allow the listing owner to accept, decline, or counter an exchange proposal. |
| FR-XCHG-04 | MUST | Upon mutual acceptance and handoff confirmation from both parties, the system shall mark both listings as Exchanged. |
| FR-XCHG-05 | MUST | The system shall support in-person and shipped exchange arrangements coordinated via the messaging system. |
| FR-XCHG-06 | MUST | Exchange transactions shall not involve any monetary payment through the platform. |
| FR-XCHG-07 | SHOULD | A proposal that is not accepted within 7 days shall expire automatically. |

---

## FR-DON — Book Donations

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-DON-01 | MUST | The system shall allow a user to list a book as a free donation. |
| FR-DON-02 | MUST | The system shall allow any authenticated student to claim a donation on a first-come, first-served basis. |
| FR-DON-03 | MUST | The system shall support college-organized donation drives with coordinator-managed drop-off locations. |
| FR-DON-04 | MUST | The system shall allow the donor to specify preferred pickup or shipping preferences. |
| FR-DON-05 | MUST | The system shall send a confirmation notification to both donor and recipient when a donation is claimed and completed. |
| FR-DON-06 | SHOULD | The system shall display a count of total books donated per user on their profile. |

---

## FR-MSG — Messaging

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-MSG-01 | MUST | The system shall allow two authenticated users engaged in a listing inquiry or transaction to exchange messages via an in-platform inbox. |
| FR-MSG-02 | MUST | The system shall deliver new message notifications via in-app alert and email within 60 seconds. |
| FR-MSG-03 | MUST | The system shall allow users to report and block other users from within a message thread. |
| FR-MSG-04 | MUST | The system shall retain message history for a minimum of 12 months. |
| FR-MSG-05 | MUST | The system shall not expose users' personal contact information (phone numbers, personal email) in messages by default. |
| FR-MSG-06 | MUST | The system shall allow admins to view flagged message threads for moderation. |
| FR-MSG-07 | SHOULD | The system shall support real-time message delivery via WebSockets for active sessions. |
| FR-MSG-08 | SHOULD | The system shall display a read receipt indicator when the recipient has viewed a message. |

---

## FR-RATE — Ratings and Reviews

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-RATE-01 | MUST | The system shall prompt both parties to submit a 1–5 star rating and optional written review within 14 days of transaction completion. |
| FR-RATE-02 | MUST | The system shall display a user's average rating and total review count on their public profile. |
| FR-RATE-03 | MUST | The system shall allow a reviewed user to post one response per review. |
| FR-RATE-04 | MUST | The system shall allow any user to flag a review as inappropriate for admin inspection. |
| FR-RATE-05 | MUST | The system shall prevent users from rating themselves. |
| FR-RATE-06 | MUST | The system shall restrict each party to one rating per completed transaction. |
| FR-RATE-07 | SHOULD | The system shall close the rating window automatically after 14 days with no reminder notification. |

---

## FR-NOTIF — Notifications

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-NOTIF-01 | MUST | The system shall send email notifications for: account verification, transaction status changes, new messages, listing expiry warnings, and saved-search matches. |
| FR-NOTIF-02 | MUST | The system shall display in-app notifications in a notification center accessible from the main navigation bar. |
| FR-NOTIF-03 | MUST | The system shall allow users to configure notification preferences per category (Messages, Transactions, Listing Expiry, Search Alerts, Platform News) for both email and in-app channels independently. |
| FR-NOTIF-04 | MUST | The system shall mark notifications as read when a user opens them. |
| FR-NOTIF-05 | SHOULD | The system shall support batch notification digests (daily summary email) as an alternative to instant notifications. |

---

## FR-ADMIN — Administration and Moderation

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-ADMIN-01 | MUST | The system shall provide an admin dashboard showing: active listing count, transactions this month, open disputes, flagged content, and new registrations today. |
| FR-ADMIN-02 | MUST | The system shall allow admins to search, view, and remove any listing with a mandatory reason selection. |
| FR-ADMIN-03 | MUST | The system shall allow admins to apply a time-limited suspension or permanent ban to any user account. |
| FR-ADMIN-04 | MUST | The system shall allow admins to review open disputes and issue full or partial refunds from escrow. |
| FR-ADMIN-05 | MUST | The system shall allow admins to manage the college email domain allow-list (add, edit, remove). |
| FR-ADMIN-06 | MUST | The system shall log all admin actions with the acting admin's ID, action type, target entity, reason, and timestamp. |
| FR-ADMIN-07 | MUST | The system shall automatically deactivate all active listings when a user is banned. |
| FR-ADMIN-08 | SHOULD | The system shall send the affected user an email notification when their listing is removed or account is suspended/banned, including the reason and any appeal process. |

---

## FR-ANLYT — Analytics and Reporting

| ID | Priority | Requirement |
|----|----------|-------------|
| FR-ANLYT-01 | MUST | The system shall generate exportable Transaction Summary reports in CSV and PDF format with a configurable date range filter. |
| FR-ANLYT-02 | MUST | The system shall generate exportable Listing Activity, User Registrations, and Disputes Log reports. |
| FR-ANLYT-03 | SHOULD | The system shall display 7-day and 30-day trend charts on the admin dashboard for key metrics. |
| FR-ANLYT-04 | SHOULD | Large report exports (>10,000 rows) shall be generated asynchronously and delivered via email when ready. |
| FR-ANLYT-05 | COULD | The system shall provide per-college analytics to College Coordinators scoped to their institution. |

---

## Priority Key

| Label | Meaning |
|-------|---------|
| MUST | Required for launch — platform cannot function without it. |
| SHOULD | High value, planned for launch but deferrable if necessary. |
| COULD | Nice-to-have, considered for a future release. |
| WONT | Explicitly out of scope for v1.0. |

---

*End of Functional Requirements — College Book Exchange Platform v1.0*
