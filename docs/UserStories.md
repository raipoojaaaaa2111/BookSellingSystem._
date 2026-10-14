# User Stories
## College Book Exchange Platform

**Version:** 1.0  
**Date:** October 4, 2026  

---

## Table of Contents

1. [Guest / Unauthenticated User](#1-guest--unauthenticated-user)
2. [Student — Registration & Profile](#2-student--registration--profile)
3. [Student — Book Listings](#3-student--book-listings)
4. [Student — Buying Books](#4-student--buying-books)
5. [Student — Selling Books](#5-student--selling-books)
6. [Student — Exchanging Books](#6-student--exchanging-books)
7. [Student — Donating Books](#7-student--donating-books)
8. [Student — Messaging](#8-student--messaging)
9. [Student — Ratings & Reviews](#9-student--ratings--reviews)
10. [Student — Notifications & Search Alerts](#10-student--notifications--search-alerts)
11. [Platform Administrator](#11-platform-administrator)
12. [College Coordinator](#12-college-coordinator)

---

## 1. Guest / Unauthenticated User

---

**US-G-01**  
**As a** guest visiting the platform,  
**I want to** browse available book listings without creating an account,  
**So that** I can see what books are available before deciding to register.

*Acceptance Criteria:*
- Listings are visible to unauthenticated visitors.
- Listing detail pages (title, author, condition, price/type, photos) are viewable without login.
- Attempting to contact a seller or initiate a transaction redirects to the registration page.

---

**US-G-02**  
**As a** guest,  
**I want to** search and filter the book catalog by title, author, ISBN, course, and condition,  
**So that** I can quickly check if a specific book I need is available.

*Acceptance Criteria:*
- Search bar and filter panel are accessible without login.
- Results are returned within 2 seconds.
- Filter options include: transaction type, condition, price range, campus, and subject.

---

**US-G-03**  
**As a** guest,  
**I want to** register for an account using my college email,  
**So that** I can start buying, selling, exchanging, or donating books.

*Acceptance Criteria:*
- Registration form accepts college email addresses only.
- A verification email is sent immediately after form submission.
- Non-college email domains are rejected with a clear error message.

---

## 2. Student — Registration & Profile

---

**US-REG-01**  
**As a** new student,  
**I want to** verify my college email to activate my account,  
**So that** the platform confirms I am a genuine enrolled student.

*Acceptance Criteria:*
- Verification email arrives within 2 minutes of registration.
- The verification link expires after 24 hours.
- Clicking the link activates the account and redirects to profile setup.

---

**US-REG-02**  
**As a** student,  
**I want to** log in using my college's Single Sign-On (SSO),  
**So that** I don't need to remember a separate password for the platform.

*Acceptance Criteria:*
- An "Login with College SSO" option is present on the login page.
- Successful SSO authentication creates or links an existing platform account.
- Failed SSO authentication shows a descriptive error message.

---

**US-REG-03**  
**As a** student,  
**I want to** reset my password if I forget it,  
**So that** I can regain access to my account without contacting support.

*Acceptance Criteria:*
- A "Forgot Password" link is accessible from the login page.
- A reset email with a secure link is sent within 2 minutes.
- The reset link expires after 60 minutes.
- After resetting, the old password no longer works.

---

**US-REG-04**  
**As a** student,  
**I want to** complete a profile with my name, photo, campus, and contact preferences,  
**So that** other students know who they are dealing with.

*Acceptance Criteria:*
- Profile fields: display name, profile photo, college campus, bio (optional).
- Photo upload accepts JPG, PNG, and WebP formats up to 5 MB.
- Profile is visible to other authenticated students.

---

**US-REG-05**  
**As a** student,  
**I want to** view my transaction history on my profile,  
**So that** I can keep track of all the books I have bought, sold, exchanged, and donated.

*Acceptance Criteria:*
- History is split into tabs: Bought, Sold, Exchanged, Donated.
- Each entry shows: book title, date, counterpart's name, and transaction status.
- History is paginated at 20 items per page.

---

**US-REG-06**  
**As a** student,  
**I want to** delete my account when I no longer need the platform,  
**So that** my personal data is removed from the system.

*Acceptance Criteria:*
- Account deletion requires password confirmation.
- Active listings are automatically closed upon deletion.
- User is notified by email confirming deletion.
- Account data is purged within 30 days per the privacy policy.

---

## 3. Student — Book Listings

---

**US-LIST-01**  
**As a** student,  
**I want to** create a listing for a book I want to sell,  
**So that** other students can find and purchase it from me.

*Acceptance Criteria:*
- Listing form requires: title, author, condition, at least one photo, and a price.
- ISBN entry triggers an auto-fill of title, author, and cover image.
- Listing is live and searchable immediately after submission.

---

**US-LIST-02**  
**As a** student,  
**I want to** tag my listing as available for sale, exchange, donation, or multiple options,  
**So that** I give buyers flexibility in how they can acquire the book.

*Acceptance Criteria:*
- At least one transaction type must be selected.
- Multiple tags can be applied to a single listing.
- Each tag displays distinctly on the listing card in search results.

---

**US-LIST-03**  
**As a** student,  
**I want to** upload up to 10 photos of the book,  
**So that** potential buyers can clearly see the book's actual condition.

*Acceptance Criteria:*
- Up to 10 images accepted per listing.
- Accepted formats: JPG, PNG, WebP; max 10 MB per image.
- First image is used as the listing thumbnail.
- Images can be reordered by drag and drop.

---

**US-LIST-04**  
**As a** student,  
**I want to** edit my listing after posting it,  
**So that** I can update the price, condition, or photos if details change.

*Acceptance Criteria:*
- All listing fields are editable while the listing is active.
- Edits are saved and reflected immediately.
- A buyer who has messaged about the listing is not automatically notified of edits (notification is optional).

---

**US-LIST-05**  
**As a** student,  
**I want to** be reminded before my listing expires after 90 days,  
**So that** I can renew it if the book is still available.

*Acceptance Criteria:*
- Email and in-app notification sent 7 days before the 90-day expiry.
- Notification includes a one-click "Renew for 90 days" link.
- Expired listings are deactivated and no longer appear in search results.

---

**US-LIST-06**  
**As a** student,  
**I want to** mark my listing as sold, exchanged, or donated once completed,  
**So that** other students stop contacting me about it.

*Acceptance Criteria:*
- Closing a listing prompts a rating request for the counterpart.
- Closed listings are removed from search results but remain in the user's history.
- Listing status badge updates immediately.

---

## 4. Student — Buying Books

---

**US-BUY-01**  
**As a** student looking to buy a textbook,  
**I want to** find it quickly by searching its ISBN or course code,  
**So that** I don't have to manually hunt through listings.

*Acceptance Criteria:*
- ISBN and course code are indexed as searchable fields.
- Results are sorted by relevance by default.
- Clicking a result opens the full listing detail page.

---

**US-BUY-02**  
**As a** student,  
**I want to** purchase a book securely through the platform,  
**So that** my payment is protected until I confirm I have received the book.

*Acceptance Criteria:*
- Checkout flow shows item details, price, platform fee, and total.
- Payment is processed via the integrated gateway (e.g., Stripe).
- Funds are held in escrow until buyer marks the book as received.
- Buyer receives an email confirmation immediately after payment.

---

**US-BUY-03**  
**As a** buyer,  
**I want to** choose between in-person pickup or shipping,  
**So that** I can select the most convenient delivery method.

*Acceptance Criteria:*
- Both options are presented at checkout.
- For shipping, the buyer provides a delivery address.
- For pickup, the system facilitates a meetup via the messaging system.

---

**US-BUY-04**  
**As a** buyer,  
**I want to** confirm receipt of the book so the seller gets paid,  
**So that** the transaction is completed fairly for both parties.

*Acceptance Criteria:*
- A "Confirm Receipt" button appears in the transaction detail view.
- Confirming receipt triggers escrow release to the seller within 3 business days.
- A prompt to rate the seller appears immediately after confirmation.

---

**US-BUY-05**  
**As a** buyer,  
**I want to** raise a dispute if the book I received doesn't match the listing,  
**So that** I can get a refund if the seller misrepresented the item.

*Acceptance Criteria:*
- Dispute option available for 72 hours after confirming receipt.
- Dispute form requires a description and optional photo evidence.
- Escrow is frozen during an open dispute.
- Admin is notified of the dispute and can issue a full or partial refund.

---

**US-BUY-06**  
**As a** buyer,  
**I want to** save a listing to my watchlist,  
**So that** I can come back to it later if I'm not ready to buy immediately.

*Acceptance Criteria:*
- A "Save" or heart icon on the listing card adds it to the watchlist.
- Watchlist is accessible from the user's profile.
- User is notified if a watchlisted listing is about to expire or is closed.

---

## 5. Student — Selling Books

---

**US-SELL-01**  
**As a** student seller,  
**I want to** set an asking price for my book,  
**So that** buyers know exactly what I expect for it.

*Acceptance Criteria:*
- Price field accepts decimal values in the local currency.
- Price is displayed prominently on the listing card and detail page.
- The listing shows the estimated payout after the platform fee is deducted.

---

**US-SELL-02**  
**As a** seller,  
**I want to** receive payment into my account once the buyer confirms receipt,  
**So that** I get paid without having to chase the buyer.

*Acceptance Criteria:*
- Payout is automatically triggered upon buyer confirmation or after the 7-day auto-release window.
- Seller receives an email notification when the payout is processed.
- Payout amount reflects the agreed price minus the platform fee.

---

**US-SELL-03**  
**As a** seller,  
**I want to** communicate with potential buyers through the platform,  
**So that** I can answer questions without sharing my personal contact details.

*Acceptance Criteria:*
- Messages can be initiated from the listing detail page by the buyer.
- Seller receives an in-app and email notification for each new message.
- Message thread is tied to the specific listing for context.

---

**US-SELL-04**  
**As a** seller,  
**I want to** see a dashboard of all my active and past listings,  
**So that** I can manage everything in one place.

*Acceptance Criteria:*
- "My Listings" page shows all listings grouped by status: Active, Pending, Closed.
- Each listing card shows: title, price, transaction type, view count, and message count.
- Quick actions available: Edit, Close, Delete, Renew.

---

## 6. Student — Exchanging Books

---

**US-XCHG-01**  
**As a** student,  
**I want to** propose a book swap to someone whose listing interests me,  
**So that** we can trade books without either of us spending money.

*Acceptance Criteria:*
- "Propose Exchange" button is visible on For Exchange listings.
- User selects one of their own active listings as the offered book.
- Proposal is sent as a notification and message to the listing owner.

---

**US-XCHG-02**  
**As a** listing owner,  
**I want to** review, accept, or decline an exchange proposal,  
**So that** I stay in control of what I trade my book for.

*Acceptance Criteria:*
- Incoming proposals appear in a dedicated "Exchange Proposals" section.
- Each proposal shows the offered book's title, condition, and photos.
- Owner can Accept, Decline, or Counter (propose a different book in return).
- Both parties are notified of the outcome immediately.

---

**US-XCHG-03**  
**As a** student involved in an exchange,  
**I want to** coordinate the handoff through the messaging system,  
**So that** we can arrange a convenient time and location.

*Acceptance Criteria:*
- Accepting a proposal automatically opens a message thread between the two students.
- Both parties can confirm handoff completion from within the message thread.
- Both listings are marked as Exchanged once both confirm.

---

## 7. Student — Donating Books

---

**US-DON-01**  
**As a** student,  
**I want to** donate a book I no longer need,  
**So that** another student can benefit from it at no cost.

*Acceptance Criteria:*
- Donation listings display a "Free" badge prominently.
- No price field is required for donation listings.
- Donation listings appear in search results with a Free filter option.

---

**US-DON-02**  
**As a** student,  
**I want to** claim a donated book before someone else does,  
**So that** I can get the book I need without paying for it.

*Acceptance Criteria:*
- "Claim" button is visible on active donation listings.
- First student to click Claim reserves the book.
- Donor receives an in-app and email notification of the claim.
- Listing is marked as Claimed and hidden from further claims.

---

**US-DON-03**  
**As a** student,  
**I want to** contribute books to my college's organized book drive,  
**So that** they can be redistributed to students who need them most.

*Acceptance Criteria:*
- Active donation drives are listed under a "Book Drives" section.
- Donor can select a drop-off location from a list managed by the College Coordinator.
- Donor receives a confirmation notification once the donation is logged.

---

## 8. Student — Messaging

---

**US-MSG-01**  
**As a** buyer,  
**I want to** message a seller to ask about a book before purchasing,  
**So that** I can clarify details like edition, condition, or pickup availability.

*Acceptance Criteria:*
- "Message Seller" button is present on every listing detail page.
- Only authenticated students can initiate a message.
- Messages are tied to the listing for easy reference.

---

**US-MSG-02**  
**As a** user,  
**I want to** receive an in-app and email notification when I get a new message,  
**So that** I don't miss important communications about my listings or purchases.

*Acceptance Criteria:*
- Notification badge on the Messages icon updates in real time.
- Email notification is sent within 1 minute of message receipt.
- User can reply directly from the email notification (deep-link to inbox).

---

**US-MSG-03**  
**As a** user,  
**I want to** block and report another user from a message thread,  
**So that** I can protect myself from harassment or inappropriate behavior.

*Acceptance Criteria:*
- "Block & Report" option accessible from the message thread menu.
- Blocking prevents the blocked user from sending further messages.
- Report is logged and flagged for admin review within 24 hours.

---

## 9. Student — Ratings & Reviews

---

**US-RATE-01**  
**As a** buyer,  
**I want to** rate and review my seller after a completed transaction,  
**So that** other students know who they can trust.

*Acceptance Criteria:*
- Rating prompt appears immediately after marking a transaction as complete.
- Rating is 1–5 stars; written review is optional but encouraged.
- Submitted ratings cannot be edited but can be responded to.

---

**US-RATE-02**  
**As a** seller,  
**I want to** rate my buyer after a completed transaction,  
**So that** the community knows which buyers are reliable.

*Acceptance Criteria:*
- Seller is prompted to rate the buyer when escrow is released.
- Rating window closes 14 days after transaction completion.
- Buyer's profile shows their average rating as a buyer.

---

**US-RATE-03**  
**As a** user,  
**I want to** respond to a review left on my profile,  
**So that** I can address any unfair or inaccurate feedback.

*Acceptance Criteria:*
- "Respond" button appears beneath each review on the user's profile.
- Only the reviewed user can respond; only one response is allowed per review.
- Response is displayed directly below the original review.

---

**US-RATE-04**  
**As a** user,  
**I want to** flag an inappropriate review for admin removal,  
**So that** false or abusive reviews don't damage my reputation unfairly.

*Acceptance Criteria:*
- "Flag" option is available on every review.
- Flagged reviews are queued for admin inspection within 24 hours.
- Admin can remove the review or dismiss the flag.
- The flagger is notified of the outcome.

---

## 10. Student — Notifications & Search Alerts

---

**US-NOTIF-01**  
**As a** student,  
**I want to** manage which notifications I receive by email and in-app,  
**So that** I only get alerts that are relevant to me.

*Acceptance Criteria:*
- Notification preferences page lists categories: Messages, Transactions, Listing Expiry, Search Alerts, Platform News.
- Each category can be toggled independently for email and in-app.
- Changes take effect immediately.

---

**US-NOTIF-02**  
**As a** student,  
**I want to** save a search query so I'm notified when a matching book is listed,  
**So that** I don't have to manually check the platform repeatedly.

*Acceptance Criteria:*
- "Save this Search" button appears on the search results page.
- User names the alert and chooses notification frequency (instant, daily digest).
- Alert notification includes: book title, price, condition, and a direct link to the listing.
- User can manage (edit/delete) saved alerts from their profile.

---

## 11. Platform Administrator

---

**US-ADMIN-01**  
**As an** administrator,  
**I want to** view a real-time dashboard of platform activity,  
**So that** I can quickly assess the health of the marketplace.

*Acceptance Criteria:*
- Dashboard shows: total active listings, transactions this month, open disputes, flagged content count, and new registrations today.
- Data refreshes every 5 minutes or on manual refresh.
- Key metrics are shown as trend charts (7-day and 30-day views).

---

**US-ADMIN-02**  
**As an** administrator,  
**I want to** remove listings that violate platform policies,  
**So that** the marketplace stays safe and appropriate for students.

*Acceptance Criteria:*
- Admin can search, view, and remove any listing.
- Removal requires selecting a reason (prohibited item, misrepresentation, spam, other).
- The listing owner receives an email explaining why their listing was removed.
- Removal is logged with the admin's ID and timestamp.

---

**US-ADMIN-03**  
**As an** administrator,  
**I want to** suspend or permanently ban a user who violates the community guidelines,  
**So that** bad actors cannot continue using the platform.

*Acceptance Criteria:*
- Admin can apply a time-limited suspension or a permanent ban.
- Banned user receives an email notification with the reason and any appeal instructions.
- All active listings of a banned user are automatically deactivated.
- Ban is logged with the admin's ID, reason, and timestamp.

---

**US-ADMIN-04**  
**As an** administrator,  
**I want to** review and resolve transaction disputes,  
**So that** students are treated fairly when a transaction goes wrong.

*Acceptance Criteria:*
- Disputes queue shows: listing details, buyer/seller info, dispute reason, and submitted evidence.
- Admin can issue a full refund, partial refund, or dismiss the dispute.
- Both parties are notified of the resolution outcome by email.
- Resolution is logged with reason and timestamp.

---

**US-ADMIN-05**  
**As an** administrator,  
**I want to** export transaction and activity reports,  
**So that** I can share platform performance data with college stakeholders.

*Acceptance Criteria:*
- Reports are exportable as CSV or PDF.
- Available report types: Transaction Summary, Listing Activity, User Registrations, Disputes Log.
- Date range filter available for all reports.
- Export runs in the background and is emailed when ready for large data sets.

---

**US-ADMIN-06**  
**As an** administrator,  
**I want to** manage registered college email domains,  
**So that** new colleges can be onboarded and inactive ones can be removed.

*Acceptance Criteria:*
- Admin can add, edit, or remove college email domains from an allow-list.
- Adding a domain takes effect immediately for new registrations.
- Removing a domain does not retroactively deactivate existing accounts.

---

## 12. College Coordinator

---

**US-COORD-01**  
**As a** college coordinator,  
**I want to** create and manage donation drives for my campus,  
**So that** books are redistributed to students who need them most.

*Acceptance Criteria:*
- Coordinator can create a drive with: name, date range, drop-off locations, and accepted subjects.
- Active drives appear on the platform's Donate page under the relevant college.
- Coordinator can close or extend a drive at any time.

---

**US-COORD-02**  
**As a** college coordinator,  
**I want to** see a summary of books collected in a donation drive,  
**So that** I can report the impact to college administration.

*Acceptance Criteria:*
- Drive summary shows: total donations received, book titles/conditions, and donor count.
- Summary is exportable as CSV.
- Data is available for 12 months after the drive closes.

---

*End of User Stories — College Book Exchange Platform v1.0*
