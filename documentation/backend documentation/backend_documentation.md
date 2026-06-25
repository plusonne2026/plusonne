# PlusOne — Backend Technical Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-06-25  
> **Status:** Pre-Development Specification  
> **Runtime:** Node.js + Express.js  
> **Deployment:** Firebase Cloud Functions Gen2

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Tech Stack & Services](#2-tech-stack--services)
3. [Project Structure](#3-project-structure)
4. [Authentication & Authorization](#4-authentication--authorization)
5. [DynamoDB Schema Design](#5-dynamodb-schema-design)
6. [API Endpoints](#6-api-endpoints)
7. [Business Logic Engines](#7-business-logic-engines)
8. [Real-Time Architecture](#8-real-time-architecture)
9. [Middleware Stack](#9-middleware-stack)
10. [Logging Strategy](#10-logging-strategy)
11. [Backup & Recovery](#11-backup--recovery)
12. [Error Handling](#12-error-handling)
13. [Deployment & Infrastructure](#13-deployment--infrastructure)
14. [Visualization Prompts](#14-visualization-prompts)

---

## 1. Architecture Overview

### System Design Philosophy

PlusOne uses a **cross-cloud serverless architecture**:

- **Compute Layer:** Firebase Cloud Functions Gen2 (Google Cloud) — hosts the Express.js API
- **Persistent Data:** DynamoDB (AWS) — all business data, transactions, bookings
- **Real-Time Data:** Firebase Realtime Database (Google Cloud) — live locations, session status, chat presence
- **Auth:** Firebase Auth (Google Cloud) — Google OAuth, Email/Password, Phone OTP
- **Media:** Cloudinary — profile photos, KYC documents, chat images
- **Maps/Geo:** OpenRouteService (road distance) + Geohash (DynamoDB spatial queries)

### Why Cross-Cloud?

| Concern | Decision | Reasoning |
|---------|----------|-----------|
| DynamoDB on AWS, Functions on GCP | Both in Mumbai region | Cross-cloud latency Mumbai↔Mumbai ≈ 5-15ms (acceptable) |
| Why not Firestore? | DynamoDB chosen | More control over capacity, better for complex access patterns, familiar to team |
| Real-time without WebSocket? | Firebase RTDB | Cloud Functions can't hold WebSocket connections. Firebase RTDB provides real-time sync natively |

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Web Browser)                     │
│  Next.js / React / Any Frontend                             │
└──────────┬──────────────────────────────┬───────────────────┘
           │ REST API (HTTPS)             │ Real-Time (WebSocket)
           ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────┐
│ Firebase Cloud       │      │ Firebase Realtime DB      │
│ Functions Gen2       │      │ (Live Locations, Chat,    │
│ (Express.js API)     │      │  Session Status,          │
│                      │      │  Typing Indicators)       │
│ ┌──────────────────┐ │      └──────────────────────────┘
│ │  Middleware       │ │
│ │  ├─ Auth          │ │
│ │  ├─ RateLimit     │ │
│ │  ├─ Validation    │ │
│ │  └─ Logging       │ │
│ │                   │ │
│ │  Controllers      │ │
│ │  ├─ Auth          │ │
│ │  ├─ Booking       │ │
│ │  ├─ Payment       │ │
│ │  ├─ Session       │ │
│ │  ├─ Matching      │ │
│ │  └─ ...           │ │
│ └──────────────────┘ │
└──────┬────┬────┬─────┘
       │    │    │
       ▼    ▼    ▼
┌──────┐ ┌────┐ ┌──────────┐
│Dynamo│ │RTDB│ │Cloudinary│
│  DB  │ │    │ │          │
└──────┘ └────┘ └──────────┘
  AWS     GCP      SaaS

External Services:
├── Razorpay (Payments)
├── OpenRouteService (Road Distance)
├── Firebase Auth (Authentication)
├── Firebase Cloud Messaging (Push Notifications)
└── MSG91/Twilio (SMS - backup OTP)
```

---

## 2. Tech Stack & Services

| Layer | Technology | Purpose | Cost (MVP) |
|-------|-----------|---------|------------|
| **Runtime** | Node.js 20+ | Server runtime | Free |
| **Framework** | Express.js 4.x | REST API framework | Free |
| **Deployment** | Firebase Cloud Functions Gen2 | Serverless compute | ~2M free invocations/month |
| **Database** | AWS DynamoDB | Primary data store | 25 RCU + 25 WCU free forever |
| **Real-Time** | Firebase Realtime Database | Live updates | 1GB storage + 10GB/month transfer free |
| **Auth** | Firebase Auth | Authentication | 50K MAU free (Phone: 10K SMS/month free) |
| **Media** | Cloudinary | Image/document storage | 25 credits/month free (~25K transformations) |
| **Payments** | Razorpay | Payment processing | 2% per transaction, no monthly fee |
| **Maps (Distance)** | OpenRouteService | Road distance calculation | 2,000 req/day free |
| **Maps (Display)** | Leaflet + OpenStreetMap | Map rendering (frontend) | Free |
| **Push Notifications** | Firebase Cloud Messaging | Push notifications | Free (unlimited) |
| **Logging** | Winston + Cloud Logging | Structured logging | Free (within GCP limits) |
| **Containerization** | Docker | Future deployment | Free |

### NPM Dependencies (Backend)

```json
{
  "dependencies": {
    "express": "^4.18.x",
    "firebase-admin": "^12.x",
    "firebase-functions": "^5.x",
    "@aws-sdk/client-dynamodb": "^3.x",
    "@aws-sdk/lib-dynamodb": "^3.x",
    "razorpay": "^2.x",
    "cloudinary": "^2.x",
    "ngeohash": "^0.6.x",
    "joi": "^17.x",
    "helmet": "^7.x",
    "cors": "^2.x",
    "morgan": "^1.x",
    "winston": "^3.x",
    "uuid": "^9.x",
    "dayjs": "^1.x",
    "express-rate-limit": "^7.x"
  },
  "devDependencies": {
    "nodemon": "^3.x",
    "jest": "^29.x",
    "supertest": "^6.x",
    "eslint": "^8.x"
  }
}
```

---

## 3. Project Structure

```
plusone-backend/
│
├── functions/                        # Firebase Cloud Functions root
│   ├── src/
│   │   ├── index.js                  # Cloud Function entry point (exports Express app)
│   │   │
│   │   ├── app.js                    # Express app setup (middleware, routes)
│   │   │
│   │   ├── config/
│   │   │   ├── firebase.config.js    # Firebase Admin SDK init
│   │   │   ├── dynamodb.config.js    # DynamoDB client init
│   │   │   ├── cloudinary.config.js  # Cloudinary client init
│   │   │   ├── razorpay.config.js    # Razorpay client init
│   │   │   ├── constants.js          # App constants (roles, statuses, etc.)
│   │   │   └── env.js                # Environment variable loader
│   │   │
│   │   ├── clients/                  # External service wrappers
│   │   │   ├── dynamodb.client.js    # DynamoDB CRUD helpers (put, get, query, update, delete, transact)
│   │   │   ├── firebase-auth.client.js  # Firebase Auth admin operations
│   │   │   ├── firebase-rtdb.client.js  # Firebase Realtime DB read/write
│   │   │   ├── cloudinary.client.js  # Upload, delete, transform images
│   │   │   ├── razorpay.client.js    # Create order, verify payment, refund
│   │   │   ├── fcm.client.js         # Send push notifications
│   │   │   └── ors.client.js         # OpenRouteService API (road distance)
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js     # Verify Firebase ID token
│   │   │   ├── role.middleware.js     # Check user role (user/host/admin)
│   │   │   ├── validate.middleware.js # Joi schema validation
│   │   │   ├── rateLimit.middleware.js # Rate limiting per IP/user
│   │   │   ├── logging.middleware.js  # Request/response logging
│   │   │   └── error.middleware.js    # Global error handler
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js              # Route aggregator
│   │   │   ├── auth.routes.js
│   │   │   ├── user.routes.js
│   │   │   ├── host.routes.js
│   │   │   ├── category.routes.js
│   │   │   ├── package.routes.js
│   │   │   ├── booking.routes.js
│   │   │   ├── session.routes.js
│   │   │   ├── payment.routes.js
│   │   │   ├── subscription.routes.js
│   │   │   ├── unit.routes.js
│   │   │   ├── rating.routes.js
│   │   │   ├── chat.routes.js
│   │   │   ├── sos.routes.js
│   │   │   ├── notification.routes.js
│   │   │   ├── promotion.routes.js
│   │   │   └── admin.routes.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── auth.controller.js       # Register, login verification, token refresh
│   │   │   ├── user.controller.js       # User profile CRUD, search users
│   │   │   ├── host.controller.js       # Host profile, availability, earnings, KYC
│   │   │   ├── category.controller.js   # Category CRUD
│   │   │   ├── package.controller.js    # Package CRUD, search, filter
│   │   │   ├── booking.controller.js    # Create, cancel, list, status updates
│   │   │   ├── session.controller.js    # Start, end, location updates, overage
│   │   │   ├── payment.controller.js    # Create order, verify, webhook, refund
│   │   │   ├── subscription.controller.js # Subscribe, cancel, renew, balance
│   │   │   ├── unit.controller.js       # Purchase units, balance, history
│   │   │   ├── rating.controller.js     # Rate, get ratings, trust score
│   │   │   ├── chat.controller.js       # Send message, get history
│   │   │   ├── sos.controller.js        # Trigger SOS, update status, dispatch
│   │   │   ├── notification.controller.js # Get, mark read, clear
│   │   │   ├── promotion.controller.js  # Promo CRUD
│   │   │   └── admin.controller.js      # Dashboard stats, user/host mgmt, monitoring
│   │   │
│   │   ├── services/                 # Business logic (called by controllers)
│   │   │   ├── billing.service.js    # Price calculation, overage, balance deduction
│   │   │   ├── matching.service.js   # Host matching algorithm
│   │   │   ├── geolocation.service.js # Geohash, distance calc, geofencing
│   │   │   ├── notification.service.js # Push + in-app notification dispatch
│   │   │   ├── trustScore.service.js  # Calculate/update trust scores
│   │   │   └── backup.service.js     # DynamoDB export to S3
│   │   │
│   │   ├── validators/              # Joi validation schemas
│   │   │   ├── auth.validator.js
│   │   │   ├── booking.validator.js
│   │   │   ├── payment.validator.js
│   │   │   ├── host.validator.js
│   │   │   ├── rating.validator.js
│   │   │   └── common.validator.js
│   │   │
│   │   ├── utils/
│   │   │   ├── logger.js            # Winston logger setup
│   │   │   ├── response.js          # Standardized API response helper
│   │   │   ├── errors.js            # Custom error classes
│   │   │   ├── pagination.js        # DynamoDB pagination helper
│   │   │   ├── geohash.js           # Geohash encode/decode + neighbor calc
│   │   │   └── helpers.js           # Misc helpers (UUID, date formatting)
│   │   │
│   │   └── cron/                    # Scheduled Cloud Functions
│   │       ├── subscriptionExpiry.cron.js   # Check & expire subscriptions daily
│   │       ├── sessionTimeout.cron.js       # Auto-end stale sessions
│   │       ├── trustScoreRecalc.cron.js     # Recalculate trust scores weekly
│   │       ├── backupTrigger.cron.js        # Monthly DynamoDB → S3 export
│   │       └── locationCleanup.cron.js      # Clean up old RTDB location data
│   │
│   ├── package.json
│   └── .env.example
│
├── firebase.json                    # Firebase project config
├── .firebaserc                      # Firebase project alias
├── Dockerfile                       # Docker config (future)
└── README.md
```

---

## 4. Authentication & Authorization

### Auth Providers (via Firebase Auth)

| Provider | Method | Use Case |
|----------|--------|----------|
| **Google OAuth** | `signInWithPopup(GoogleAuthProvider)` | Quick social login |
| **Email/Password** | `createUserWithEmailAndPassword` | Traditional registration |
| **Phone + OTP** | `signInWithPhoneNumber` | Primary auth for Indian users |

### Auth Flow

```
1. Client authenticates with Firebase Auth (frontend SDK)
2. Client receives Firebase ID Token (JWT)
3. Client sends ID Token in Authorization header: `Bearer <idToken>`
4. Backend middleware verifies token using Firebase Admin SDK:
   firebase.auth().verifyIdToken(idToken)
5. Decoded token contains: uid, email, phone, provider
6. Middleware attaches user data to req.user
7. Role middleware checks user's role from DynamoDB
```

### Authorization Roles

| Role | Access Level |
|------|-------------|
| `user` | Own profile, bookings, sessions, chat, ratings |
| `host` | Own profile + host dashboard, booking requests, earnings, session management |
| `admin` | Everything — user management, host management, monitoring, finance, config |

### Role Middleware Logic

```javascript
// Role check happens AFTER auth verification
// 1. Get user record from DynamoDB using firebaseUid
// 2. Check if user.role matches required role(s)
// 3. Attach full user record to req.user for controllers
```

---

## 5. DynamoDB Schema Design

### Design Principles

1. **Multi-table design** — separate tables per domain for clarity and team collaboration
2. **Access pattern driven** — every GSI exists to serve a specific query pattern
3. **Denormalization** — duplicate data where needed to avoid cross-table lookups
4. **Transactions** — use `TransactWriteItems` for atomic multi-table writes (billing, booking)
5. **TTL** — auto-expire transient data (locations, notifications, audit logs)
6. **Geohash** — spatial queries using geohash prefix matching on GSI

### DynamoDB Capacity Mode

**On-Demand (Pay-per-Request)** for all tables during MVP:
- No capacity planning needed
- Auto-scales from 0 to thousands of req/sec
- Pay only for actual reads/writes
- Switch to Provisioned mode when patterns stabilize (cost optimization)

---

### Table 1: `PlusOne_Users`

**Purpose:** All user profiles (attendees, hosts, admins share this table)

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` (PK) | String (UUID) | Unique user identifier |
| `email` | String | Email address (nullable if phone-only) |
| `phone` | String | Phone number with country code |
| `displayName` | String | Full name |
| `avatarUrl` | String | Cloudinary URL |
| `role` | String | `user` / `host` / `admin` |
| `authProvider` | String | `google` / `email` / `phone` |
| `firebaseUid` | String | Firebase Auth UID |
| `isVerified` | Boolean | Email/phone verified |
| `status` | String | `active` / `suspended` / `deleted` |
| `city` | String | Current city |
| `coordinates` | Map | `{ lat, lng }` |
| `preferredLanguages` | List | `["en", "hi", "ta"]` |
| `trustScore` | Number | 0-100 calculated score |
| `totalBookings` | Number | Counter |
| `totalSpent` | Number | Lifetime spend (INR) |
| `referralCode` | String | Unique referral code |
| `createdAt` | String (ISO) | Account creation timestamp |
| `updatedAt` | String (ISO) | Last update timestamp |
| `lastLoginAt` | String (ISO) | Last login timestamp |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `EmailIndex` | `email` | — | Get user by email |
| `PhoneIndex` | `phone` | — | Get user by phone |
| `FirebaseUidIndex` | `firebaseUid` | — | Get user by Firebase UID (auth middleware) |
| `RoleStatusIndex` | `role` | `status#createdAt` | List users by role+status (admin: list all hosts) |
| `CityIndex` | `city` | `createdAt` | List users by city |

---

### Table 2: `PlusOne_HostProfiles`

**Purpose:** Extended data for hosts only (linked to Users table via userId)

| Attribute | Type | Description |
|-----------|------|-------------|
| `hostId` (PK) | String | Same as userId in Users table |
| `categories` | List | `["coffee_date", "explorer", "sports_partner"]` |
| `bio` | String | Host's self-description |
| `isOnline` | Boolean | Currently accepting bookings |
| `currentLocation` | Map | `{ lat, lng, geohash, updatedAt }` |
| `geohash6` | String | 6-char geohash of current location |
| `rating` | Number | Average rating (1.0-5.0) |
| `totalReviews` | Number | Count of reviews received |
| `totalCompletions` | Number | Successfully completed sessions |
| `totalCancellations` | Number | Cancelled sessions |
| `responseTimeAvg` | Number | Average response time in seconds |
| `completionRate` | Number | Percentage (0-100) |
| `languages` | List | `["English", "Hindi"]` |
| `experienceYears` | Number | Years of hosting experience |
| `kycStatus` | String | `pending` / `verified` / `rejected` |
| `kycDocuments` | Map | `{ aadhaarUrl, panUrl, photoUrl, videoUrl }` (Cloudinary URLs) |
| `bankDetails` | Map | `{ accountNumber, ifsc, accountHolderName }` (encrypted) |
| `hostTrustScore` | Number | 0-100 host-specific trust score |
| `earnings` | Map | `{ thisMonth, lastMonth, total, pending }` |
| `createdAt` | String (ISO) | Host onboarding date |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `CategoryRatingIndex` | `categories[0]` | `rating` | Find top hosts in a category *(Note: DynamoDB doesn't index list items. We denormalize: one item per category the host serves, or use a flattened `primaryCategory` field)* |
| `GeohashIndex` | `geohash6` | `rating` | Find nearby hosts sorted by rating (geospatial query) |
| `OnlineStatusIndex` | `isOnline` | `rating` | Find available hosts sorted by rating |
| `KYCStatusIndex` | `kycStatus` | `createdAt` | Admin: review pending KYC applications |

**⚠️ Important Note on CategoryRatingIndex:**

DynamoDB cannot index individual items within a List. To support "find hosts by category," we use one of two strategies:

**Strategy A (Recommended): Category-Host Junction Table**
Create a separate `PlusOne_HostCategories` table:

| Attribute | Type | Description |
|-----------|------|-------------|
| `categoryId` (PK) | String | Category slug |
| `hostId` (SK) | String | Host ID |
| `rating` | Number | Duplicated from HostProfiles for sort |
| `isOnline` | Boolean | Duplicated for filtering |
| `geohash6` | String | Duplicated for geo queries |

GSI: `CategoryOnlineRatingIndex` → PK=`categoryId`, SK=`isOnline#rating`

**Strategy B: Primary Category Field**
Add `primaryCategory` field to HostProfiles. Simpler but limits to one category.

**→ We use Strategy A.** It supports multi-category hosts and efficient queries.

---

### Table 3: `PlusOne_HostCategories` (Junction Table)

| Attribute | Type | Description |
|-----------|------|-------------|
| `categoryId` (PK) | String | Category slug (`coffee_date`, `explorer`, etc.) |
| `hostId` (SK) | String | Host user ID |
| `hostName` | String | Denormalized for display |
| `rating` | Number | Denormalized from HostProfiles |
| `isOnline` | Boolean | Denormalized |
| `geohash6` | String | Denormalized |
| `city` | String | Denormalized |

**GSI:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `CategoryCityRatingIndex` | `categoryId#city` | `rating` | Find hosts in a category in a city, sorted by rating |
| `HostCategoriesIndex` | `hostId` | `categoryId` | Get all categories a host serves |

---

### Table 4: `PlusOne_Categories`

**Purpose:** Service category definitions

| Attribute | Type | Description |
|-----------|------|-------------|
| `categoryId` (PK) | String | Slug: `coffee_date`, `explorer`, etc. |
| `name` | String | Display name: "Coffee Date" |
| `description` | String | Category description |
| `iconUrl` | String | Cloudinary URL for category icon |
| `isActive` | Boolean | Enabled/disabled |
| `displayOrder` | Number | Sort order on home screen |
| `createdAt` | String (ISO) | |

**No GSI needed** — small table, `Scan` is acceptable. Cached in memory.

---

### Table 5: `PlusOne_Packages`

**Purpose:** Pre-defined experience packages

| Attribute | Type | Description |
|-----------|------|-------------|
| `packageId` (PK) | String (UUID) | Unique package ID |
| `categoryId` | String | Which category this belongs to |
| `name` | String | "Delhi Heritage Tour" |
| `description` | String | Detailed description |
| `durationHours` | Number | Included time (hours) |
| `distanceKm` | Number | Included distance (km) |
| `basePrice` | Number | Base price in INR |
| `images` | List | Cloudinary URLs |
| `inclusions` | List | What's included (text items) |
| `extraCharges` | Map | `{ perExtraHour: 200, perExtraKm: 15 }` |
| `cancellationPolicy` | Map | `{ freeCancelHoursBefore: 24, cancellationFee: 100 }` |
| `city` | String | City where this package is available |
| `isActive` | Boolean | |
| `popularity` | Number | Booking count (for sorting) |
| `createdAt` | String (ISO) | |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `CategoryCityIndex` | `categoryId` | `city#popularity` | Get packages in a category by city, sorted by popularity |
| `CityPopularityIndex` | `city` | `popularity` | Get popular packages in a city |
| `ActiveIndex` | `isActive` | `popularity` | Get all active packages sorted by popularity |

---

### Table 6: `PlusOne_PricingPlans`

**Purpose:** Subscription plan definitions (admin-managed)

| Attribute | Type | Description |
|-----------|------|-------------|
| `planId` (PK) | String | `monthly_basic`, `annual_premium`, etc. |
| `name` | String | "Monthly Basic" |
| `type` | String | `monthly` / `annual` |
| `price` | Number | INR per period |
| `hoursIncluded` | Number | Total hours per period |
| `kmIncluded` | Number | Total KM per period |
| `overageDiscount` | Number | % discount on overage (e.g., 20) |
| `priorityBooking` | Boolean | Priority in matching queue |
| `features` | List | Feature description strings |
| `isActive` | Boolean | |
| `displayOrder` | Number | |
| `createdAt` | String (ISO) | |

**No GSI needed** — very small table, cached in memory.

---

### Table 7: `PlusOne_Subscriptions`

**Purpose:** Active/past user subscriptions

| Attribute | Type | Description |
|-----------|------|-------------|
| `subscriptionId` (PK) | String (UUID) | |
| `userId` | String | User who subscribed |
| `planId` | String | Reference to PricingPlans |
| `status` | String | `active` / `expired` / `cancelled` |
| `startDate` | String (ISO) | |
| `endDate` | String (ISO) | |
| `hoursRemaining` | Number | Balance hours |
| `kmRemaining` | Number | Balance KM |
| `autoRenew` | Boolean | |
| `paymentId` | String | Razorpay payment ID |
| `price` | Number | Amount paid |
| `createdAt` | String (ISO) | |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `UserSubscriptionIndex` | `userId` | `createdAt` | Get user's subscription history |
| `StatusEndDateIndex` | `status` | `endDate` | Cron: find expiring subscriptions |
| `UserActiveIndex` | `userId` | `status` | Quick check: does this user have an active subscription? |

---

### Table 8: `PlusOne_UnitBalances`

**Purpose:** User's purchased time/distance unit balances

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` (PK) | String | User ID |
| `hoursBalance` | Number | Available hours |
| `kmBalance` | Number | Available kilometers |
| `totalHoursPurchased` | Number | Lifetime total |
| `totalKmPurchased` | Number | Lifetime total |
| `totalHoursUsed` | Number | Lifetime used |
| `totalKmUsed` | Number | Lifetime used |
| `lastUpdated` | String (ISO) | |

**No GSI needed** — always accessed by userId (PK lookup).

---

### Table 9: `PlusOne_Bookings`

**Purpose:** All bookings (the core transactional table)

| Attribute | Type | Description |
|-----------|------|-------------|
| `bookingId` (PK) | String (UUID) | |
| `userId` | String | Customer |
| `hostId` | String | Assigned host (null initially) |
| `packageId` | String | Package booked (null if unit-based) |
| `categoryId` | String | Service category |
| `pricingModel` | String | `subscription` / `unit` / `package` |
| `status` | String | See status enum below |
| `scheduledDate` | String | `YYYY-MM-DD` |
| `scheduledTime` | String | `HH:mm` |
| `pickupLocation` | Map | `{ lat, lng, address, geohash6 }` |
| `specialInstructions` | String | Free-text user notes |
| `price` | Map | `{ base, extras, overage, discount, tax, total, currency }` |
| `hostRejections` | List | `[{ hostId, reason, timestamp }]` |
| `matchAttempts` | Number | How many hosts were tried |
| `assignedAt` | String (ISO) | When host was assigned |
| `confirmedAt` | String (ISO) | When host confirmed |
| `startedAt` | String (ISO) | Session start time |
| `completedAt` | String (ISO) | Session end time |
| `cancelledAt` | String (ISO) | Cancellation time |
| `cancelledBy` | String | `user` / `host` / `system` |
| `cancelReason` | String | |
| `createdAt` | String (ISO) | |
| `updatedAt` | String (ISO) | |

**Booking Status Enum:**
```
pending_payment → pending_assignment → host_assigned → host_confirmed →
active → completed → rated
                  ↘ cancelled
                  ↘ disputed
```

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `UserBookingsIndex` | `userId` | `createdAt` | User's booking history (newest first) |
| `HostBookingsIndex` | `hostId` | `createdAt` | Host's booking history |
| `StatusDateIndex` | `status` | `scheduledDate` | Admin: get pending/active bookings by date |
| `DateIndex` | `scheduledDate` | `createdAt` | Admin: all bookings on a specific date |
| `UserStatusIndex` | `userId` | `status#createdAt` | User's bookings filtered by status |

---

### Table 10: `PlusOne_Sessions`

**Purpose:** Active session tracking data (detailed metrics during a live session)

| Attribute | Type | Description |
|-----------|------|-------------|
| `bookingId` (PK) | String | Links to Bookings table |
| `status` | String | `awaiting_host` / `host_en_route` / `in_progress` / `completed` |
| `startTime` | String (ISO) | Actual session start |
| `endTime` | String (ISO) | Actual session end |
| `startLocation` | Map | `{ lat, lng, address }` |
| `endLocation` | Map | `{ lat, lng, address }` |
| `totalDistanceKm` | Number | Actual distance covered |
| `totalTimeMinutes` | Number | Actual time elapsed |
| `includedHours` | Number | Hours included in plan/package |
| `includedKm` | Number | KM included in plan/package |
| `overageHours` | Number | Extra hours beyond included |
| `overageKm` | Number | Extra KM beyond included |
| `overageCharges` | Number | INR charged for overage |
| `finalBill` | Map | `{ base, overage, discount, total }` |
| `routePoints` | List | `[{ lat, lng, timestamp }]` — sampled every 30 sec |
| `createdAt` | String (ISO) | |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `ActiveSessionsIndex` | `status` | `startTime` | Admin: get all active sessions |

---

### Table 11: `PlusOne_Transactions`

**Purpose:** All financial transactions (payments, refunds, payouts)

| Attribute | Type | Description |
|-----------|------|-------------|
| `transactionId` (PK) | String (UUID) | |
| `userId` | String | User involved |
| `type` | String | `payment` / `refund` / `payout` / `unit_purchase` / `subscription_purchase` |
| `amount` | Number | INR |
| `currency` | String | `INR` |
| `status` | String | `pending` / `success` / `failed` / `refunded` |
| `razorpayOrderId` | String | Razorpay order ID |
| `razorpayPaymentId` | String | Razorpay payment ID |
| `razorpaySignature` | String | For verification |
| `bookingId` | String | Related booking (if applicable) |
| `subscriptionId` | String | Related subscription (if applicable) |
| `description` | String | Human-readable description |
| `metadata` | Map | Any extra data |
| `createdAt` | String (ISO) | |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `UserTransactionsIndex` | `userId` | `createdAt` | User's transaction history |
| `BookingTransactionsIndex` | `bookingId` | `createdAt` | Transactions for a booking |
| `StatusTypeIndex` | `status` | `type#createdAt` | Admin: get failed transactions |
| `RazorpayOrderIndex` | `razorpayOrderId` | — | Webhook: lookup by Razorpay order |

---

### Table 12: `PlusOne_Ratings`

**Purpose:** Two-way ratings after session completion

| Attribute | Type | Description |
|-----------|------|-------------|
| `ratingId` (PK) | String (UUID) | |
| `bookingId` | String | Which booking this rating is for |
| `raterId` | String | Who gave the rating |
| `rateeId` | String | Who received the rating |
| `raterRole` | String | `user` / `host` |
| `scores` | Map | Role-dependent scores (see below) |
| `overallScore` | Number | 1.0-5.0 average of category scores |
| `comment` | String | Optional text review |
| `videoReviewUrl` | String | Cloudinary URL (for video testimonials) |
| `createdAt` | String (ISO) | |

**Score Categories:**
- **User rating host:** `{ professionalism, friendliness, communication, punctuality }` (each 1-5)
- **Host rating user:** `{ behaviour, respect, safety, cooperation }` (each 1-5)

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `RateeIndex` | `rateeId` | `createdAt` | Get all ratings for a person |
| `BookingRatingIndex` | `bookingId` | `raterRole` | Get ratings for a booking |
| `RaterIndex` | `raterId` | `createdAt` | Get all ratings given by a person |

---

### Table 13: `PlusOne_ChatMessages`

**Purpose:** In-app chat messages between host and user during a booking

| Attribute | Type | Description |
|-----------|------|-------------|
| `bookingId` (PK) | String | Conversation = Booking |
| `messageId` (SK) | String | `{timestamp}#{uuid}` (for sort order) |
| `senderId` | String | Who sent the message |
| `senderRole` | String | `user` / `host` / `system` |
| `content` | String | Message text |
| `contentType` | String | `text` / `image` / `location` / `system` |
| `mediaUrl` | String | Cloudinary URL (for images) |
| `isRead` | Boolean | Read receipt |
| `createdAt` | String (ISO) | |

**No GSI needed** — always queried by bookingId (PK). Messages sorted by SK (timestamp).

**Note:** Chat messages are stored in DynamoDB for persistence. **Real-time delivery** uses Firebase Realtime Database (see Section 8).

---

### Table 14: `PlusOne_SOSAlerts`

**Purpose:** Emergency SOS alerts from users or hosts

| Attribute | Type | Description |
|-----------|------|-------------|
| `alertId` (PK) | String (UUID) | |
| `bookingId` | String | Active booking when SOS triggered |
| `triggeredBy` | String | User/Host ID who triggered |
| `triggerRole` | String | `user` / `host` |
| `location` | Map | `{ lat, lng, address, accuracy }` |
| `status` | String | `active` / `responding` / `resolved` / `false_alarm` |
| `assignedAgentId` | String | Ops agent handling the alert |
| `emergencyServicesCalled` | Boolean | Whether 112/police were called |
| `notes` | String | Agent's notes |
| `resolvedAt` | String (ISO) | |
| `createdAt` | String (ISO) | |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `StatusIndex` | `status` | `createdAt` | Ops: get active/pending alerts |
| `BookingIndex` | `bookingId` | `createdAt` | Get alerts for a booking |
| `AgentIndex` | `assignedAgentId` | `status#createdAt` | Agent: my assigned alerts |

---

### Table 15: `PlusOne_Notifications`

**Purpose:** In-app notification history

| Attribute | Type | Description |
|-----------|------|-------------|
| `userId` (PK) | String | Recipient |
| `notificationId` (SK) | String | `{timestamp}#{uuid}` |
| `type` | String | `booking` / `payment` / `sos` / `promo` / `system` |
| `title` | String | Notification title |
| `body` | String | Notification body |
| `data` | Map | Deep-link data `{ bookingId, screen, etc. }` |
| `isRead` | Boolean | |
| `createdAt` | String (ISO) | |
| `ttl` | Number | Unix epoch for DynamoDB TTL (auto-delete after 30 days) |

**No GSI needed** — always queried by userId (PK), sorted by SK (timestamp).

---

### Table 16: `PlusOne_ServiceAreas`

**Purpose:** Geofencing — defines where PlusOne operates

| Attribute | Type | Description |
|-----------|------|-------------|
| `areaId` (PK) | String | `mumbai`, `delhi`, `bengaluru` |
| `name` | String | Display name |
| `city` | String | City name |
| `state` | String | State |
| `isActive` | Boolean | |
| `centerLat` | Number | Center latitude |
| `centerLng` | Number | Center longitude |
| `radiusKm` | Number | Service radius from center |
| `boundaryPolygon` | List | `[{ lat, lng }, ...]` — polygon vertices |
| `geohashPrefixes` | List | Pre-computed geohash prefixes covering this area |
| `createdAt` | String (ISO) | |

**No GSI needed** — small table, loaded into memory on function cold start.

---

### Table 17: `PlusOne_Promotions`

**Purpose:** Promotional banners and offers

| Attribute | Type | Description |
|-----------|------|-------------|
| `promotionId` (PK) | String (UUID) | |
| `title` | String | Promo title |
| `description` | String | |
| `imageUrl` | String | Cloudinary URL |
| `targetAudience` | String | `all` / `new_users` / `subscribers` |
| `discountType` | String | `percentage` / `flat` |
| `discountValue` | Number | |
| `promoCode` | String | Optional coupon code |
| `startDate` | String (ISO) | |
| `endDate` | String (ISO) | |
| `isActive` | Boolean | |
| `createdAt` | String (ISO) | |

**GSI:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `ActivePromosIndex` | `isActive` | `startDate` | Get current active promotions |

---

### Table 18: `PlusOne_AuditLogs`

**Purpose:** System audit trail for compliance and debugging

| Attribute | Type | Description |
|-----------|------|-------------|
| `entityKey` (PK) | String | `{entityType}#{entityId}` (e.g., `USER#uuid`, `BOOKING#uuid`) |
| `logId` (SK) | String | `{timestamp}#{uuid}` |
| `action` | String | `CREATE` / `UPDATE` / `DELETE` / `LOGIN` / `SOS_TRIGGER` / etc. |
| `performedBy` | String | User ID who performed the action |
| `performerRole` | String | `user` / `host` / `admin` / `system` |
| `changes` | Map | `{ field: { old: x, new: y } }` |
| `ipAddress` | String | |
| `userAgent` | String | |
| `createdAt` | String (ISO) | |
| `ttl` | Number | Unix epoch — auto-delete after 90 days |

**GSIs:**

| GSI Name | PK | SK | Access Pattern |
|----------|----|----|----------------|
| `PerformedByIndex` | `performedBy` | `createdAt` | Admin: what did this user do? |
| `ActionIndex` | `action` | `createdAt` | Admin: all SOS triggers, all deletions, etc. |

---

### Table 19: `PlusOne_HostAvailability`

**Purpose:** Host weekly schedule and date-specific overrides

| Attribute | Type | Description |
|-----------|------|-------------|
| `hostId` (PK) | String | |
| `scheduleKey` (SK) | String | `WEEKLY#{dayOfWeek}` (0-6) or `DATE#{YYYY-MM-DD}` |
| `isAvailable` | Boolean | |
| `slots` | List | `[{ startTime: "09:00", endTime: "18:00" }]` |
| `createdAt` | String (ISO) | |

**Access Patterns:**
- Get weekly schedule: `Query PK=hostId, SK begins_with("WEEKLY#")`
- Get specific date override: `GetItem PK=hostId, SK="DATE#2026-07-01"`
- Check availability for a date: Check date override first, fall back to weekly

**No GSI needed** — always queried by hostId.

---

### Table 20: `PlusOne_Config`

**Purpose:** System-wide configuration (admin-managed, config-driven behavior)

| Attribute | Type | Description |
|-----------|------|-------------|
| `configKey` (PK) | String | `matching`, `booking`, `billing`, `sos`, `general` |
| `values` | Map | Configuration values (see examples below) |
| `updatedAt` | String (ISO) | |
| `updatedBy` | String | Admin user ID |

**Example Config Values:**

```json
// configKey: "matching"
{
  "maxRejectionChain": 3,
  "hostResponseTimeoutMinutes": 5,
  "matchRadiusKm": 15,
  "weightRating": 0.4,
  "weightDistance": 0.3,
  "weightCompletionRate": 0.2,
  "weightResponseTime": 0.1
}

// configKey: "booking"
{
  "maxAdvanceBookingDays": 30,
  "minBookingLeadTimeHours": 2,
  "freeCancellationHoursBefore": 24,
  "lateCancellationFeePercent": 25
}

// configKey: "billing"
{
  "defaultOveragePerHour": 200,
  "defaultOveragePerKm": 15,
  "subscriberOverageDiscount": 20,
  "gstPercent": 18,
  "platformCommission": 30,
  "hostShare": 70
}

// configKey: "sos"
{
  "autoEscalateAfterMinutes": 2,
  "notifyNearbyAgentsRadiusKm": 5,
  "emergencyNumber": "112"
}
```

---

### Schema Summary

| # | Table Name | PK | SK | GSI Count | TTL |
|---|-----------|----|----|-----------|-----|
| 1 | PlusOne_Users | userId | — | 5 | No |
| 2 | PlusOne_HostProfiles | hostId | — | 4 | No |
| 3 | PlusOne_HostCategories | categoryId | hostId | 2 | No |
| 4 | PlusOne_Categories | categoryId | — | 0 | No |
| 5 | PlusOne_Packages | packageId | — | 3 | No |
| 6 | PlusOne_PricingPlans | planId | — | 0 | No |
| 7 | PlusOne_Subscriptions | subscriptionId | — | 3 | No |
| 8 | PlusOne_UnitBalances | userId | — | 0 | No |
| 9 | PlusOne_Bookings | bookingId | — | 5 | No |
| 10 | PlusOne_Sessions | bookingId | — | 1 | No |
| 11 | PlusOne_Transactions | transactionId | — | 4 | No |
| 12 | PlusOne_Ratings | ratingId | — | 3 | No |
| 13 | PlusOne_ChatMessages | bookingId | messageId | 0 | No |
| 14 | PlusOne_SOSAlerts | alertId | — | 3 | No |
| 15 | PlusOne_Notifications | userId | notificationId | 0 | 30 days |
| 16 | PlusOne_ServiceAreas | areaId | — | 0 | No |
| 17 | PlusOne_Promotions | promotionId | — | 1 | No |
| 18 | PlusOne_AuditLogs | entityKey | logId | 2 | 90 days |
| 19 | PlusOne_HostAvailability | hostId | scheduleKey | 0 | No |
| 20 | PlusOne_Config | configKey | — | 0 | No |
| **Total** | **20 tables** | | | **36 GSIs** | |

---

## 6. API Endpoints

### Base URL
```
Production: https://us-central1-plusone-prod.cloudfunctions.net/api
Development: http://localhost:5001/plusone-dev/us-central1/api
```

### Standard Response Format

```json
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "lastEvaluatedKey": "..." // DynamoDB pagination cursor
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking with ID xyz does not exist",
    "status": 404
  }
}
```

### Standard Headers

```
Authorization: Bearer <firebase-id-token>
Content-Type: application/json
X-Request-ID: <uuid>  (auto-generated by middleware if missing)
```

---

### 6.1 Auth Routes (`/api/auth`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/auth/register` | No | — | Register new user (after Firebase Auth signup) |
| 2 | POST | `/auth/verify-token` | Yes | — | Verify Firebase token and return user profile |
| 3 | POST | `/auth/complete-profile` | Yes | — | Complete profile after social login |
| 4 | DELETE | `/auth/delete-account` | Yes | any | Delete user account |

**POST `/auth/register`**
```
Request:
{
  "firebaseUid": "abc123",
  "email": "user@example.com",        // optional
  "phone": "+919876543210",            // optional
  "displayName": "Rahul Sharma",
  "authProvider": "google|email|phone",
  "city": "Mumbai"
}

Response:
{
  "success": true,
  "data": {
    "userId": "uuid",
    "email": "...",
    "phone": "...",
    "displayName": "...",
    "role": "user",
    "isVerified": false,
    "trustScore": 50,
    "createdAt": "2026-06-25T14:00:00Z"
  }
}

Operations:
1. Verify firebaseUid exists in Firebase Auth
2. Check if user already exists in DynamoDB (FirebaseUidIndex)
3. Create user record in PlusOne_Users
4. Create initial UnitBalances record (0 hours, 0 km)
5. Generate unique referral code
6. Return user object
```

**POST `/auth/verify-token`**
```
Request: (no body, token in Authorization header)

Response:
{
  "success": true,
  "data": {
    "userId": "...",
    "role": "user|host|admin",
    "isVerified": true,
    "...full user profile..."
  }
}

Operations:
1. Verify Firebase ID token
2. Lookup user in DynamoDB by firebaseUid
3. Update lastLoginAt
4. Return full user profile
```

---

### 6.2 User Routes (`/api/users`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/users/me` | Yes | any | Get own profile |
| 2 | PUT | `/users/me` | Yes | any | Update own profile |
| 3 | GET | `/users/:userId` | Yes | admin | Get any user's profile |
| 4 | PUT | `/users/:userId/status` | Yes | admin | Suspend/activate user |
| 5 | GET | `/users` | Yes | admin | List all users (paginated, filterable) |

**PUT `/users/me`**
```
Request:
{
  "displayName": "Rahul Sharma",
  "avatarUrl": "https://cloudinary.com/...",  
  "city": "Delhi",
  "coordinates": { "lat": 28.6139, "lng": 77.2090 },
  "preferredLanguages": ["en", "hi"]
}

Response: { "success": true, "data": { ...updatedUser } }

Operations:
1. Validate input (Joi)
2. If avatarUrl changed, upload to Cloudinary first (separate endpoint)
3. Update user in PlusOne_Users
4. Log change in PlusOne_AuditLogs
5. Return updated user
```

---

### 6.3 Host Routes (`/api/hosts`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/hosts/register` | Yes | user | Apply to become a host |
| 2 | GET | `/hosts/me` | Yes | host | Get own host profile |
| 3 | PUT | `/hosts/me` | Yes | host | Update host profile |
| 4 | PUT | `/hosts/me/availability` | Yes | host | Set weekly schedule |
| 5 | PUT | `/hosts/me/toggle-online` | Yes | host | Go online/offline |
| 6 | PUT | `/hosts/me/location` | Yes | host | Update current location |
| 7 | GET | `/hosts/me/earnings` | Yes | host | Get earnings summary |
| 8 | GET | `/hosts/me/earnings/history` | Yes | host | Get payout history |
| 9 | POST | `/hosts/me/kyc` | Yes | host | Upload KYC documents |
| 10 | GET | `/hosts/:hostId` | Yes | any | Get host public profile |
| 11 | GET | `/hosts` | Yes | any | Search/filter hosts |
| 12 | GET | `/hosts/nearby` | Yes | user | Find nearby available hosts |
| 13 | PUT | `/hosts/:hostId/kyc-status` | Yes | admin | Approve/reject KYC |
| 14 | GET | `/hosts/pending-kyc` | Yes | admin | List pending KYC applications |

**POST `/hosts/register`**
```
Request:
{
  "bio": "Friendly local guide with 5 years experience...",
  "categories": ["explorer", "coffee_date"],
  "languages": ["English", "Hindi", "Marathi"],
  "experienceYears": 5,
  "bankDetails": {
    "accountNumber": "1234567890",
    "ifsc": "SBIN0001234",
    "accountHolderName": "Arjun Singh"
  }
}

Response: { "success": true, "data": { ...hostProfile, kycStatus: "pending" } }

Operations:
1. Validate input
2. Create HostProfiles record (kycStatus: "pending")
3. Create HostCategories records (one per category)
4. Update Users table: role → "host" (pending verification)
5. Notify admin (new KYC application)
6. Log in AuditLogs
```

**GET `/hosts/nearby`**
```
Query Params:
  ?lat=19.0760&lng=72.8777&radiusKm=10&categoryId=coffee_date&minRating=4.0&limit=20

Response:
{
  "success": true,
  "data": [
    {
      "hostId": "...",
      "hostName": "Arjun Singh",
      "avatarUrl": "...",
      "rating": 4.8,
      "totalReviews": 128,
      "languages": ["English", "Hindi"],
      "distanceKm": 3.2,
      "isOnline": true,
      "categories": ["coffee_date", "explorer"]
    }
  ]
}

Operations:
1. Encode (lat, lng) → geohash6 using ngeohash
2. Compute 9-square neighbors (center + 8 adjacent geohash cells)
3. Query HostCategories.CategoryCityRatingIndex OR HostProfiles.GeohashIndex
   for each neighbor geohash prefix
4. Filter results: Haversine distance ≤ radiusKm, isOnline=true, minRating filter
5. Sort by distance (or rating, or weighted score)
6. Return paginated results
```

---

### 6.4 Category Routes (`/api/categories`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/categories` | No | — | List all active categories |
| 2 | GET | `/categories/:categoryId` | No | — | Get category details |
| 3 | POST | `/categories` | Yes | admin | Create category |
| 4 | PUT | `/categories/:categoryId` | Yes | admin | Update category |

---

### 6.5 Package Routes (`/api/packages`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/packages` | No | — | List packages (filter by category, city) |
| 2 | GET | `/packages/:packageId` | No | — | Get package details |
| 3 | GET | `/packages/popular` | No | — | Get popular packages (home screen) |
| 4 | POST | `/packages` | Yes | admin | Create package |
| 5 | PUT | `/packages/:packageId` | Yes | admin | Update package |
| 6 | DELETE | `/packages/:packageId` | Yes | admin | Deactivate package |

**GET `/packages`**
```
Query Params:
  ?categoryId=explorer&city=Delhi&minPrice=500&maxPrice=5000&sortBy=popularity&limit=20&cursor=...

Response:
{
  "success": true,
  "data": [
    {
      "packageId": "...",
      "name": "Delhi Heritage Tour",
      "categoryId": "explorer",
      "durationHours": 2,
      "distanceKm": 20,
      "basePrice": 1500,
      "images": ["https://cloudinary.com/..."],
      "inclusions": ["Guided tour", "Historical sites", "Photo opportunities"],
      "extraCharges": { "perExtraHour": 200, "perExtraKm": 15 },
      "popularity": 342,
      "city": "Delhi"
    }
  ],
  "meta": { "cursor": "...", "hasMore": true }
}
```

---

### 6.6 Booking Routes (`/api/bookings`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/bookings` | Yes | user | Create new booking |
| 2 | GET | `/bookings/:bookingId` | Yes | any | Get booking details |
| 3 | GET | `/bookings/my` | Yes | user | Get my bookings (user) |
| 4 | GET | `/bookings/host/my` | Yes | host | Get my bookings (host) |
| 5 | PUT | `/bookings/:bookingId/cancel` | Yes | user/host | Cancel booking |
| 6 | PUT | `/bookings/:bookingId/host-response` | Yes | host | Accept/reject booking |
| 7 | PUT | `/bookings/:bookingId/swap-host` | Yes | user | Request different host |
| 8 | GET | `/bookings` | Yes | admin | List all bookings (admin) |

**POST `/bookings`** (Most complex endpoint)
```
Request:
{
  "packageId": "uuid",                     // null if unit-based
  "categoryId": "coffee_date",
  "pricingModel": "package|unit|subscription",
  "scheduledDate": "2026-07-01",
  "scheduledTime": "14:00",
  "pickupLocation": {
    "lat": 19.0760,
    "lng": 72.8777,
    "address": "Marine Drive, Mumbai"
  },
  "specialInstructions": "I prefer someone who speaks Hindi",
  "preferredHostId": null                  // null for auto-match
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "uuid",
    "status": "pending_payment",
    "price": {
      "base": 1500,
      "extras": 0,
      "discount": 0,
      "tax": 270,
      "total": 1770,
      "currency": "INR"
    },
    "razorpayOrderId": "order_xyz",
    "assignedHost": null
  }
}

Operations (atomic transaction):
1. Validate input
2. Check user is verified
3. Check pickup location is within service area (geofence check)
4. Calculate price based on pricingModel:
   a. PACKAGE: Use package.basePrice
   b. UNIT: Estimate hours+km, check user has sufficient balance
   c. SUBSCRIPTION: Check active subscription, check remaining hours+km
5. Create Razorpay order
6. Create Booking record (status: pending_payment)
7. Create Transaction record (status: pending)
8. Return booking with Razorpay order details
```

**PUT `/bookings/:bookingId/host-response`**
```
Request:
{
  "action": "accept|reject",
  "rejectReason": "Not available"        // required if reject
}

Response: { "success": true, "data": { ...updatedBooking } }

Operations:
If ACCEPT:
  1. Update Booking: status → host_confirmed, confirmedAt = now
  2. Create Session record (status: awaiting_host)
  3. Notify user: "Your host has confirmed!"
  4. Set up Firebase RTDB path for live tracking

If REJECT:
  1. Add rejection to booking.hostRejections[]
  2. Increment matchAttempts
  3. If matchAttempts < config.maxRejectionChain:
     → Run matching engine again for next best host
     → Update Booking: hostId → newHostId
     → Notify new host
  4. If matchAttempts >= config.maxRejectionChain:
     → Update Booking: status → "pending_assignment"
     → Notify user: "We're finding you another host"
     → Escalate to admin
```

---

### 6.7 Session Routes (`/api/sessions`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/sessions/:bookingId/start` | Yes | host | Start session |
| 2 | POST | `/sessions/:bookingId/end` | Yes | host | End session |
| 3 | PUT | `/sessions/:bookingId/location` | Yes | host/user | Update location during session |
| 4 | GET | `/sessions/:bookingId` | Yes | any | Get session details |
| 5 | GET | `/sessions/:bookingId/route` | Yes | any | Get route history |
| 6 | GET | `/sessions/active` | Yes | admin | Get all active sessions |

**POST `/sessions/:bookingId/start`**
```
Request:
{
  "location": { "lat": 19.0760, "lng": 72.8777 }
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "...",
    "sessionStatus": "in_progress",
    "startTime": "2026-07-01T14:02:00Z",
    "startLocation": { "lat": 19.0760, "lng": 72.8777 },
    "includedHours": 2,
    "includedKm": 20,
    "trackingEnabled": true
  }
}

Operations:
1. Verify booking status is "host_confirmed"
2. Verify caller is the assigned host
3. Update Session: status → in_progress, startTime, startLocation
4. Update Booking: status → active, startedAt
5. Write to Firebase RTDB: /sessions/{bookingId}/status = "in_progress"
6. Notify user: "Your session has started!"
7. Log in AuditLogs
```

**POST `/sessions/:bookingId/end`**
```
Request:
{
  "location": { "lat": 19.0890, "lng": 72.8650 }
}

Response:
{
  "success": true,
  "data": {
    "bookingId": "...",
    "sessionStatus": "completed",
    "startTime": "...",
    "endTime": "2026-07-01T16:15:00Z",
    "totalTimeMinutes": 133,
    "totalDistanceKm": 22.5,
    "includedHours": 2,
    "includedKm": 20,
    "overageHours": 0.22,
    "overageKm": 2.5,
    "finalBill": {
      "base": 1500,
      "overageTime": 44,
      "overageDistance": 37.5,
      "discount": 0,
      "total": 1581.5,
      "currency": "INR"
    }
  }
}

Operations (CRITICAL — atomic transaction):
1. Verify booking is active, caller is assigned host
2. Calculate total time = endTime - startTime
3. Calculate total distance from route points (sum of segments via Haversine)
4. Call billing service to calculate overage:
   a. PACKAGE: Compare against package.durationHours, package.distanceKm
   b. UNIT: Deduct actual usage from UnitBalances
   c. SUBSCRIPTION: Deduct from subscription remaining, apply overage discount
5. Update Session: status → completed, all metrics, finalBill
6. Update Booking: status → completed, completedAt, price.total
7. If overage > 0: Create additional Transaction for overage charges
8. If UNIT: Update UnitBalances (deduct actual used hours/km)
9. If SUBSCRIPTION: Update Subscription (deduct actual used hours/km)
10. Clean up Firebase RTDB: delete /sessions/{bookingId}
11. Notify both parties: "Session completed! Please rate your experience"
12. Log in AuditLogs
```

---

### 6.8 Payment Routes (`/api/payments`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/payments/create-order` | Yes | user | Create Razorpay order |
| 2 | POST | `/payments/verify` | Yes | user | Verify payment after completion |
| 3 | POST | `/payments/webhook` | No | — | Razorpay webhook (server-to-server) |
| 4 | POST | `/payments/refund` | Yes | admin | Initiate refund |
| 5 | GET | `/payments/history` | Yes | any | Get payment history |

**POST `/payments/verify`**
```
Request:
{
  "razorpayOrderId": "order_xyz",
  "razorpayPaymentId": "pay_abc",
  "razorpaySignature": "sig_def",
  "bookingId": "uuid"
}

Response: { "success": true, "data": { "paymentVerified": true, "bookingStatus": "pending_assignment" } }

Operations:
1. Verify Razorpay signature using HMAC SHA256
2. If valid:
   a. Update Transaction: status → success, add razorpayPaymentId
   b. Update Booking: status → pending_assignment
   c. If pricingModel is "unit": Deduct estimated units from UnitBalances (reserve)
   d. If pricingModel is "subscription": Reserve hours/km from subscription
   e. Trigger matching engine → find and assign best host
   f. Notify assigned host about new booking
3. If invalid:
   a. Update Transaction: status → failed
   b. Update Booking: status → payment_failed
   c. Return error
```

---

### 6.9 Subscription Routes (`/api/subscriptions`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/subscriptions/plans` | No | — | List available plans |
| 2 | POST | `/subscriptions/subscribe` | Yes | user | Subscribe to a plan |
| 3 | GET | `/subscriptions/my` | Yes | user | Get my active subscription |
| 4 | PUT | `/subscriptions/:subId/cancel` | Yes | user | Cancel subscription |
| 5 | PUT | `/subscriptions/:subId/toggle-autorenew` | Yes | user | Toggle auto-renewal |

**POST `/subscriptions/subscribe`**
```
Request:
{
  "planId": "monthly_basic",
  "autoRenew": true
}

Response:
{
  "success": true,
  "data": {
    "subscriptionId": "uuid",
    "planId": "monthly_basic",
    "status": "active",
    "hoursRemaining": 100,
    "kmRemaining": 80,
    "startDate": "2026-07-01",
    "endDate": "2026-07-31",
    "razorpayOrderId": "order_xyz"
  }
}

Operations:
1. Check user doesn't have an existing active subscription
2. Get plan details from PricingPlans
3. Create Razorpay order for plan price
4. After payment verification:
   a. Create Subscription record (status: active)
   b. Create Transaction record
   c. Notify user: "Subscription activated!"
```

---

### 6.10 Unit Routes (`/api/units`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/units/purchase` | Yes | user | Purchase time or distance units |
| 2 | GET | `/units/balance` | Yes | user | Get current balances |
| 3 | GET | `/units/history` | Yes | user | Get purchase/usage history |

**POST `/units/purchase`**
```
Request:
{
  "type": "hours|km",
  "amount": 10,
  "pricePerUnit": 150          // Server validates this against current pricing
}

Response:
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_xyz",
    "purchase": {
      "type": "hours",
      "amount": 10,
      "totalPrice": 1500
    }
  }
}

Operations:
1. Validate unit type and amount
2. Calculate total price (server-side, not from client)
3. Create Razorpay order
4. After payment verification:
   a. Update UnitBalances: add purchased amount
   b. Create Transaction record
   c. Notify user: "10 hours added to your balance!"
```

---

### 6.11 Rating Routes (`/api/ratings`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/ratings` | Yes | user/host | Submit rating for a completed booking |
| 2 | GET | `/ratings/for/:userId` | Yes | any | Get ratings received by a user/host |
| 3 | GET | `/ratings/booking/:bookingId` | Yes | any | Get ratings for a booking |
| 4 | GET | `/ratings/my-given` | Yes | any | Get ratings I've given |

**POST `/ratings`**
```
Request:
{
  "bookingId": "uuid",
  "scores": {
    "professionalism": 5,       // For user rating host
    "friendliness": 4,
    "communication": 5,
    "punctuality": 4
  },
  "comment": "Great experience!",
  "videoReviewUrl": null
}

Response: { "success": true, "data": { ...rating } }

Operations:
1. Verify booking is completed
2. Verify rater was part of this booking (either user or host)
3. Verify rater hasn't already rated this booking
4. Calculate overallScore = average of category scores
5. Create Rating record
6. Update ratee's average rating (in Users or HostProfiles)
7. Trigger trust score recalculation
8. If videoReviewUrl provided: Generate 10-20% discount code for next booking
9. Update Booking: status → "rated" (if both sides have rated)
```

---

### 6.12 Chat Routes (`/api/chat`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/chat/:bookingId/send` | Yes | user/host | Send a chat message |
| 2 | GET | `/chat/:bookingId/messages` | Yes | user/host | Get chat history (paginated) |
| 3 | PUT | `/chat/:bookingId/read` | Yes | user/host | Mark messages as read |
| 4 | POST | `/chat/:bookingId/media` | Yes | user/host | Upload image to chat |

**POST `/chat/:bookingId/send`**
```
Request:
{
  "content": "I'll be there in 10 minutes!",
  "contentType": "text"
}

Response: { "success": true, "data": { ...message } }

Operations:
1. Verify caller is part of this booking
2. Verify booking is in active state (confirmed or active)
3. Create ChatMessage in DynamoDB (persistent storage)
4. Write to Firebase RTDB: /chats/{bookingId}/messages/{messageId}
   (triggers real-time update on the other person's device)
5. Send push notification to the other party (if app is backgrounded)
```

---

### 6.13 SOS Routes (`/api/sos`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | POST | `/sos/trigger` | Yes | user/host | Trigger SOS alert |
| 2 | PUT | `/sos/:alertId/status` | Yes | admin | Update SOS alert status |
| 3 | GET | `/sos/active` | Yes | admin | Get all active SOS alerts |
| 4 | GET | `/sos/:alertId` | Yes | admin | Get SOS alert details |

**POST `/sos/trigger`**
```
Request:
{
  "bookingId": "uuid",
  "location": { "lat": 19.0760, "lng": 72.8777, "accuracy": 15 }
}

Response:
{
  "success": true,
  "data": {
    "alertId": "uuid",
    "status": "active",
    "emergencyNumber": "112",
    "message": "SOS alert triggered. Help is on the way."
  }
}

Operations (HIGHEST PRIORITY — no delays):
1. Create SOSAlert record immediately
2. Write to Firebase RTDB: /sos/{alertId} (real-time for ops dashboard)
3. Send PUSH notification to ALL online admin/ops users
4. Send SMS to designated ops team numbers
5. Capture and store location snapshot
6. If other party (user/host) is in session → send them alert too
7. If auto-escalation enabled → set timer for emergency services notification
8. Log in AuditLogs with full context
```

---

### 6.14 Notification Routes (`/api/notifications`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/notifications` | Yes | any | Get my notifications (paginated) |
| 2 | PUT | `/notifications/read` | Yes | any | Mark notifications as read |
| 3 | GET | `/notifications/unread-count` | Yes | any | Get unread count |

---

### 6.15 Promotion Routes (`/api/promotions`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/promotions/active` | No | — | Get active promotions (home screen carousel) |
| 2 | POST | `/promotions` | Yes | admin | Create promotion |
| 3 | PUT | `/promotions/:promoId` | Yes | admin | Update promotion |
| 4 | DELETE | `/promotions/:promoId` | Yes | admin | Deactivate promotion |
| 5 | POST | `/promotions/validate-code` | Yes | user | Validate promo code |

---

### 6.16 Admin Routes (`/api/admin`)

| # | Method | Endpoint | Auth | Role | Description |
|---|--------|----------|------|------|-------------|
| 1 | GET | `/admin/dashboard` | Yes | admin | Dashboard stats (revenue, bookings, users) |
| 2 | GET | `/admin/users` | Yes | admin | List/search users |
| 3 | PUT | `/admin/users/:userId/suspend` | Yes | admin | Suspend user |
| 4 | GET | `/admin/hosts` | Yes | admin | List/search hosts |
| 5 | GET | `/admin/bookings` | Yes | admin | List/filter bookings |
| 6 | GET | `/admin/sessions/active` | Yes | admin | Monitor active sessions (GPS) |
| 7 | GET | `/admin/finance/revenue` | Yes | admin | Revenue report |
| 8 | GET | `/admin/finance/payouts` | Yes | admin | Pending/completed payouts |
| 9 | POST | `/admin/finance/payout` | Yes | admin | Process host payout |
| 10 | GET | `/admin/audit-logs` | Yes | admin | View audit logs |
| 11 | PUT | `/admin/config/:configKey` | Yes | admin | Update system config |
| 12 | GET | `/admin/config` | Yes | admin | Get all system config |

**GET `/admin/dashboard`**
```
Response:
{
  "success": true,
  "data": {
    "today": {
      "totalBookings": 47,
      "activeBookings": 12,
      "completedBookings": 31,
      "cancelledBookings": 4,
      "revenue": 47000,
      "newUsers": 23,
      "newHosts": 2,
      "sosAlerts": 0
    },
    "thisMonth": {
      "totalBookings": 1243,
      "revenue": 1243000,
      "avgRating": 4.6,
      "repeatBookingRate": 34,
      "activeSubscribers": 156,
      "activeHosts": 78
    }
  }
}
```

---

### API Summary

| Controller | Endpoint Count | Base Path |
|-----------|---------------|-----------|
| Auth | 4 | `/api/auth` |
| Users | 5 | `/api/users` |
| Hosts | 14 | `/api/hosts` |
| Categories | 4 | `/api/categories` |
| Packages | 6 | `/api/packages` |
| Bookings | 8 | `/api/bookings` |
| Sessions | 6 | `/api/sessions` |
| Payments | 5 | `/api/payments` |
| Subscriptions | 5 | `/api/subscriptions` |
| Units | 3 | `/api/units` |
| Ratings | 4 | `/api/ratings` |
| Chat | 4 | `/api/chat` |
| SOS | 4 | `/api/sos` |
| Notifications | 3 | `/api/notifications` |
| Promotions | 5 | `/api/promotions` |
| Admin | 12 | `/api/admin` |
| **TOTAL** | **92** | |

---

## 7. Business Logic Engines

### 7.1 Billing Engine (`billing.service.js`)

The billing engine handles price calculation for all 3 pricing models.

#### Price Calculation Flow

```
Input: { pricingModel, packageId?, hours?, km?, userId }

IF pricingModel === "package":
  1. Get package from PlusOne_Packages
  2. basePrice = package.basePrice
  3. No balance check needed (pay-per-package)
  4. Overage rates from package.extraCharges

IF pricingModel === "unit":
  1. Get user's UnitBalances
  2. Estimate required hours + km
  3. Check: hoursBalance >= estimatedHours AND kmBalance >= estimatedKm
  4. If insufficient → return error "Insufficient balance"
  5. basePrice = 0 (already paid via unit purchase)
  6. Reserve estimated units (soft hold)

IF pricingModel === "subscription":
  1. Get user's active Subscription
  2. If no active sub → return error "No active subscription"
  3. Check: hoursRemaining >= estimatedHours AND kmRemaining >= estimatedKm
  4. If insufficient → warn "Overage charges will apply"
  5. basePrice = 0 (covered by subscription)
  6. Reserve estimated hours/km

COMMON:
  7. Apply promo code discount (if any)
  8. Calculate GST (18%)
  9. Return: { base, extras, discount, tax, total }
```

#### Overage Calculation (at session end)

```
Input: { bookingId, actualHours, actualKm }

1. Get booking + session data
2. Get included hours/km:
   - PACKAGE: from package.durationHours, package.distanceKm
   - UNIT: from reserved units
   - SUBSCRIPTION: from reserved subscription balance

3. Calculate overage:
   overageHours = max(0, actualHours - includedHours)
   overageKm = max(0, actualKm - includedKm)

4. Calculate overage charges:
   IF PACKAGE:
     overageCharge = (overageHours × package.extraCharges.perExtraHour)
                   + (overageKm × package.extraCharges.perExtraKm)
   IF UNIT:
     overageCharge = (overageHours × config.defaultOveragePerHour)
                   + (overageKm × config.defaultOveragePerKm)
   IF SUBSCRIPTION:
     discount = config.subscriberOverageDiscount (20%)
     overageCharge = ((overageHours × config.defaultOveragePerHour)
                   + (overageKm × config.defaultOveragePerKm)) × (1 - discount/100)

5. If UNIT and actual < reserved:
   → Refund unused units back to UnitBalances

6. If SUBSCRIPTION and actual < reserved:
   → Return unused hours/km back to subscription balance
```

#### Revenue Split (at payout)

```
For each completed booking:
  totalRevenue = booking.price.total (excl GST)
  hostShare = totalRevenue × config.hostShare / 100  (70%)
  platformShare = totalRevenue × config.platformCommission / 100  (30%)

  Payout to host bank account via Razorpay Route/X
```

---

### 7.2 Matching Engine (`matching.service.js`)

#### Algorithm: Weighted Score Matching

```
Input: { booking (with location, category, scheduledDate, scheduledTime) }
Output: { bestHost, score, alternatives[] }

1. FILTER — Get candidate hosts:
   a. Query HostCategories table: categoryId = booking.categoryId
   b. Filter: isOnline = true
   c. Filter: Within service area (geohash prefix match)
   d. Filter: Available on scheduledDate/scheduledTime
      (check HostAvailability table)
   e. Filter: Not in booking.hostRejections list
   f. Filter: hostId ≠ userId (can't book yourself)

2. SCORE — Calculate match score for each candidate:
   
   weights = config.matching weights (from PlusOne_Config)
   
   For each host:
     distanceKm = roadDistance(booking.pickupLocation, host.currentLocation)
       // Call OpenRouteService API
     
     distanceScore = max(0, 1 - (distanceKm / config.matchRadiusKm))
     ratingScore = host.rating / 5.0
     completionScore = host.completionRate / 100
     responseScore = max(0, 1 - (host.responseTimeAvg / 600))
       // 600 seconds = 10 min max acceptable
     
     totalScore = (weights.distance × distanceScore)
                + (weights.rating × ratingScore)
                + (weights.completionRate × completionScore)
                + (weights.responseTime × responseScore)
     
     // BONUS: Priority booking for subscribers
     if booking.user has active subscription with priorityBooking:
       totalScore += 0.1

3. SORT — Rank candidates by totalScore descending

4. ASSIGN — Select top candidate as bestHost

5. Return bestHost + top 3 alternatives (for user swap)
```

---

### 7.3 Geolocation Service (`geolocation.service.js`)

#### Geohash-based Nearby Search

```javascript
// Using ngeohash library
const geohash = require('ngeohash');

function findNearbyHosts(lat, lng, radiusKm) {
  // 1. Encode location to geohash (precision 6 = ~1.2km × 0.6km cells)
  const centerHash = geohash.encode(lat, lng, 6);
  
  // 2. Get 9-square neighbors
  const neighbors = geohash.neighbors(centerHash);
  const searchHashes = [centerHash, ...Object.values(neighbors)];
  
  // 3. Query DynamoDB for each geohash prefix
  // (batch query HostProfiles.GeohashIndex where geohash6 IN searchHashes)
  
  // 4. Post-filter using Haversine formula
  // Keep only hosts where haversineDistance(lat, lng, host.lat, host.lng) <= radiusKm
  
  // 5. Return filtered + sorted results
}
```

#### Road Distance Calculation

```javascript
// Using OpenRouteService API
async function getRoadDistance(originLat, originLng, destLat, destLng) {
  const response = await fetch(
    `https://api.openrouteservice.org/v2/directions/driving-car?` +
    `start=${originLng},${originLat}&end=${destLng},${destLat}`,
    { headers: { 'Authorization': process.env.ORS_API_KEY } }
  );
  
  const data = await response.json();
  return {
    distanceKm: data.features[0].properties.segments[0].distance / 1000,
    durationMinutes: data.features[0].properties.segments[0].duration / 60
  };
}
```

#### Geofence Check (is point inside service area?)

```javascript
function isPointInServiceArea(lat, lng, serviceArea) {
  // Ray-casting algorithm for point-in-polygon
  const polygon = serviceArea.boundaryPolygon;
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat, yi = polygon[i].lng;
    const xj = polygon[j].lat, yj = polygon[j].lng;
    
    const intersect = ((yi > lng) !== (yj > lng))
      && (lat < (xj - xi) * (lng - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  
  return inside;
}
```

---

## 8. Real-Time Architecture

### Why Firebase Realtime Database (RTDB)?

Firebase Cloud Functions **cannot hold WebSocket connections.** For real-time features, we use Firebase RTDB as a **pub/sub layer**:

- Backend writes data to RTDB → Frontend listens and gets instant updates
- RTDB handles connection management, reconnection, offline sync
- Free tier: 1GB storage + 10GB/month transfer

### RTDB Data Structure

```json
{
  "sessions": {
    "{bookingId}": {
      "status": "in_progress",
      "hostLocation": {
        "lat": 19.0760,
        "lng": 72.8777,
        "heading": 45,
        "speed": 30,
        "updatedAt": 1719835200000
      },
      "userLocation": {          // Optional (user controls sharing)
        "lat": 19.0800,
        "lng": 72.8800,
        "updatedAt": 1719835200000
      },
      "eta": {
        "minutes": 8,
        "distanceKm": 3.2
      }
    }
  },
  
  "chats": {
    "{bookingId}": {
      "messages": {
        "{messageId}": {
          "senderId": "...",
          "content": "On my way!",
          "contentType": "text",
          "timestamp": 1719835200000
        }
      },
      "typing": {
        "{userId}": true          // Typing indicator
      }
    }
  },
  
  "sos": {
    "{alertId}": {
      "status": "active",
      "location": { "lat": 19.0760, "lng": 72.8777 },
      "triggeredBy": "user123",
      "bookingId": "booking456",
      "createdAt": 1719835200000
    }
  },
  
  "presence": {
    "{userId}": {
      "online": true,
      "lastSeen": 1719835200000
    }
  }
}
```

### RTDB Security Rules

```json
{
  "rules": {
    "sessions": {
      "$bookingId": {
        ".read": "auth != null",
        ".write": "auth != null"
        // In production: validate that auth.uid is part of this booking
      }
    },
    "chats": {
      "$bookingId": {
        ".read": "auth != null",
        ".write": "auth != null"
      }
    },
    "sos": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "presence": {
      "$userId": {
        ".read": "auth != null",
        ".write": "auth.uid === $userId"
      }
    }
  }
}
```

### Real-Time Data Flow

```
LOCATION TRACKING:
  Host device → Firebase RTDB /sessions/{id}/hostLocation (direct write via SDK)
  User device → subscribes to /sessions/{id}/hostLocation (real-time listener)
  (Host location is updated every 5 seconds during active session)

CHAT:
  Sender → POST /api/chat/{bookingId}/send → 
    Backend saves to DynamoDB (persistence) + writes to RTDB (real-time)
  Receiver → listens to RTDB /chats/{bookingId}/messages (instant delivery)

SOS:
  User/Host → POST /api/sos/trigger →
    Backend writes to RTDB /sos/{alertId} + DynamoDB
  Admin Dashboard → listens to RTDB /sos (instant alert)

BOOKING STATUS:
  When booking status changes (host_confirmed, active, completed):
    Backend writes to RTDB /sessions/{bookingId}/status
    Client listens and updates UI accordingly
```

---

## 9. Middleware Stack

### Execution Order

```
Request → CORS → Helmet → Morgan → RateLimit → Auth → Role → Validate → Controller → Error Handler
```

### Rate Limiting

| Endpoint Group | Limit | Window |
|---------------|-------|--------|
| Auth (register/login) | 10 req | 15 min |
| General API | 100 req | 1 min |
| Location updates | 60 req | 1 min (every 1 sec max) |
| SOS trigger | 5 req | 1 min |
| Admin | 200 req | 1 min |

---

## 10. Logging Strategy

### Logger Setup (Winston)

```javascript
// utils/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'plusone-api' },
  transports: [
    // Console (always — Cloud Functions captures this)
    new winston.transports.Console(),
    
    // File transport (for local development)
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880,      // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 10
    })
  ]
});
```

### What Gets Logged

| Event | Level | Data |
|-------|-------|------|
| API request received | `info` | method, path, userId, IP, requestId |
| API response sent | `info` | statusCode, responseTime, requestId |
| Auth token verification | `debug` | firebaseUid, success/failure |
| Booking created | `info` | bookingId, userId, pricingModel, amount |
| Payment processed | `info` | transactionId, amount, status |
| SOS triggered | `warn` | alertId, bookingId, location, triggeredBy |
| Host matched/rejected | `info` | bookingId, hostId, matchScore |
| Session started/ended | `info` | bookingId, metrics |
| Error occurred | `error` | error message, stack trace, request context |
| DynamoDB query | `debug` | table, operation, consumed capacity |
| External API call | `debug` | service, endpoint, responseTime |

### Cloud Logging (Production)

In Firebase Cloud Functions, `console.log/warn/error` automatically goes to **Google Cloud Logging**. Winston's console transport captures this. Cloud Logging provides:
- Structured log search and filtering
- Log-based metrics and alerts
- 30-day retention (free)
- Export to BigQuery for analysis (optional)

---

## 11. Backup & Recovery

### Strategy 1: DynamoDB Point-in-Time Recovery (PITR)

- **Enable PITR** on all 20 tables
- Continuous backups with 35-day retention
- Restore to any second within the retention window
- **Cost:** $0.20/GB-month (based on table size)
- **Estimated MVP cost:** ~$0.50/month (2.5GB across all tables)

### Strategy 2: Monthly Export to S3

Automated monthly backup using a scheduled Cloud Function:

```javascript
// cron/backupTrigger.cron.js
// Runs on the 1st of every month at 2:00 AM IST

const { DynamoDBClient, ExportTableToPointInTimeCommand } = require('@aws-sdk/client-dynamodb');

async function monthlyBackup() {
  const tables = [
    'PlusOne_Users', 'PlusOne_Bookings', 'PlusOne_Transactions',
    'PlusOne_Ratings', 'PlusOne_HostProfiles', /* ... all tables */
  ];
  
  for (const tableName of tables) {
    await dynamoClient.send(new ExportTableToPointInTimeCommand({
      TableArn: `arn:aws:dynamodb:ap-south-1:ACCOUNT:table/${tableName}`,
      S3Bucket: 'plusone-backups',
      S3Prefix: `monthly/${new Date().toISOString().slice(0,7)}/${tableName}`,
      ExportFormat: 'DYNAMODB_JSON'
    }));
  }
  
  logger.info('Monthly backup initiated for all tables');
}
```

### Strategy 3: S3 Lifecycle Rules

```
Backup files in S3:
  0-30 days:   S3 Standard
  30-90 days:  S3 Standard-IA (Infrequent Access) — 50% cheaper
  90-365 days: S3 Glacier — 90% cheaper
  365+ days:   Delete
```

---

## 12. Error Handling

### Custom Error Classes

```javascript
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, `${resource.toUpperCase()}_NOT_FOUND`);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor() {
    super('Insufficient permissions', 403, 'FORBIDDEN');
  }
}

class InsufficientBalanceError extends AppError {
  constructor(type) {
    super(`Insufficient ${type} balance`, 400, 'INSUFFICIENT_BALANCE');
  }
}
```

### Error Codes Catalog

| Code | HTTP Status | Meaning |
|------|------------|---------|
| `AUTH_TOKEN_INVALID` | 401 | Firebase token invalid/expired |
| `AUTH_TOKEN_MISSING` | 401 | No Authorization header |
| `FORBIDDEN` | 403 | Insufficient role/permissions |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `BOOKING_NOT_FOUND` | 404 | Booking doesn't exist |
| `VALIDATION_ERROR` | 400 | Request body validation failed |
| `INSUFFICIENT_BALANCE` | 400 | Not enough hours/km units |
| `NO_ACTIVE_SUBSCRIPTION` | 400 | User has no active subscription |
| `OUTSIDE_SERVICE_AREA` | 400 | Pickup location not in any service area |
| `NO_HOSTS_AVAILABLE` | 404 | No matching hosts found |
| `BOOKING_ALREADY_CANCELLED` | 409 | Can't cancel already-cancelled booking |
| `DUPLICATE_RATING` | 409 | Already rated this booking |
| `PAYMENT_VERIFICATION_FAILED` | 400 | Razorpay signature invalid |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 13. Deployment & Infrastructure

### Firebase Cloud Functions Deployment

```bash
# Deploy all functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:api

# Set environment variables
firebase functions:config:set \
  aws.access_key="..." \
  aws.secret_key="..." \
  aws.region="ap-south-1" \
  razorpay.key_id="..." \
  razorpay.key_secret="..." \
  cloudinary.cloud_name="..." \
  cloudinary.api_key="..." \
  cloudinary.api_secret="..." \
  ors.api_key="..."
```

### Cloud Function Configuration

```javascript
// index.js
const { onRequest } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const app = require('./app');

// Main API — Express app as Cloud Function
exports.api = onRequest({
  region: 'asia-south1',        // Mumbai (close to users)
  memory: '512MiB',
  timeoutSeconds: 60,
  minInstances: 1,              // Keep 1 instance warm (avoid cold starts for critical paths)
  maxInstances: 100,
  cors: true
}, app);

// Scheduled Functions
exports.checkSubscriptionExpiry = onSchedule({
  schedule: 'every day 00:00',
  region: 'asia-south1',
  timeZone: 'Asia/Kolkata'
}, require('./cron/subscriptionExpiry.cron'));

exports.monthlyBackup = onSchedule({
  schedule: '0 2 1 * *',        // 2:00 AM on 1st of each month
  region: 'asia-south1',
  timeZone: 'Asia/Kolkata'
}, require('./cron/backupTrigger.cron'));

exports.sessionTimeoutCheck = onSchedule({
  schedule: 'every 5 minutes',
  region: 'asia-south1'
}, require('./cron/sessionTimeout.cron'));

exports.weeklyTrustScoreRecalc = onSchedule({
  schedule: 'every sunday 03:00',
  region: 'asia-south1',
  timeZone: 'Asia/Kolkata'
}, require('./cron/trustScoreRecalc.cron'));
```

### Docker (Future)

```dockerfile
# Dockerfile for potential migration to Cloud Run or self-hosted
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
EXPOSE 8080
CMD ["node", "src/index.js"]
```

---

## 14. Visualization Prompts

Use these prompts with an image generation tool to create architecture diagrams and visualizations.

### Prompt 1: Backend System Architecture

```
Create a clean, professional system architecture diagram for "PlusOne" backend platform.
Show these components as rounded rectangles with icons:
- Center: "Firebase Cloud Functions (Express.js API)" as the main backend server
- Left side: "AWS DynamoDB" database with 20 tables icon
- Right side: "Firebase Realtime Database" for live tracking
- Top: "Firebase Auth" for authentication
- Bottom-left: "Razorpay" for payments
- Bottom-right: "Cloudinary" for media storage
- Bottom-center: "OpenRouteService" for road distance
- Far right: "Firebase Cloud Messaging" for push notifications

Use arrows to show data flow between components.
Color scheme: dark navy background, white cards, purple accent lines, green for data flow arrows.
Include a legend showing: REST API (solid lines), Real-time WebSocket (dashed lines), Webhooks (dotted lines).
Style: modern, minimalist, enterprise-grade technical diagram.
No device frames. Clean white or dark background.
```

### Prompt 2: DynamoDB Schema Relationships

```
Create a database entity-relationship diagram showing 20 DynamoDB tables for a companion booking platform.
Core entities with relationships:
- Users (center) connects to: HostProfiles, Bookings, Subscriptions, UnitBalances, Ratings, Notifications
- Bookings (large box) connects to: Sessions, Transactions, ChatMessages, SOSAlerts, Ratings
- HostProfiles connects to: HostCategories, HostAvailability
- Categories connects to: Packages, HostCategories

Use color coding:
- Blue: User-related tables
- Green: Booking/Session tables
- Orange: Financial tables (Transactions, Subscriptions, UnitBalances)
- Red: Safety tables (SOSAlerts)
- Purple: Content tables (Categories, Packages, Promotions)
- Gray: System tables (Config, AuditLogs)

Show PK and SK for each table. Modern dark theme diagram.
Style: clean ER diagram, professional, with clear relationship lines.
```

### Prompt 3: API Request Flow

```
Create a sequence diagram showing the complete booking flow for "PlusOne" platform.
Actors: User, Frontend, Backend API, DynamoDB, Razorpay, Firebase RTDB, Host

Flow:
1. User selects package → Frontend calls POST /bookings
2. Backend calculates price → Creates Razorpay order → Returns order ID
3. Frontend shows Razorpay checkout → User pays
4. Razorpay sends webhook → Backend verifies payment
5. Backend runs matching engine → Queries DynamoDB for nearby hosts
6. Backend assigns best host → Writes to Firebase RTDB
7. Host receives real-time notification → Accepts booking
8. Backend updates booking status → Notifies user via RTDB
9. Session starts → Location tracking begins via Firebase RTDB
10. Session ends → Overage calculated → Final bill generated

Style: professional UML sequence diagram, dark theme, color-coded actors.
Use purple for user actions, green for backend processing, orange for payments, blue for real-time.
```

### Prompt 4: Complete System Connected View

```
Create a comprehensive system overview diagram for "PlusOne" companion booking platform showing all layers:

TOP LAYER - Clients:
- User Web App (React/Next.js)
- Host Web App (React/Next.js)  
- Admin Dashboard (React/Next.js)
All connected via REST API + Firebase SDK

MIDDLE LAYER - Backend:
- Firebase Cloud Functions (Express.js)
- Contains: Auth Middleware, Controllers (15 modules), Services (Billing, Matching, Geo, Safety)
- Cron Jobs (Subscription expiry, Backup, Score recalc)

BOTTOM LAYER - Data & Services:
- AWS DynamoDB (20 tables, 36 GSIs)
- Firebase Realtime DB (Live tracking, Chat, SOS)
- Firebase Auth (Google, Email, Phone OTP)
- Cloudinary (Media storage)
- Razorpay (Payments)
- OpenRouteService (Road distance)
- Firebase Cloud Messaging (Push)

Show data flow arrows between all layers.
Color: Dark theme, glassmorphism cards, gradient purple-to-blue header.
Style: Premium, modern, startup pitch-deck quality infographic.
```

---

> **End of Backend Documentation**
> 
> **Next Steps:**
> 1. Review this document with the team
> 2. See `frontend_documentation.md` for user flows and frontend API integration
> 3. Once approved, begin implementation starting with: Config → Auth → Users → Hosts → Categories → Packages
