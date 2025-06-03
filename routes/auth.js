const Joi = require("@hapi/joi");
const AuthController = require("../controllers/authController");

module.exports = [
  {
    method: "POST",
    path: "/auth/register",
    handler: AuthController.register,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().min(6).required(),
        }),
      },
    },
  },
  {
    method: "POST",
    path: "/auth/login",
    handler: AuthController.login,
    options: {
      validate: {
        payload: Joi.object({
          email: Joi.string().email().required(),
          password: Joi.string().required(),
        }),
      },
    },
  },
  {
    method: "GET",
    path: "/auth/google",
    handler: AuthController.googleAuth,
    options: {
      auth: "google",
    },
  },
];
