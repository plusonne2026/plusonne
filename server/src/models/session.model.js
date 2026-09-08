/**
 * Session Model — PlusOne_Sessions (Table 10)
 *
 * Active session tracking data (detailed metrics during a live session).
 * Each session is linked 1:1 to a Booking via bookingId (PK).
 *
 * | Attribute         | Type         | Description                                      |
 * |-------------------|-------------|--------------------------------------------------|
 * | bookingId (PK)    | String      | Links to Bookings table                           |
 * | status            | String      | awaiting_host / host_en_route / in_progress / completed |
 * | startTime         | String(ISO) | Actual session start                              |
 * | endTime           | String(ISO) | Actual session end                                |
 * | startLocation     | Map         | { lat, lng, address }                             |
 * | endLocation       | Map         | { lat, lng, address }                             |
 * | totalDistanceKm   | Number      | Actual distance covered                           |
 * | totalTimeMinutes  | Number      | Actual time elapsed                               |
 * | includedHours     | Number      | Hours included in plan/package                    |
 * | includedKm        | Number      | KM included in plan/package                       |
 * | overageHours      | Number      | Extra hours beyond included                       |
 * | overageKm         | Number      | Extra KM beyond included                          |
 * | overageCharges    | Number      | INR charged for overage                           |
 * | finalBill         | Map         | { base, overageTime, overageDistance, discount, total, currency } |
 * | routePoints       | List        | [{ lat, lng, timestamp }] — sampled every 30 sec  |
 * | createdAt         | String(ISO) |                                                   |
 * | updatedAt         | String(ISO) |                                                   |
 *
 * GSI: ActiveSessionsIndex — PK: status, SK: startTime
 */

const SESSION_STATUSES = [
  "awaiting_host",
  "host_en_route",
  "in_progress",
  "completed",
];

/**
 * Creates a normalized PlusOne_Sessions table document
 * matching Table 10 specs in backend_documentation.md
 *
 * @param {Object} payload
 * @returns {Object} DynamoDB-ready session item
 */
function formatSessionModel(payload) {
  const now = new Date().toISOString();

  return {
    // ── Primary Key ───────────────────────────────
    bookingId: payload.bookingId,

    // ── Status ───────────────────────────────────
    status: payload.status || "awaiting_host",

    // ── Time ─────────────────────────────────────
    startTime: payload.startTime || null,
    endTime: payload.endTime || null,

    // ── Locations ────────────────────────────────
    startLocation: payload.startLocation || { lat: null, lng: null, address: "" },
    endLocation: payload.endLocation || { lat: null, lng: null, address: "" },

    // ── Metrics ──────────────────────────────────
    totalDistanceKm: payload.totalDistanceKm || 0,
    totalTimeMinutes: payload.totalTimeMinutes || 0,

    // ── Included Limits ──────────────────────────
    includedHours: payload.includedHours || 0,
    includedKm: payload.includedKm || 0,

    // ── Overage ──────────────────────────────────
    overageHours: payload.overageHours || 0,
    overageKm: payload.overageKm || 0,
    overageCharges: payload.overageCharges || 0,

    // ── Final Bill ───────────────────────────────
    finalBill: payload.finalBill || {
      base: 0,
      overageTime: 0,
      overageDistance: 0,
      discount: 0,
      total: 0,
      currency: "INR",
    },

    // ── Route Tracking ───────────────────────────
    routePoints: payload.routePoints || [],

    // ── Timestamps ───────────────────────────────
    createdAt: payload.createdAt || now,
    updatedAt: now,
  };
}

/**
 * Builds the response object for POST /sessions/:bookingId/start
 * matching Section 6.7 documentation.
 */
function formatSessionStartResponse(session) {
  return {
    bookingId: session.bookingId,
    sessionStatus: session.status,
    startTime: session.startTime,
    startLocation: session.startLocation,
    includedHours: session.includedHours,
    includedKm: session.includedKm,
    trackingEnabled: true,
  };
}

/**
 * Builds the response object for POST /sessions/:bookingId/end
 * matching Section 6.7 documentation.
 */
function formatSessionEndResponse(session) {
  return {
    bookingId: session.bookingId,
    sessionStatus: session.status,
    startTime: session.startTime,
    endTime: session.endTime,
    totalTimeMinutes: session.totalTimeMinutes,
    totalDistanceKm: session.totalDistanceKm,
    includedHours: session.includedHours,
    includedKm: session.includedKm,
    overageHours: session.overageHours,
    overageKm: session.overageKm,
    finalBill: session.finalBill,
  };
}

/**
 * Haversine formula — calculates distance in km between two lat/lng points.
 * @param {number} lat1 
 * @param {number} lng1 
 * @param {number} lat2 
 * @param {number} lng2 
 * @returns {number} distance in km
 */
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth radius in km
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate total distance from an array of route points using Haversine.
 * @param {Array<{lat: number, lng: number}>} routePoints 
 * @returns {number} total distance in km (rounded to 2 decimals)
 */
function calculateTotalDistance(routePoints) {
  if (!routePoints || routePoints.length < 2) return 0;

  let total = 0;
  for (let i = 1; i < routePoints.length; i++) {
    const prev = routePoints[i - 1];
    const curr = routePoints[i];
    if (prev.lat && prev.lng && curr.lat && curr.lng) {
      total += haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng);
    }
  }
  return Math.round(total * 100) / 100;
}

module.exports = {
  formatSessionModel,
  formatSessionStartResponse,
  formatSessionEndResponse,
  haversineDistance,
  calculateTotalDistance,
  SESSION_STATUSES,
};
