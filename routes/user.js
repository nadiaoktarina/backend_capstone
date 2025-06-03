const Joi = require("@hapi/joi");
const UserController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

module.exports = [
  {
    method: "GET",
    path: "/user/me",
    handler: UserController.getCurrentUser,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
  {
    method: "PUT",
    path: "/user/password",
    handler: UserController.changePassword,
    options: {
      pre: [{ method: authMiddleware }],
      validate: {
        payload: Joi.object({
          oldPassword: Joi.string().required(),
          newPassword: Joi.string().min(6).required(),
        }),
      },
    },
  },
  {
    method: "DELETE",
    path: "/user/account",
    handler: UserController.deleteAccount,
    options: {
      pre: [{ method: authMiddleware }],
    },
  },
];
