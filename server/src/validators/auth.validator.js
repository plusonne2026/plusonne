const Joi = require("joi");
const { ROLES, AUTH_PROVIDERS } = require("../config/constants");

const registerSchema = Joi.object({
  firebaseUid: Joi.string().required(),
  email: Joi.string().email().allow(null, ""),
  phone: Joi.string().allow(null, ""),
  displayName: Joi.string().min(2).max(100).required(),
  avatarUrl: Joi.string().uri().allow(null, ""),
  role: Joi.string()
    .valid(ROLES.USER, ROLES.HOST, ROLES.ADMIN)
    .default(ROLES.USER),
  authProvider: Joi.string()
    .valid(
      AUTH_PROVIDERS.GOOGLE,
      AUTH_PROVIDERS.APPLE,
      AUTH_PROVIDERS.EMAIL,
      AUTH_PROVIDERS.PHONE
    )
    .required(),
  city: Joi.string().allow(null, "").default(""),
});

const verifyTokenSchema = Joi.object({
  firebaseUid: Joi.string().required(),
});

module.exports = {
  registerSchema,
  verifyTokenSchema,
};
