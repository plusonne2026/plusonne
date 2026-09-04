const Joi = require("joi");
const { ROLES, AUTH_PROVIDERS } = require("../config/constants");

/**
 * Register Schema
 *
 * PRODUCTION (Firebase available):
 *   - idToken: Firebase ID Token (frontend se milta hai)
 *   - displayName, authProvider: extra info jo token mein nahi hoti
 *
 * BYPASS MODE (local dev, bina Firebase ke):
 *   - firebaseUid: direct de sakte hain
 *   - email, displayName, etc. manually dene padte hain
 */
const registerSchema = Joi.object({
  // Firebase ID Token — production mein required
  idToken: Joi.string().when("firebaseUid", {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required(),
  }),

  // Bypass mode ke liye (local dev only)
  firebaseUid: Joi.string().optional(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().allow(null, ""),

  // Ye fields hamesha required hain
  displayName: Joi.string().min(2).max(100).required(),
  authProvider: Joi.string()
    .valid(
      AUTH_PROVIDERS.GOOGLE,
      AUTH_PROVIDERS.APPLE,
      AUTH_PROVIDERS.EMAIL,
      AUTH_PROVIDERS.PHONE
    )
    .required(),

  // Optional fields
  avatarUrl: Joi.string().uri().allow(null, ""),
  role: Joi.string()
    .valid(ROLES.USER, ROLES.HOST)  // Admin role register se nahi milega
    .default(ROLES.USER),
  city: Joi.string().allow(null, "").default(""),
});

/**
 * Verify Token Schema — login ke baad session verify karne ke liye
 */
const verifyTokenSchema = Joi.object({
  // Firebase ID Token — production mein
  idToken: Joi.string().optional(),
  // Bypass mode ke liye
  firebaseUid: Joi.string().optional(),
}).or("idToken", "firebaseUid"); // Dono mein se ek zaroori hai

module.exports = {
  registerSchema,
  verifyTokenSchema,
};
