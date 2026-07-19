const Joi = require("joi");

const registerHostSchema = Joi.object({
  userId: Joi.string().required(),
  bio: Joi.string().min(10).max(1000).required(),
  categories: Joi.array().items(Joi.string()).min(1).required(),
  languages: Joi.array().items(Joi.string()).min(1).required(),
  experienceYears: Joi.number().min(0).max(50).default(1),
  schedule: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().min(0).max(6).required(),
      slots: Joi.array().items(
        Joi.object({
          start: Joi.string().required(),
          end: Joi.string().required(),
        })
      ),
    })
  ).optional().allow(null),
  kycDocuments: Joi.object({
    aadhaarUrl: Joi.string().uri().allow(null, ""),
    panUrl: Joi.string().uri().allow(null, ""),
    photoUrl: Joi.string().uri().allow(null, ""),
  }).optional().allow(null),
  // Bank details are optional on onboarding
  bankDetails: Joi.object({
    accountNumber: Joi.string().min(5).max(30).required(),
    ifsc: Joi.string().min(4).max(15).required(),
    accountHolderName: Joi.string().min(2).max(100).required(),
  }).optional().allow(null),
});

const updateBankDetailsSchema = Joi.object({
  accountNumber: Joi.string().min(5).max(30).required(),
  ifsc: Joi.string().min(4).max(15).required(),
  accountHolderName: Joi.string().min(2).max(100).required(),
});

const updateAvailabilitySchema = Joi.object({
  schedule: Joi.array().items(
    Joi.object({
      dayOfWeek: Joi.number().min(0).max(6).required(),
      slots: Joi.array().items(
        Joi.object({
          start: Joi.string().required(),
          end: Joi.string().required(),
        })
      ),
    })
  ).required(),
});

const kycUploadSchema = Joi.object({
  aadhaarUrl: Joi.string().uri().allow(null, ""),
  panUrl: Joi.string().uri().allow(null, ""),
  photoUrl: Joi.string().uri().allow(null, ""),
});

module.exports = {
  registerHostSchema,
  updateBankDetailsSchema,
  updateAvailabilitySchema,
  kycUploadSchema,
};
