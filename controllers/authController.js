const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");
const { successResponse, errorResponse } = require("../utils/response");

class AuthController {
  static async register(request, h) {
    try {
      console.log("DEBUG: Masuk register");

      const { email, password } = request.payload;

      if (!email || !password) {
        return h
          .response(errorResponse("Email dan password wajib diisi", 400))
          .code(400);
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return h
          .response(errorResponse("Email sudah terdaftar", 400))
          .code(400);
      }

      const hashedPassword = await hashPassword(password);
      const token = generateToken({ email });
      const userId = await User.create({
        email,
        password: hashedPassword,
        token,
      });

      return h
        .response(
          successResponse({ userId, email, token }, "Registrasi berhasil")
        )
        .code(201);
    } catch (error) {
      console.error("Register Error:", error); // Log detail error
      return h.response(errorResponse("Terjadi kesalahan di server")).code(500);
    }
  }

  static async login(request, h) {
    try {
      console.log("DEBUG: Masuk login");

      const { email, password } = request.payload;

      if (!email || !password) {
        return h
          .response(errorResponse("Email dan password wajib diisi", 400))
          .code(400);
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return h
          .response(errorResponse("Email atau password salah", 401))
          .code(401);
      }

      const isValidPassword = await comparePassword(password, user.password);
      if (!isValidPassword) {
        return h
          .response(errorResponse("Email atau password salah", 401))
          .code(401);
      }

      const token = generateToken({ userId: user.user_id, email: user.email });
      await User.updateToken(user.user_id, token);

      return h
        .response(
          successResponse(
            { userId: user.user_id, email: user.email, token },
            "Login berhasil"
          )
        )
        .code(200);
    } catch (error) {
      console.error("Login Error:", error); // Penting untuk tahu error detail
      return h.response(errorResponse("Terjadi kesalahan di server")).code(500);
    }
  }

  static async googleAuth(request, h) {
    try {
      if (!request.auth.isAuthenticated) {
        return h.response("Google authentication gagal").code(401);
      }

      const profile = request.auth.credentials.profile;
      const googleId = profile.id;
      const email = profile.email;

      if (!googleId || !email) {
        return h.response("Profil Google tidak lengkap").code(400);
      }

      let user = await User.findByGoogleId(googleId);
      let isNewUser = false;
      let userId;

      if (!user) {
        const existingUser = await User.findByEmail(email);

        if (existingUser) {
          await User.updateGoogleId(existingUser.user_id, googleId);
          user = existingUser;
        } else {
          userId = await User.createFromGoogle({ googleId, email });
          isNewUser = true;

          // Buat token setelah user dibuat
          const token = generateToken({ userId, email });
          await User.updateToken(userId, token);

          return h.redirect(
            `http://localhost:3000/google-success?token=${token}&email=${encodeURIComponent(
              email
            )}&userId=${userId}&isNewUser=true`
          );
        }
      }

      // user sudah ada (baru atau lama), generate token baru
      const token = generateToken({ userId: user.user_id, email });
      await User.updateToken(user.user_id, token);

      return h.redirect(
        `http://localhost:3000/google-success?token=${token}&email=${encodeURIComponent(
          email
        )}&userId=${user.user_id}&isNewUser=${isNewUser}`
      );
    } catch (error) {
      console.error("Google Auth Error:", error);
      return h.response("Terjadi kesalahan di server").code(500);
    }
  }
}

module.exports = AuthController;
