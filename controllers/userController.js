const User = require("../models/User");
const Profile = require("../models/Profile");
const { hashPassword, comparePassword } = require("../utils/hash");
const { successResponse, errorResponse } = require("../utils/response");

class UserController {
  static async getCurrentUser(request, h) {
    try {
      const userId = request.auth.userId;
      const user = await User.findById(userId);

      if (!user) {
        return h.response(errorResponse("User tidak ditemukan", 404)).code(404);
      }

      // Don't return password and sensitive data
      const userData = {
        id: user.user_id,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      };

      return h
        .response(successResponse(userData, "Data user berhasil diambil"))
        .code(200);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }

  static async changePassword(request, h) {
    try {
      const { oldPassword, newPassword } = request.payload;
      const userId = request.auth.userId;

      const user = await User.findById(userId);
      if (!user || !user.password) {
        return h
          .response(
            errorResponse(
              "User tidak ditemukan atau menggunakan Google login",
              400
            )
          )
          .code(400);
      }

      // Verify old password
      const isValidPassword = await comparePassword(oldPassword, user.password);
      if (!isValidPassword) {
        return h
          .response(errorResponse("Password lama tidak sesuai", 400))
          .code(400);
      }

      // Hash new password
      const hashedNewPassword = await hashPassword(newPassword);

      // Update password
      await User.updatePassword(userId, hashedNewPassword);

      return h
        .response(successResponse(null, "Password berhasil diubah"))
        .code(200);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }

  static async deleteAccount(request, h) {
    try {
      const userId = request.auth.userId;

      // Delete user (profile will be deleted automatically due to CASCADE)
      await User.deleteById(userId);

      return h
        .response(successResponse(null, "Akun berhasil dihapus"))
        .code(200);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }
}

module.exports = UserController;
