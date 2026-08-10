const Joi = require("joi");

const createCategorySchema = Joi.object({
  categoryId: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  iconUrl: Joi.string().uri().allow("", null),
  isActive: Joi.boolean().default(true),
  displayOrder: Joi.number().default(0),
});

const updateCategorySchema = Joi.object({
  name: Joi.string(),
  description: Joi.string(),
  iconUrl: Joi.string().uri().allow("", null),
  isActive: Joi.boolean(),
  displayOrder: Joi.number(),
}).min(1);

module.exports = {
  createCategorySchema,
  updateCategorySchema,
};
