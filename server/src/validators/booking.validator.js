const Joi = require("joi");

const createBookingSchema = Joi.object({
  packageId: Joi.string().allow(null, ""),
  categoryId: Joi.string().required(),
  pricingModel: Joi.string().valid("subscription", "unit", "package").required(),
  scheduledDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(), // YYYY-MM-DD
  scheduledTime: Joi.string().pattern(/^\d{2}:\d{2}$/).required(), // HH:mm
  pickupLocation: Joi.object({
    lat: Joi.number().required(),
    lng: Joi.number().required(),
    address: Joi.string().required(),
  }).required(),
  specialInstructions: Joi.string().allow("", null),
  promoCode: Joi.string().allow("", null),
});

const updateBookingStatusSchema = Joi.object({
  status: Joi.string().valid("host_assigned", "host_confirmed", "active", "completed", "cancelled", "rejected").required(),
  reason: Joi.string().when("status", { is: Joi.valid("cancelled", "rejected"), then: Joi.required(), otherwise: Joi.optional() }),
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema,
};
