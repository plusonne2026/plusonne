# PlusOne — Frontend Technical Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-06-25  
> **Status:** Pre-Development Specification  
> **Note:** Frontend tech stack is flexible (team's choice). This document focuses on **user flows, screens, features, and API integration** — framework-agnostic.

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [User Roles & Access Matrix](#2-user-roles--access-matrix)
3. [User Flow: Attendee (Customer)](#3-user-flow-attendee-customer)
4. [User Flow: Host (Companion)](#4-user-flow-host-companion)
5. [User Flow: Admin](#5-user-flow-admin)
6. [API Integration Guide](#6-api-integration-guide)
7. [Real-Time Integration (Firebase RTDB)](#7-real-time-integration-firebase-rtdb)
8. [State Management Notes](#8-state-management-notes)
9. [SEO & Performance](#9-seo--performance)
10. [Visualization Prompts](#10-visualization-prompts)

---

## 1. Platform Overview

PlusOne is a **single web application** with three role-based interfaces served from the same codebase:

| Interface | URL Pattern | Role | Purpose |
|-----------|------------|------|---------|
| **User App** | `/`, `/home`, `/booking/*` | `user` | Browse, book, track, rate companions |
| **Host Dashboard** | `/host/*` | `host` | Manage bookings, earnings, availability |
| **Admin Panel** | `/admin/*` | `admin` | Full platform management |

### Frontend Dependencies (Suggested)

```
Core:        React / Next.js (team's choice)
Maps:        Leaflet.js + OpenStreetMap (free, no API key for tiles)
Auth:        Firebase Auth SDK (handles Google, Email, Phone OTP)
Real-Time:   Firebase Realtime Database SDK
Payments:    Razorpay Checkout.js (client-side SDK)
HTTP:        Axios or Fetch API
Icons:       Lucide React / Heroicons
Forms:       React Hook Form + Zod (or similar)
```

### API Base URL

```
Development: http://localhost:5001/plusone-dev/asia-south1/api
Production:  https://asia-south1-plusone-prod.cloudfunctions.net/api
```

> **Region:** All backend functions run in `asia-south1` (Mumbai) for low latency Indian users.

### Standard API Call Pattern

```javascript
// Every API call includes the Firebase ID token
const token = await firebase.auth().currentUser.getIdToken();

const response = await fetch(`${API_BASE}/endpoint`, {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
// result.success === true  → data in result.data
// result.success === false → error in result.error
```

---

## 2. User Roles & Access Matrix

| Screen/Feature | Guest | User | Host | Admin |
|----------------|-------|------|------|-------|
| Landing page | ✅ | ✅ | ✅ | ✅ |
| Register/Login | ✅ | — | — | — |
| Home (categories, packages) | ✅ (view) | ✅ | ✅ | ✅ |
| Search & Filter | ✅ (view) | ✅ | ❌ | ✅ |
| Host Profiles | ✅ (view) | ✅ | ❌ | ✅ |
| Create Booking | ❌ | ✅ | ❌ | ❌ |
| My Bookings | ❌ | ✅ | ❌ | ❌ |
| Live Session (tracking, chat) | ❌ | ✅ | ✅ | ✅ (monitor) |
| Rate & Review | ❌ | ✅ | ✅ | ❌ |
| Wallet (subscriptions, units) | ❌ | ✅ | ❌ | ❌ |
| Profile Settings | ❌ | ✅ | ✅ | ✅ |
| Host Registration | ❌ | ✅ | — | — |
| Host Dashboard | ❌ | ❌ | ✅ | ✅ |
| Host Booking Requests | ❌ | ❌ | ✅ | ❌ |
| Host Earnings | ❌ | ❌ | ✅ | ✅ |
| Admin Dashboard | ❌ | ❌ | ❌ | ✅ |
| User/Host Management | ❌ | ❌ | ❌ | ✅ |
| GPS Monitoring | ❌ | ❌ | ❌ | ✅ |
| SOS Center | ❌ | ❌ | ❌ | ✅ |
| Finance & Reports | ❌ | ❌ | ❌ | ✅ |

---

## 3. User Flow: Attendee (Customer)

### 3.1 Onboarding & Authentication

#### Screen: Landing Page (`/`)

**Features:**
- Hero section with tagline "Your Companion. Your Choice. Your Way."
- Promotional carousel (auto-sliding banners)
- Category grid (4 categories with icons)
- Popular packages section
- "How it works" steps
- Trust & safety section
- Call-to-action buttons: "Book Now" / "Sign Up"

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Load promotions | `GET /promotions/active` | — | Array of promo banners `[{ title, imageUrl, description }]` |
| Load categories | `GET /categories` | — | Array of categories `[{ categoryId, name, iconUrl, description }]` |
| Load popular packages | `GET /packages/popular?city=Mumbai&limit=6` | Query: city, limit | Array of packages `[{ packageId, name, basePrice, images, durationHours, distanceKm }]` |

---

#### Screen: Login/Register (`/auth/login`)

**Features:**
- Tab toggle: Login / Register
- Three auth methods:
  1. **Google OAuth** — "Continue with Google" button
  2. **Email/Password** — email field + password field
  3. **Phone + OTP** — phone number field → OTP input (6 digits)
- Terms & Conditions checkbox
- "Forgot Password" link

**Auth Flow (Google OAuth):**
```
1. User clicks "Continue with Google"
2. Firebase Auth SDK opens Google popup
3. User selects Google account
4. Firebase returns: { user: { uid, email, displayName, photoURL } }
5. Frontend calls: POST /auth/register (or POST /auth/verify-token if existing)

API Call:
  POST /auth/register
  Sends: {
    firebaseUid: "abc123",
    email: "user@gmail.com",
    displayName: "Rahul Sharma",
    authProvider: "google",
    city: ""  // Will be set in profile completion
  }
  Receives: {
    success: true,
    data: { userId, email, displayName, role, isVerified, trustScore }
  }
```

**Auth Flow (Phone + OTP):**
```
1. User enters phone number: +91 98765 43210
2. Frontend calls: firebase.auth().signInWithPhoneNumber("+919876543210", recaptchaVerifier)
3. Firebase sends OTP SMS to user's phone
4. User enters 6-digit OTP
5. Frontend calls: confirmationResult.confirm(otpCode)
6. Firebase returns authenticated user
7. Frontend calls: POST /auth/register (or POST /auth/verify-token)

API Call:
  POST /auth/register
  Sends: {
    firebaseUid: "def456",
    phone: "+919876543210",
    displayName: "",    // Will be set in profile completion
    authProvider: "phone",
    city: ""
  }
  Receives: {
    success: true,
    data: { userId, phone, role: "user", isVerified: false }
  }
```

**Auth Flow (Email/Password):**
```
1. User enters email + password
2. Register: firebase.auth().createUserWithEmailAndPassword(email, password)
3. Login: firebase.auth().signInWithEmailAndPassword(email, password)
4. Firebase returns authenticated user
5. Frontend calls: POST /auth/register (register) or POST /auth/verify-token (login)
```

---

#### Screen: Complete Profile (`/auth/complete-profile`)

**Shows after first-time social/phone login if profile is incomplete.**

**Features:**
- Display name input (pre-filled from Google if available)
- Avatar upload (camera/gallery → Cloudinary)
- City selection (dropdown)
- Preferred languages (multi-select)

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Upload avatar | Direct Cloudinary upload | FormData with image file | `{ url: "https://cloudinary.com/..." }` |
| Save profile (first-time only) | `POST /auth/complete-profile` | `{ displayName, avatarUrl, city, coordinates, preferredLanguages }` | Updated user object with `isVerified: true` |

> **Note:** `POST /auth/complete-profile` is used **only** for the first-time profile completion screen after social/phone signup. All subsequent profile updates (e.g., changing city, avatar) use `PUT /users/me`.

---

### 3.2 Home & Discovery

#### Screen: Home (`/home`)

**Features:**
- **Greeting bar:** "Hello, Rahul 👋" with notification bell (unread count badge)
- **Search bar:** Tap to go to `/search` page
- **Promotional carousel:** Auto-sliding banners with promotions
- **Category grid:** 4 category cards (Rider/Explorer, Coffee Date, Sports Partner, Event Companion)
- **Popular packages:** Horizontal scroll list of package cards
- **Nearby hosts:** "Top hosts near you" section
- **Current booking banner:** If user has an active/upcoming booking, show persistent banner at top

**API Calls on Mount:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get user profile | `GET /users/me` | — | Full user profile |
| Get promotions | `GET /promotions/active` | — | `[{ promotionId, title, imageUrl, description }]` |
| Get categories | `GET /categories` | — | `[{ categoryId, name, iconUrl }]` |
| Get popular packages | `GET /packages/popular?city={userCity}&limit=8` | Query: city, limit | `[{ packageId, name, basePrice, images[0], durationHours, categoryId }]` |
| Get nearby hosts | `GET /hosts/nearby?lat={lat}&lng={lng}&radiusKm=15&limit=6` | Query: lat, lng, radius, limit | `[{ hostId, hostName, avatarUrl, rating, totalReviews, categories }]` |
| Get unread notification count | `GET /notifications/unread-count` | — | `{ count: 3 }` |
| Get active booking | `GET /bookings/my?status=active&limit=1` | Query: status, limit | `[{ bookingId, status, hostName, scheduledDate }]` or `[]` |

---

#### Screen: Search & Filter (`/search`)

**Features:**
- **Search bar:** Full-text search (host names, package names)
- **Filter panel** (sidebar or bottom sheet):
  - Category (multi-select checkboxes)
  - Price range (slider: ₹500 — ₹10,000)
  - Host rating (minimum: 3.0, 3.5, 4.0, 4.5)
  - Language (multi-select)
  - Availability (date picker)
  - Distance (slider: 1km — 50km)
  - Sort by: Relevance, Price (low-high), Price (high-low), Rating, Distance
- **Results:** List/Grid of package cards or host cards
- **Toggle:** "Packages" vs "Hosts" tabs

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Search packages | `GET /packages?categoryId=explorer&city=Mumbai&minPrice=500&maxPrice=5000&sortBy=popularity&limit=20&cursor=...` | Query params | `{ data: [...packages], meta: { cursor, hasMore } }` |
| Search hosts | `GET /hosts?categoryId=coffee_date&minRating=4.0&language=Hindi&lat=19.07&lng=72.87&radiusKm=10&limit=20` | Query params | `{ data: [...hosts], meta: { cursor, hasMore } }` |
| Load more (pagination) | Same endpoints with `cursor` from previous response | cursor token | Next page of results |

---

### 3.3 Package & Host Details

#### Screen: Package Details (`/packages/:packageId`)

**Features:**
- Image carousel (full-width)
- Package name + category badge
- Price display (₹1,500)
- Duration & distance (2H / 20 KM)
- Inclusions list (checkmarks)
- Extra charges info (₹200/extra hour, ₹15/extra KM)
- Cancellation policy
- "Book Now" CTA button
- Related packages section
- Reviews for this package category

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get package details | `GET /packages/:packageId` | — | Full package object |
| Get related packages | `GET /packages?categoryId={pkg.categoryId}&city={pkg.city}&limit=4` | — | Related packages |

---

#### Screen: Host Profile (`/hosts/:hostId`)

**Features:**
- Avatar (large, round)
- Name, verified badge
- Rating (stars + numeric) + total reviews count
- Trust score badge (color-coded: green/yellow/red)
- Bio text
- Categories served (tags/badges)
- Languages spoken
- Experience (years)
- Availability calendar (weekly schedule visualization)
- Reviews list (paginated, with user names + scores + comments)
- "Book with this Host" CTA button

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get host profile | `GET /hosts/:hostId` | — | Full host public profile |
| Get host ratings | `GET /ratings/for/:userId?limit=10&cursor=...` | — | `{ data: [...ratings], meta: { cursor } }` |

---

### 3.4 Booking Flow

#### Screen: Choose Pricing Model (`/booking/pricing`)

**Reached after clicking "Book Now" on a package or host.**

**Features:**
- 3 pricing model cards:
  1. **Subscription** — "Monthly Plan" with plan details. Shows remaining balance if subscribed.
  2. **Unit Purchase** — "Pay per Use" with current hour/km balances.
  3. **Package** — "Fixed Price" with package details.
- Each card shows: price, what's included, CTA button
- If user has active subscription → auto-select Subscription tab
- If user has unit balance → show current balance
- "Subscribe" / "Buy Units" links to wallet page

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get subscription status | `GET /subscriptions/my` | — | Active subscription or null |
| Get unit balance | `GET /units/balance` | — | `{ hoursBalance: 15, kmBalance: 200 }` |
| Get subscription plans | `GET /subscriptions/plans` | — | Array of plan definitions |

---

#### Screen: Booking Details (`/booking/details`)

**Features:**
- **Date picker:** Calendar to select booking date
- **Time picker:** Select preferred time slot
- **Pickup location:** 
  - Map view with draggable pin (Leaflet + OSM)
  - Search box with autocomplete (Nominatim geocoding)
  - "Use current location" button
  - Address text display
- **Special instructions:** Text area (optional)
- **Price summary:**
  - Base price
  - Extras (if any)
  - Discount (if promo code applied)
  - GST (18%)
  - **Total**
- **Promo code input:** Text field + "Apply" button
- **Payment method indicator:** "Pay via Razorpay (UPI/Card/Netbanking)"
- **"Confirm & Pay"** button

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Validate promo code | `POST /promotions/validate-code` | `{ promoCode: "WELCOME20" }` | `{ valid: true, discountType: "percentage", discountValue: 20 }` |
| Create booking | `POST /bookings` | `{ packageId, categoryId, pricingModel, scheduledDate, scheduledTime, pickupLocation: { lat, lng, address }, specialInstructions, promoCode }` | `{ bookingId, status: "pending_payment", price: { base, extras, discount, tax, total }, razorpayOrderId }` |

---

#### Screen: Payment (`/booking/payment`)

**Features:**
- Razorpay Checkout popup/embedded
- Payment methods: UPI, Card, Netbanking, Wallet
- Order summary sidebar

**Payment Flow:**
```
1. Frontend received razorpayOrderId from POST /bookings
2. Open Razorpay Checkout:
   const rzp = new Razorpay({
     key: RAZORPAY_KEY_ID,
     amount: totalAmount * 100,  // paise
     currency: "INR",
     order_id: razorpayOrderId,
     name: "PlusOne",
     description: "Booking: Delhi Heritage Tour",
     handler: function(response) {
       // Payment success callback
       verifyPayment(response);
     }
   });
   rzp.open();

3. On success, verify payment:
   POST /payments/verify
   Sends: {
     razorpayOrderId: response.razorpay_order_id,
     razorpayPaymentId: response.razorpay_payment_id,
     razorpaySignature: response.razorpay_signature,
     bookingId: bookingId
   }
   Receives: {
     success: true,
     data: {
       paymentVerified: true,
       bookingStatus: "pending_assignment",
       assignedHost: { hostId, hostName, avatarUrl, rating } or null
     }
   }

4. If payment verified → redirect to Booking Confirmation screen
5. If payment failed → show error, allow retry
```

---

#### Screen: Booking Confirmation (`/booking/:bookingId/confirmed`)

**Features:**
- Success checkmark animation
- Booking summary (date, time, location, price)
- **Host Preview Card** (if assigned):
  - Host photo, name, rating
  - "Waiting for host to confirm" status
  - Option to "Swap Host" (see other available hosts)
- **If no host assigned yet:**
  - "Finding you the perfect companion..." loading animation
  - Status updates via real-time (Firebase RTDB)
- Timeline: Pending → Host Assigned → Host Confirmed → Ready
- "View My Bookings" link

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get booking status | `GET /bookings/:bookingId` | — | Full booking with host details |
| Swap host | `PUT /bookings/:bookingId/swap-host` | — | New host assignment or available hosts list |

**Real-Time Listener (Firebase RTDB):**
```javascript
// Listen for booking status changes
firebase.database()
  .ref(`/sessions/${bookingId}/status`)
  .on('value', (snapshot) => {
    const status = snapshot.val();
    // Update UI: "Host assigned!" → "Host confirmed!" → "Host is on the way!"
  });
```

---

### 3.5 Live Session

#### Screen: Live Tracking (`/session/:bookingId`)

**Shown when booking is active (host is on the way or session is in progress).**

**Features:**
- **Full-screen map** (Leaflet + OSM) showing:
  - Host's live location (car/person icon, moving in real-time)
  - User's location (pin)
  - Route line between them
  - ETA display (e.g., "8 min away, 3.2 km")
- **Bottom panel (draggable sheet):**
  - Host info card (photo, name, rating)
  - Session timer (elapsed time / remaining time)
  - Distance tracker (covered km / included km)
  - Overage warning (yellow bar if approaching limit)
- **Action buttons:**
  - 📞 **Call Host** — In-app call
  - 💬 **Chat** — Opens chat overlay
  - 🚨 **SOS** — Emergency button (prominent red)
- **Status bar:** "Host is on the way" → "Session in progress" → "Session completed"

**Real-Time Listeners (Firebase RTDB):**
```javascript
// Host's live location (updates every 5 seconds)
firebase.database()
  .ref(`/sessions/${bookingId}/hostLocation`)
  .on('value', (snapshot) => {
    const { lat, lng, heading, speed } = snapshot.val();
    // Update host marker on Leaflet map
    // Smooth animation: marker.slideTo([lat, lng], { duration: 1000 })
  });

// Session status changes
firebase.database()
  .ref(`/sessions/${bookingId}/status`)
  .on('value', (snapshot) => {
    // "awaiting_host" → "host_en_route" → "in_progress" → "completed"
  });

// ETA updates
firebase.database()
  .ref(`/sessions/${bookingId}/eta`)
  .on('value', (snapshot) => {
    const { minutes, distanceKm } = snapshot.val();
    // Update ETA display
  });
```

**User Location Sharing (Optional — user controls this):**
```javascript
// If user opts in to share location
navigator.geolocation.watchPosition((position) => {
  firebase.database()
    .ref(`/sessions/${bookingId}/userLocation`)
    .set({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      updatedAt: Date.now()
    });
}, null, { enableHighAccuracy: true, maximumAge: 5000 });
```

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get session details | `GET /sessions/:bookingId` | — | Session data (status, metrics, included limits) |
| Get route history | `GET /sessions/:bookingId/route` | — | Array of route points for map polyline |

---

#### Screen: In-App Chat (overlay on Live Tracking)

**Features:**
- Chat bubble list (user messages right-aligned, host messages left-aligned)
- Text input + send button
- Image attachment (camera/gallery → upload to Cloudinary)
- Typing indicator ("Host is typing...")
- Read receipts (double checkmark)
- System messages ("Session started", "Host is on the way")
- Scroll to latest message

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Load chat history | `GET /chat/:bookingId/messages?limit=50&cursor=...` | Query | `{ data: [...messages], meta: { cursor } }` |
| Send message | `POST /chat/:bookingId/send` | `{ content: "Hello!", contentType: "text" }` | Created message object |
| Upload image | `POST /chat/:bookingId/media` | FormData with image | `{ mediaUrl: "..." }` |
| Mark as read | `PUT /chat/:bookingId/read` | — | Success |

**Real-Time (Firebase RTDB):**
```javascript
// Listen for new messages
firebase.database()
  .ref(`/chats/${bookingId}/messages`)
  .orderByChild('timestamp')
  .startAt(Date.now())
  .on('child_added', (snapshot) => {
    const message = snapshot.val();
    // Append to chat UI
  });

// Typing indicator
firebase.database()
  .ref(`/chats/${bookingId}/typing/${myUserId}`)
  .onDisconnect().set(false);

// Show typing when I type
function onTyping() {
  firebase.database()
    .ref(`/chats/${bookingId}/typing/${myUserId}`)
    .set(true);
  // Auto-clear after 3 seconds
  setTimeout(() => {
    firebase.database()
      .ref(`/chats/${bookingId}/typing/${myUserId}`)
      .set(false);
  }, 3000);
}

// Listen for other person typing
firebase.database()
  .ref(`/chats/${bookingId}/typing/${otherUserId}`)
  .on('value', (snapshot) => {
    const isTyping = snapshot.val();
    // Show/hide "Host is typing..."
  });
```

---

#### Screen: SOS Emergency (modal overlay)

**Triggered by pressing the red SOS button.**

**Features:**
- Full-screen red overlay
- Large "SOS Alert Sent" message
- "Help is on the way" reassurance text
- Current location display on mini-map
- **"Call Emergency Services (112)"** button — direct phone dialer
- **"Cancel SOS"** button (in case of accidental trigger)
- Live status updates from ops team

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Trigger SOS | `POST /sos/trigger` | `{ bookingId, location: { lat, lng, accuracy } }` | `{ alertId, status: "active", emergencyNumber: "112", message: "Help is on the way" }` |

---

### 3.6 Post-Session

#### Screen: Rate & Review — User Rates Host (`/booking/:bookingId/rate`)

**Shown to the USER after session completes.**

**Features:**
- Host profile card (photo, name)
- Session summary (date, duration, distance, total cost)
- **Star rating** for each category:
  - Professionalism ⭐⭐⭐⭐⭐
  - Friendliness ⭐⭐⭐⭐⭐
  - Communication ⭐⭐⭐⭐⭐
  - Punctuality ⭐⭐⭐⭐⭐
- **Text review** (optional textarea)
- **Video review** (optional — record/upload → earn 10-20% discount on next booking)
- "Submit Review" button
- "Skip" option (can rate later from My Bookings)

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Submit rating | `POST /ratings` | `{ bookingId, scores: { professionalism: 5, friendliness: 4, communication: 5, punctuality: 4 }, comment: "Great!", videoReviewUrl: null }` | Rating object + discount code (if video review submitted) |
| Upload video review | Direct Cloudinary upload | Video file | `{ url: "..." }` |

---

#### Screen: Rate & Review — Host Rates User (`/host/session/:bookingId/rate`)

**Shown to the HOST after ending a session. Two-way rating — backend supports both sides rating each other.**

**Features:**
- User profile card (name, trust score)
- Session summary (date, duration, distance)
- **Star rating** for each category (host evaluates the user):
  - Behaviour ⭐⭐⭐⭐⭐
  - Respect ⭐⭐⭐⭐⭐
  - Safety compliance ⭐⭐⭐⭐⭐
  - Cooperation ⭐⭐⭐⭐⭐
- **Text comment** (optional)
- "Submit" button
- "Skip" option

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Submit host rating | `POST /ratings` | `{ bookingId, scores: { behaviour: 5, respect: 4, safety: 5, cooperation: 4 }, comment: "Polite and punctual." }` | Rating object (updates user trust score) |

> **Flow:** After the host calls `POST /sessions/:bookingId/end`, the host session screen navigates to `/host/session/:bookingId/rate`. Both ratings are submitted independently. The booking status moves to `rated` only when **both** the user and the host have submitted their ratings.

---

#### Screen: Session Receipt (`/booking/:bookingId/receipt`)

**Features:**
- Booking ID
- Date & time
- Host name
- Package name (if applicable)
- Duration: 2h 13m
- Distance: 22.5 km
- Pricing breakdown:
  - Base: ₹1,500
  - Overage (13 min): ₹44
  - Overage (2.5 km): ₹37.50
  - Discount: -₹0
  - GST (18%): ₹284
  - **Total: ₹1,865.50**
- Payment method used
- "Download Invoice" button (generates PDF)
- "Book Again" button

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get booking details | `GET /bookings/:bookingId` | — | Full booking with session data and final bill |

---

### 3.7 User Account & Wallet

#### Screen: My Bookings (`/bookings`)

**Features:**
- Tab toggle: **Upcoming** | **Past** | **Cancelled**
- Booking cards with:
  - Package name / category icon
  - Date & time
  - Host name + avatar
  - Status badge (color-coded)
  - Price
- Click → navigates to booking detail / live session / receipt
- **"Request Refund"** button on cancelled bookings (if eligible based on cancellation policy)
- Pull-to-refresh

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get upcoming bookings | `GET /bookings/my?status=pending_assignment,host_assigned,host_confirmed&limit=20` | Query | Paginated bookings |
| Get past bookings | `GET /bookings/my?status=completed,rated&limit=20` | Query | Paginated bookings |
| Get cancelled bookings | `GET /bookings/my?status=cancelled&limit=20` | Query | Paginated bookings |
| Cancel booking | `PUT /bookings/:bookingId/cancel` | `{ reason: "Changed plans" }` | Updated booking with `cancellationFee` and `refundAmount` |

> **Refund note:** Refunds are processed by the admin via `POST /payments/refund`. When a user cancels, if cancellation was within the free-cancel window (default 24h before booking), the system flags the booking as eligible for a full refund. If after the window, the system deducts the cancellation fee (25% by default) and the remaining amount is refunded. The user sees the refund status on the cancelled booking card.

---

#### Screen: Wallet (`/wallet`)

**Features:**
- **Subscription card** (if active):
  - Plan name, price, end date
  - Hours remaining / total (progress bar)
  - KM remaining / total (progress bar)
  - **Auto-Renew toggle** (on/off — calls backend to update preference)
  - "Change Plan" / "Cancel Subscription" buttons
- **Unit Balance card:**
  - Hours balance: 15h
  - KM balance: 200km
  - "Buy More Hours" / "Buy More KM" buttons
- **Unit purchase history:** List of unit purchases and per-booking deductions (separate from billing history)
- **Billing history tab:** All transactions (payments, refunds, subscriptions) from the full payment history
- **Buy Units modal:**
  - Select type: Hours / KM
  - Amount selector (5, 10, 25, 50, 100)
  - Price display
  - "Purchase" button → Razorpay checkout

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get subscription | `GET /subscriptions/my` | — | Active subscription or null |
| Get unit balance | `GET /units/balance` | — | `{ hoursBalance, kmBalance }` |
| Get unit history (Wallet tab) | `GET /units/history?limit=20&cursor=...` | Query | `{ data: [...unitTransactions], meta: { cursor } }` |
| Get full billing history (Billing tab) | `GET /payments/history?limit=20&cursor=...` | Query | `{ data: [...allTransactions], meta: { cursor } }` |
| Purchase units | `POST /units/purchase` | `{ type: "hours", amount: 10 }` | `{ razorpayOrderId, purchase: { type, amount, totalPrice } }` |
| Subscribe to plan | `POST /subscriptions/subscribe` | `{ planId: "monthly_basic", autoRenew: true }` | `{ subscriptionId, razorpayOrderId }` |
| Cancel subscription | `PUT /subscriptions/:subId/cancel` | — | Updated subscription |
| Toggle auto-renew | `PUT /subscriptions/:subId/toggle-autorenew` | — | `{ autoRenew: true/false }` |
| Get pricing plans | `GET /subscriptions/plans` | — | Array of plan definitions |

---

#### Screen: Profile Settings (`/profile`)

**Features:**
- Avatar (tap to change)
- Display name (editable)
- Email (read-only if Google auth)
- Phone number (with change flow)
- City (dropdown)
- Preferred languages (multi-select)
- Trust score display (badge with colour: green ≥ 70, yellow 40-69, red < 40)
- **Referral Code section:**
  - Displays unique referral code (e.g., `RAHUL3X7`)
  - "Copy Code" button
  - "Share" button (native share sheet)
- Notification preferences (toggle: push, email, SMS)
- "Apply to Become a Host" button (if role is "user" and not already host)
- "Delete Account" button (with confirmation modal)
- Logout button

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get profile | `GET /users/me` | — | Full user profile incl. `referralCode` |
| Update profile | `PUT /users/me` | `{ displayName, city, preferredLanguages }` | Updated profile |
| Upload avatar | Direct Cloudinary upload + `PUT /users/me` with new URL | Image file | Cloudinary URL |
| Delete account | `DELETE /auth/delete-account` | — | Confirmation |

---

#### Screen: Notifications (`/notifications`)

**Features:**
- List of notifications grouped by date
- Each notification: icon + title + body + timestamp
- Unread = bold, Read = normal
- Tap → navigate to relevant screen (booking, chat, etc.)
- "Mark all as read" button
- Empty state: "No notifications yet"

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get notifications | `GET /notifications?limit=30&cursor=...` | Query | `{ data: [...notifications], meta: { cursor } }` |
| Mark as read | `PUT /notifications/read` | `{ notificationIds: ["id1", "id2"] }` | Success |

---

## 4. User Flow: Host (Companion)

### 4.1 Host Registration

#### Screen: Host Application (`/host/apply`)

**Accessible to logged-in users who want to become hosts.**

**Features:**
- Step 1: **Personal Info** — Bio, experience, photo
- Step 2: **Categories** — Select categories to serve (multi-select)
- Step 3: **Languages** — Languages spoken
- Step 4: **Availability** — Set weekly schedule (drag-and-drop time blocks)
- Step 5: **KYC Documents** — Upload Aadhaar, PAN, photo ID
- Step 6: **Bank Details** — Account number, IFSC, holder name
- Step 7: **Review & Submit**
- After submit → "Application under review" status page

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Upload KYC docs | Direct Cloudinary upload | Files | `{ aadhaarUrl, panUrl, photoUrl }` |
| Submit application | `POST /hosts/register` | `{ bio, categories, languages, experienceYears, bankDetails }` | Host profile with `kycStatus: "pending"` |
| Upload KYC to backend | `POST /hosts/me/kyc` | `{ aadhaarUrl, panUrl, photoUrl }` | Success |
| Set availability | `PUT /hosts/me/availability` | `{ schedule: [{ dayOfWeek: 1, slots: [{ start: "09:00", end: "18:00" }] }] }` | Success |

---

### 4.2 Host Dashboard

#### Screen: Host Dashboard (`/host/dashboard`)

**Features:**
- **Greeting + earnings today:** "Hello Arjun! ₹3,450 today"
- **Online/Offline toggle** (prominent switch)
- **Today's schedule:** List of confirmed bookings
- **Incoming requests:** Notification badges for pending requests
- **Quick stats card:**
  - Rating: 4.8 ⭐
  - Completion rate: 96%
  - This month earnings: ₹25,000
  - Pending payout: ₹12,500
- **Navigation:** Requests | Schedule | Earnings | Profile

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get host profile | `GET /hosts/me` | — | Full host profile with earnings |
| Toggle online | `PUT /hosts/me/toggle-online` | `{ isOnline: true }` | `{ isOnline: true }` |
| Update location | `PUT /hosts/me/location` | `{ lat, lng }` | Success |
| Get today's bookings | `GET /bookings/host/my?scheduledDate=2026-07-01&status=host_confirmed` | Query | Today's confirmed bookings |

**Real-Time (Firebase RTDB):**
```javascript
// Listen for new booking requests
firebase.database()
  .ref(`/hosts/${myHostId}/pendingRequests`)
  .on('child_added', (snapshot) => {
    // Show notification: "New booking request!"
    // Play notification sound
  });
```

---

#### Screen: Booking Requests (`/host/requests`)

**Features:**
- List of pending booking requests with:
  - User name, avatar, trust score
  - Date, time, category
  - Pickup location (mini-map)
  - Distance from host's current location
  - Package name + estimated duration
  - Price (host's 70% share displayed)
- **Accept** / **Reject** buttons per request
- Reject requires reason selection (dropdown)
- Timer: "Respond within 5 minutes" countdown

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get pending requests | `GET /bookings/host/my?status=host_assigned&limit=10` | Query | Pending bookings |
| Accept booking | `PUT /bookings/:bookingId/host-response` | `{ action: "accept" }` | Updated booking (status: host_confirmed) |
| Reject booking | `PUT /bookings/:bookingId/host-response` | `{ action: "reject", rejectReason: "Not available" }` | Updated booking |

---

#### Screen: Host Active Session (`/host/session/:bookingId`)

**Features:**
- Map showing route to pickup (turn-by-turn via OpenRouteService)
- User's location pin (if user is sharing)
- **"START SESSION"** button (visible when host reaches pickup location)
- After start:
  - Live session timer (counting up)
  - Distance meter (counting up)
  - Remaining hours/km from plan (counting down)
  - Route tracking on map
  - Overage warning banner (when approaching limits: yellow at 90%, red at 100%)
- **"END SESSION"** button (with confirmation modal)
- Chat button → opens chat overlay
- 🚨 **SOS button** (prominent red — host can also trigger emergency)
- Contact user button (in-app call)

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Start session | `POST /sessions/:bookingId/start` | `{ location: { lat, lng } }` | Session data with included limits |
| End session | `POST /sessions/:bookingId/end` | `{ location: { lat, lng } }` | Session summary with final bill |
| **Trigger SOS (host)** | `POST /sos/trigger` | `{ bookingId, location: { lat, lng, accuracy } }` | `{ alertId, status: "active", emergencyNumber: "112", message: "Help is on the way" }` |

> **SOS flow for host:** Same endpoint as user SOS (`POST /sos/trigger`). The `triggerRole` is automatically set by the backend based on the caller's JWT role (`host`). After triggering SOS, the host is shown the same full-screen red overlay with the option to call 112 and a Cancel SOS button.

**Host Location Broadcasting (Firebase RTDB — direct write from host device):**
```javascript
// Host sends location every 5 seconds during active session
const watchId = navigator.geolocation.watchPosition((position) => {
  firebase.database()
    .ref(`/sessions/${bookingId}/hostLocation`)
    .set({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      heading: position.coords.heading,
      speed: position.coords.speed,
      updatedAt: Date.now()
    });
}, null, { enableHighAccuracy: true, maximumAge: 5000 });

// Also update location in backend (less frequently, for persistence)
// Every 30 seconds, call PUT /sessions/:bookingId/location
```

---

#### Screen: Host Earnings (`/host/earnings`)

**Features:**
- **Summary cards:**
  - Today: ₹3,450
  - This week: ₹18,200
  - This month: ₹52,300
  - Pending payout: ₹22,000
- **Earnings chart** (daily bar chart for last 30 days)
- **Transaction list:** Each completed session with:
  - Date, user name, category
  - Base pay (70% of booking)
  - Overage bonus (if applicable)
  - Total earned
- **Payout history:** Bank transfers with status (pending/completed)

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get earnings summary | `GET /hosts/me/earnings` | — | `{ today, thisWeek, thisMonth, total, pending }` |
| Get earnings history | `GET /hosts/me/earnings/history?limit=30&cursor=...` | Query | Paginated earnings per booking |

---

## 5. User Flow: Admin

### 5.1 Admin Dashboard (`/admin`)

**Features:**
- **KPI Cards:**
  - Today's bookings (with trend arrow ↑↓)
  - Active sessions right now
  - Revenue today
  - New users today
  - Active SOS alerts (RED if > 0)
- **Live activity chart** (real-time)
- **Recent bookings list**
- **Alerts panel** (SOS, failed payments, KYC pending)
- **Quick actions:** Review KYC, Process payouts

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get dashboard stats | `GET /admin/dashboard` | — | `{ today: {...}, thisMonth: {...} }` |
| Get recent bookings | `GET /admin/bookings?limit=10&sortBy=createdAt` | Query | Recent bookings |
| Get active SOS alerts | `GET /sos/active` | — | Array of active SOS alerts |
| Get pending KYC | `GET /hosts/pending-kyc?limit=10` | Query | Hosts awaiting KYC review |

**Real-Time (Firebase RTDB):**
```javascript
// Listen for SOS alerts (CRITICAL — must be real-time)
firebase.database()
  .ref('/sos')
  .orderByChild('status')
  .equalTo('active')
  .on('child_added', (snapshot) => {
    // ALARM: Show full-screen SOS alert
    // Play alarm sound
    // Show location on map
  });
```

---

### 5.2 Admin User Management (`/admin/users`)

| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| List users | `GET /admin/users?search=rahul&role=user&status=active&limit=20` | Query | Paginated users |
| View user detail | `GET /users/:userId` | — | Full user profile |
| Suspend user | `PUT /admin/users/:userId/suspend` | `{ reason: "Policy violation" }` | Updated user |
| Reactivate user | `PUT /admin/users/:userId/suspend` | `{ status: "active" }` | Updated user |

---

### 5.3 Admin Host Management (`/admin/hosts`)

| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| List hosts | `GET /admin/hosts?kycStatus=pending&limit=20` | Query | Paginated hosts |
| Review KYC | `GET /hosts/:hostId` (includes KYC doc URLs) | — | Host profile with KYC docs |
| Approve KYC | `PUT /hosts/:hostId/kyc-status` | `{ kycStatus: "verified" }` | Updated host |
| Reject KYC | `PUT /hosts/:hostId/kyc-status` | `{ kycStatus: "rejected", rejectionReason: "..." }` | Updated host |

---

### 5.4 Admin GPS Monitoring (`/admin/monitoring`)

**Features:**
- Full-screen map showing ALL active sessions
- Each session = two pins (host + user) connected by route line
- Click on session → sidebar with details (host name, user name, duration, status)
- Filter by: city, category, status
- SOS alerts highlighted in RED with pulsing animation

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get active sessions | `GET /admin/sessions/active` | — | Array of active sessions with location data |

**Real-Time (Firebase RTDB):**
```javascript
// Listen to ALL active session locations
firebase.database()
  .ref('/sessions')
  .on('value', (snapshot) => {
    const sessions = snapshot.val();
    // Update all markers on admin map
  });
```

---

### 5.5 Admin Finance (`/admin/finance`)

**Features:**
- Revenue report with date range selector
- Revenue breakdown: total, platform share (30%), host share (70%), GST collected, refunds issued
- Daily chart (bar graph)
- Pending host payouts list with "Process Payout" action
- Completed payouts history
- **Refund management:** List of refund-eligible cancelled bookings; admin initiates refund
- System configuration (pricing, matching, billing params)

| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Revenue report | `GET /admin/finance/revenue?startDate=2026-07-01&endDate=2026-07-31` | Query | `{ totalRevenue, platformShare, hostShare, refunds, netRevenue, dailyBreakdown: [...] }` |
| Pending payouts | `GET /admin/finance/payouts?status=pending` | Query | Array of pending host payouts |
| Process payout | `POST /admin/finance/payout` | `{ hostId, amount, transactionIds: [...] }` | Payout confirmation |
| **Initiate refund** | `POST /payments/refund` | `{ bookingId, amount, reason: "Cancelled within window" }` | `{ refundId, status: "processing", estimatedDays: 5 }` |
| Get system config | `GET /admin/config` | — | All config objects |
| Update config | `PUT /admin/config/:configKey` | `{ values: { ... } }` | Updated config |

---

### 5.6 Admin SOS Center (`/admin/sos`)

**Features:**
- Real-time list of all **active** SOS alerts (auto-updates via Firebase RTDB)
- Each alert card shows:
  - Triggerer name + role (user/host)
  - Booking details (other party name, category)
  - Location on mini-map with coordinates
  - Time elapsed since trigger
  - Assigned agent (if any)
- **Actions per alert:**
  - ✅ **Resolve** — Mark as resolved after situation handled
  - ❌ **False Alarm** — Mark as false alarm
  - 👤 **Assign Agent** — Assign ops team member
  - 🚔 **Mark Emergency Called** — Record that 112 was contacted
- Clicking alert → full detail view (SOS detail modal)
- History tab: all past resolved/false-alarm alerts

**API Calls:**
| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get active SOS alerts | `GET /sos/active` | — | Array of active SOS alert objects |
| Get SOS detail | `GET /sos/:alertId` | — | Full alert with booking, user/host details, location, timeline |
| Resolve alert | `PUT /sos/:alertId/status` | `{ status: "resolved", notes: "User confirmed safe" }` | Updated alert |
| Mark false alarm | `PUT /sos/:alertId/status` | `{ status: "false_alarm", notes: "Accidental trigger" }` | Updated alert |
| Assign agent | `PUT /sos/:alertId/status` | `{ status: "responding", assignedAgentId: "adminUserId" }` | Updated alert |
| Mark emergency called | `PUT /sos/:alertId/status` | `{ emergencyServicesCalled: true }` | Updated alert |

**Real-Time (Firebase RTDB):**
```javascript
// Listen for new SOS alerts (CRITICAL — must be real-time, unmissable)
firebase.database()
  .ref('/sos')
  .orderByChild('status')
  .equalTo('active')
  .on('child_added', (snapshot) => {
    const alert = snapshot.val();
    // ALARM: Show full-screen SOS alert modal
    // Play alarm sound (loop until dismissed)
    // Center map on alert location
  });

// Listen for status changes (e.g., another agent resolves it)
firebase.database()
  .ref('/sos')
  .on('child_changed', (snapshot) => {
    const alert = snapshot.val();
    if (alert.status !== 'active') {
      // Remove from active list, move to resolved list
    }
  });
```

---

### 5.7 Admin Promotions Management (`/admin/promotions`)

**Features:**
- List of all promotions (active + past)
- Each promotion: title, image, discount type, discount value, date range, status badge
- **Create Promotion** button → modal/form:
  - Title, description
  - Banner image (upload → Cloudinary)
  - Target audience (All / New Users / Subscribers)
  - Discount type (Percentage / Flat)
  - Discount value
  - Promo code (optional)
  - Start date / End date
- **Edit** button per promotion
- **Deactivate/Delete** button per promotion

| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| List all promotions | `GET /admin/bookings?limit=20` *(use promotions endpoint)* `GET /promotions/active` + admin variant | — | All promotions |
| Create promotion | `POST /promotions` | `{ title, description, imageUrl, targetAudience, discountType, discountValue, promoCode, startDate, endDate }` | Created promotion |
| Edit promotion | `PUT /promotions/:promoId` | Updated fields | Updated promotion |
| Deactivate promotion | `DELETE /promotions/:promoId` | — | Success |

---

### 5.8 Admin Audit Logs (`/admin/audit-logs`)

**Features:**
- Searchable, filterable table of all system actions
- Columns: Timestamp | Entity | Action | Performed By | Role | IP Address
- Filters: Entity type (USER/BOOKING/HOST/SOS), Action type, Date range, User
- Click row → detail modal with full `changes` diff (old value → new value)
- Examples logged:
  - `USER#uuid: LOGIN` by user
  - `BOOKING#uuid: CANCEL` by user
  - `HOST#uuid: KYC_APPROVED` by admin
  - `SOS#uuid: SOS_TRIGGER` by user
  - `CONFIG#billing: UPDATE` by admin

| Action | API Call | Sends | Receives |
|--------|---------|-------|----------|
| Get audit logs | `GET /admin/audit-logs?entityType=BOOKING&action=CANCEL&startDate=2026-07-01&limit=50&cursor=...` | Query | `{ data: [...logs], meta: { cursor, hasMore } }` |

---

## 6. API Integration Guide

### Authentication Flow Diagram

```
┌──────────────┐     ┌───────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │────▶│ Firebase Auth  │────▶│  PlusOne API │────▶│   DynamoDB   │
│              │     │   SDK          │     │  (Express)   │     │              │
│ 1. User      │     │               │     │              │     │              │
│    clicks    │     │ 2. Google      │     │ 4. Verify    │     │ 5. Lookup    │
│    "Login    │     │    popup /     │     │    Firebase   │     │    user by   │
│    with      │     │    OTP flow    │     │    ID token   │     │    firebase  │
│    Google"   │     │               │     │              │     │    UID       │
│              │◀────│ 3. Returns    │     │              │     │              │
│              │     │    ID Token   │     │ 6. Return    │◀────│ 7. Return    │
│              │◀────│              │◀────│    user +     │     │    user      │
│              │     │               │     │    role       │     │    record    │
└──────────────┘     └───────────────┘     └──────────────┘     └──────────────┘
```

### Error Handling Pattern

```javascript
// Frontend API wrapper with error handling
async function apiCall(endpoint, options = {}) {
  try {
    const token = await firebase.auth().currentUser?.getIdToken();
    
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    const result = await response.json();

    if (!result.success) {
      // Handle specific error codes
      switch (result.error.code) {
        case 'AUTH_TOKEN_INVALID':
        case 'AUTH_TOKEN_MISSING':
          // Token expired → refresh or redirect to login
          await firebase.auth().currentUser.getIdToken(true); // Force refresh
          return apiCall(endpoint, options); // Retry once
        
        case 'INSUFFICIENT_BALANCE':
          // Show "Buy more units" modal
          showBuyUnitsModal();
          break;
        
        case 'OUTSIDE_SERVICE_AREA':
          // Show "Not available in your area" message
          showToast("PlusOne is not available at this location yet");
          break;
        
        case 'RATE_LIMIT_EXCEEDED':
          // Show "Too many requests" message
          showToast("Please wait a moment and try again");
          break;
        
        default:
          showToast(result.error.message);
      }
      throw new ApiError(result.error);
    }

    return result.data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    // Network error
    showToast("Network error. Please check your connection.");
    throw error;
  }
}
```

### Pagination Pattern (DynamoDB cursor-based)

```javascript
// DynamoDB uses cursor-based pagination (not page numbers)
async function loadBookings(cursor = null) {
  const params = new URLSearchParams({
    limit: '20',
    ...(cursor && { cursor })
  });
  
  const result = await apiCall(`/bookings/my?${params}`);
  // result = { data: [...bookings], meta: { cursor: "...", hasMore: true } }
  
  setBookings(prev => [...prev, ...result.data]);
  setNextCursor(result.meta?.cursor);
  setHasMore(result.meta?.hasMore);
}

// Load more button
<button onClick={() => loadBookings(nextCursor)} disabled={!hasMore}>
  Load More
</button>
```

---

## 7. Real-Time Integration (Firebase RTDB)

### Setup

```javascript
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push, onChildAdded } from 'firebase/database';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "...",
  authDomain: "plusone-prod.firebaseapp.com",
  databaseURL: "https://plusone-prod-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "plusone-prod"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);
```

### Summary of Real-Time Listeners

| Feature | RTDB Path | Who Writes | Who Reads | Update Frequency |
|---------|-----------|-----------|-----------|-----------------|
| Host live location | `/sessions/{bookingId}/hostLocation` | Host device (SDK) | User device, Admin | Every 5 sec |
| User location (optional) | `/sessions/{bookingId}/userLocation` | User device (SDK) | Host device, Admin | Every 5 sec |
| Session status | `/sessions/{bookingId}/status` | Backend API | User, Host, Admin | On status change |
| ETA | `/sessions/{bookingId}/eta` | Backend API | User device | Every 30 sec |
| Chat messages | `/chats/{bookingId}/messages/{id}` | Backend API | User, Host | On send |
| Typing indicator | `/chats/{bookingId}/typing/{userId}` | Client SDK | Other party | On keystroke |
| SOS alerts | `/sos/{alertId}` | Backend API | Admin dashboard | On trigger |
| Host pending requests | `/hosts/{hostId}/pendingRequests/{id}` | Backend API | Host device | On new booking |
| User presence | `/presence/{userId}` | Client SDK | Admin | On connect/disconnect |

### Cleanup

```javascript
// Always clean up listeners when component unmounts
useEffect(() => {
  const locationRef = ref(db, `/sessions/${bookingId}/hostLocation`);
  const unsubscribe = onValue(locationRef, (snapshot) => {
    // handle update
  });
  
  return () => unsubscribe(); // cleanup on unmount
}, [bookingId]);
```

---

## 8. State Management Notes

### Recommended State Structure

```
Global State (Context / Redux / Zustand):
├── auth
│   ├── user: { userId, email, phone, displayName, role, isVerified }
│   ├── firebaseUser: Firebase Auth user object
│   ├── isLoading: boolean
│   └── isAuthenticated: boolean
│
├── wallet
│   ├── subscription: { subscriptionId, planId, hoursRemaining, kmRemaining, endDate } | null
│   ├── unitBalance: { hoursBalance, kmBalance }
│   └── isLoading: boolean
│
└── notifications
    ├── unreadCount: number
    └── items: [...notifications]

Local Component State:
├── Booking flow (multi-step form state)
├── Search filters
├── Chat messages
├── Map markers and route
└── Session metrics (timer, distance)
```

### Data Fetching Strategy

| Data | Strategy | Why |
|------|----------|-----|
| User profile | Fetch once on login, cache globally | Rarely changes |
| Categories | Fetch once on app load, cache | Never changes during session |
| Wallet balances | Fetch on wallet page open, refresh after payment | Changes after bookings |
| Bookings list | Fetch on page mount, pull-to-refresh | Changes frequently |
| Chat messages | Load initial via API, then real-time via RTDB | Needs both persistence + real-time |
| Location | Real-time only via RTDB | Always fresh |
| Notifications | Real-time count via RTDB, full list via API | Hybrid approach |

---

## 9. SEO & Performance

### Meta Tags per Page

| Page | Title | Meta Description |
|------|-------|-----------------|
| Landing | "PlusOne — Your Companion. Your Choice. Your Way." | "Combat urban loneliness with verified companions for coffee dates, city exploration, sports, and events. Book now in Mumbai, Delhi, Bengaluru." |
| Search | "Find Companions Near You — PlusOne" | "Search and filter verified companions by category, rating, language, and location. Book a coffee date, city tour, or sports partner today." |
| Package Detail | "{Package Name} — PlusOne" | "{Package description} — {Duration}h, {Distance}km from ₹{Price}. Book your companion experience today." |
| Host Profile | "{Host Name} — Verified PlusOne Host" | "{Host bio}. Rating: {rating}/5. {Total reviews} reviews. Book {Host Name} as your companion." |

### Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| First Contentful Paint | < 1.5s | SSR/SSG for landing page, code splitting |
| Largest Contentful Paint | < 2.5s | Optimized images via Cloudinary transforms |
| Map load time | < 2s | Lazy load Leaflet.js, load tiles on demand |
| API response time | < 500ms | DynamoDB single-digit ms reads, efficient queries |
| Real-time location latency | < 1s | Firebase RTDB direct SDK writes (no API call) |

---

## 10. Visualization Prompts

Use these prompts with an image generation tool to create user flow diagrams and UI concepts.

### Prompt 1: User Booking Flow

```
Create a user flow diagram for a companion booking platform called "PlusOne."
Show the complete booking journey as a horizontal flowchart with icons:

1. HOME SCREEN → Browse Categories (4 cards: Coffee, Explorer, Sports, Events)
2. → SEARCH & FILTER → Package/Host Results
3. → PACKAGE DETAILS → View inclusions, price, host preview
4. → CHOOSE PRICING (3 tabs: Subscription | Unit | Package)
5. → BOOKING DETAILS → Date, Time, Location (map pin), Special Instructions
6. → PAYMENT → Razorpay Checkout (UPI, Card, Netbanking)
7. → CONFIRMATION → "Finding your host..." → Host Assigned → Host Confirmed
8. → LIVE SESSION → Map with host location, timer, distance, chat, SOS button
9. → SESSION END → Receipt with price breakdown
10. → RATE & REVIEW → Star ratings for 4 categories + text review

Use purple gradient header, white cards, connecting arrows with step numbers.
Style: clean, modern, Figma-like process diagram. No device frames.
Dark background with glowing purple/blue connection lines.
```

### Prompt 2: Frontend Screen Map

```
Create a sitemap/screen map diagram for "PlusOne" web application.
Show all screens organized by user role with connecting navigation lines:

USER SCREENS (left column, blue):
- Landing Page → Login/Register → Complete Profile
- Home → Search/Filter → Package Details → Host Profile
- Booking: Pricing → Details → Payment → Confirmation
- Session: Live Tracking → Chat → SOS
- Post: Rating → Receipt
- Account: My Bookings → Wallet → Profile → Notifications

HOST SCREENS (middle column, green):
- Host Application (multi-step)
- Host Dashboard → Booking Requests → Accept/Reject
- Active Session → Start/End → Navigation
- Earnings → Payout History
- Profile → Availability Schedule

ADMIN SCREENS (right column, orange):
- Dashboard (KPIs) → User Management → Host Management (KYC Review)
- Live Monitoring (GPS Map) → SOS Center
- Finance → Revenue Reports → Payouts
- Config → Promotions → Analytics

Style: professional information architecture diagram, clean lines, color-coded by role.
Dark theme with glassmorphism cards.
```

### Prompt 3: API Integration Map

```
Create a diagram showing how the frontend connects to backend APIs for "PlusOne" platform.

Left side: Frontend screens (as rounded cards)
Right side: Backend API endpoints (as code-style blocks)
Center: Arrows showing which screen calls which API

Group by flow:
AUTH: Login Screen → POST /auth/register, POST /auth/verify-token
DISCOVERY: Home Screen → GET /categories, GET /packages/popular, GET /hosts/nearby  
BOOKING: Booking Screen → POST /bookings → POST /payments/verify
SESSION: Live Tracking → GET /sessions/{id} + Firebase RTDB listeners
POST: Rating Screen → POST /ratings

Also show Firebase RTDB connections as dashed lines:
Live Tracking ←--→ /sessions/{id}/hostLocation (WebSocket)
Chat ←--→ /chats/{id}/messages (WebSocket)
SOS ←--→ /sos/{id} (WebSocket)

Color: Purple for REST API calls, Blue for Firebase RTDB, Green for Razorpay.
Style: clean technical diagram, dark theme.
```

### Prompt 4: Complete System Connected (Frontend + Backend + Data)

```
Create a comprehensive full-system architecture diagram for "PlusOne" companion platform.

THREE LAYERS stacked vertically:

TOP LAYER - Frontend (3 interfaces):
┌─────────────────────────────────────────────┐
│  User Web App    Host Web App    Admin Panel │
│  (Browse/Book)   (Manage/Earn)   (Monitor)  │
└─────────────────────────────────────────────┘
Connected via: REST API + Firebase Auth SDK + Firebase RTDB SDK + Razorpay SDK

MIDDLE LAYER - Backend:
┌─────────────────────────────────────────────┐
│  Firebase Cloud Functions (Express.js)       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐    │
│  │ 15       │ │ Services │ │ Cron     │    │
│  │Controllers│ │ Billing  │ │ Jobs     │    │
│  │ Auth     │ │ Matching │ │ Backup   │    │
│  │ Booking  │ │ Geo      │ │ Expiry   │    │
│  │ Session  │ │ Safety   │ │ Scores   │    │
│  │ Payment  │ │ TrustScore│ │          │    │
│  │ ...      │ │          │ │          │    │
│  └──────────┘ └──────────┘ └──────────┘    │
└─────────────────────────────────────────────┘

BOTTOM LAYER - Data & External Services:
┌───────┐ ┌─────────┐ ┌──────────┐ ┌─────────┐ ┌────────────┐ ┌──────────┐
│DynamoDB│ │Firebase │ │Cloudinary│ │Razorpay │ │OpenRoute   │ │Firebase  │
│20 tbls │ │RTDB     │ │Images   │ │Payments │ │Service     │ │FCM       │
│36 GSIs │ │Real-time│ │KYC docs │ │UPI/Card │ │Road dist   │ │Push notif│
└───────┘ └─────────┘ └──────────┘ └─────────┘ └────────────┘ └──────────┘

Use gradient purple-blue header, dark background, white/glass cards.
Show data flow arrows between all layers.
Include small icons for each service.
Style: Premium startup pitch-deck quality, modern, clean.
```

---

> **End of Frontend Documentation**
>
> **Cross-Reference:**
> - For all API request/response schemas → see `backend_documentation.md` Section 6
> - For DynamoDB table structures → see `backend_documentation.md` Section 5
> - For billing logic details → see `backend_documentation.md` Section 7
> - For deployment → see `backend_documentation.md` Section 13
