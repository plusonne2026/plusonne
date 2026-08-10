const Joi = require("joi");

const createPackageSchema = Joi.object({
  packageId: Joi.string().required(),
  categoryId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  durationHours: Joi.number().required(),
  distanceKm: Joi.number().required(),
  basePrice: Joi.number().required(),
  images: Joi.array().items(Joi.string().uri()).default([]),
  inclusions: Joi.array().items(Joi.string()).default([]),
  extraCharges: Joi.object({
    perExtraHour: Joi.number().required(),
    perExtraKm: Joi.number().required(),
  }).required(),
  cancellationPolicy: Joi.object({
    freeCancelHoursBefore: Joi.number().required(),
    cancellationFee: Joi.number().required(),
  }).required(),
  city: Joi.string().required(),
  isActive: Joi.boolean().default(true),
  popularity: Joi.number().default(0),
});

const updatePackageSchema = Joi.object({
  categoryId: Joi.string(),
  name: Joi.string(),
  description: Joi.string(),
  durationHours: Joi.number(),
  distanceKm: Joi.number(),
  basePrice: Joi.number(),
  images: Joi.array().items(Joi.string().uri()),
  inclusions: Joi.array().items(Joi.string()),
  extraCharges: Joi.object({
    perExtraHour: Joi.number().required(),
    perExtraKm: Joi.number().required(),
  }),
  cancellationPolicy: Joi.object({
    freeCancelHoursBefore: Joi.number().required(),
    cancellationFee: Joi.number().required(),
  }),
  city: Joi.string(),
  isActive: Joi.boolean(),
  popularity: Joi.number(),
}).min(1);

module.exports = {
  createPackageSchema,
  updatePackageSchema,
};
