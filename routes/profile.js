const Joi = require("@hapi/joi");
const ProfileController = require("../controllers/profileController");
const authMiddleware = require("../middleware/auth");

module.exports = [
  {
    method: "POST",
    path: "/profile",
    handler: ProfileController.createProfile,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        // payload: Joi.object({
        //   nama: Joi.string().required(),
        //   tinggi: Joi.number().min(100).max(250).required(),
        //   berat: Joi.number().min(30).max(300).required(),
        //   usia: Joi.number().min(10).max(100).required(),
        //   target: Joi.string()
        //     .valid("diet", "bulking", "maintenance")
        //     .required(),
        payload: Joi.object({
          nama: Joi.string().required(),
          tinggi: Joi.number().min(100).max(250).required(),
          berat: Joi.number().min(30).max(300).required(),
          usia: Joi.number().min(10).max(100).required(),
          target: Joi.string()
            .valid("diet", "bulking", "maintenance")
            .required(),
          user_id: Joi.number().optional(), // ini tambahan
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/profile",
    handler: ProfileController.getProfile,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "PUT",
    path: "/profile",
    handler: ProfileController.updateProfile,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        payload: Joi.object({
          nama: Joi.string().required(),
          tinggi: Joi.number().min(100).max(250).required(),
          berat: Joi.number().min(30).max(300).required(),
          usia: Joi.number().min(10).max(100).required(),
          target: Joi.string()
            .valid("diet", "bulking", "maintenance")
            .required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/profile/recommendation",
    handler: ProfileController.getRecommendation,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];
