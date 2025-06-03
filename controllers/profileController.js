const Profile = require("../models/Profile");
const { successResponse, errorResponse } = require("../utils/response");
const axios = require("axios");

class ProfileController {
  // static async createProfile(request, h) {
  //   try {
  //     const { nama, tinggi, berat, usia, target } = request.payload;
  //     const userId = request.auth.userId;

  static async createProfile(request, h) {
    try {
      const { nama, tinggi, berat, usia, target, user_id } = request.payload;
      const userId = request.auth?.userId || user_id;

      if (!userId) {
        return h
          .response(errorResponse("User ID tidak tersedia", 400))
          .code(400);
      }
      // Calculate IBM (BMI)
      const tinggiMeter = tinggi / 100;
      const ibm = (berat / (tinggiMeter * tinggiMeter)).toFixed(1);

      // Check if profile already exists
      const existingProfile = await Profile.findByUserId(userId);
      if (existingProfile) {
        return h
          .response(
            errorResponse("Profile sudah ada, gunakan endpoint update", 400)
          )
          .code(400);
      }

      const profileId = await Profile.create({
        user_id: userId,
        nama,
        tinggi,
        berat,
        usia,
        ibm: parseFloat(ibm),
        target,
      });

      return h
        .response(
          successResponse(
            {
              profileId,
              nama,
              tinggi,
              berat,
              usia,
              ibm: parseFloat(ibm),
              target,
            },
            "Profile berhasil dibuat"
          )
        )
        .code(201);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }

  static async getProfile(request, h) {
    try {
      const userId = request.auth.userId;
      const profile = await Profile.findByUserId(userId);

      if (!profile) {
        return h
          .response(errorResponse("Profile tidak ditemukan", 404))
          .code(404);
      }

      return h
        .response(successResponse(profile, "Profile ditemukan"))
        .code(200);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }

  static async updateProfile(request, h) {
    try {
      const { nama, tinggi, berat, usia, target } = request.payload;
      const userId = request.auth.userId;

      const profile = await Profile.findByUserId(userId);
      if (!profile) {
        return h
          .response(errorResponse("Profile tidak ditemukan", 404))
          .code(404);
      }

      // Calculate new IBM
      const tinggiMeter = tinggi / 100;
      const ibm = (berat / (tinggiMeter * tinggiMeter)).toFixed(1);

      await Profile.update(profile.id, {
        nama,
        tinggi,
        berat,
        usia,
        ibm: parseFloat(ibm),
        target,
      });

      return h
        .response(
          successResponse(
            {
              nama,
              tinggi,
              berat,
              usia,
              ibm: parseFloat(ibm),
              target,
            },
            "Profile berhasil diupdate"
          )
        )
        .code(200);
    } catch (error) {
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }

  static async getRecommendation(request, h) {
    try {
      const userId = request.auth.userId;
      const profile = await Profile.findByUserId(userId);

      if (!profile) {
        return h
          .response(
            errorResponse(
              "Profile tidak ditemukan, silakan lengkapi data diri terlebih dahulu",
              404
            )
          )
          .code(404);
      }

      // Call ML Server
      const mlResponse = await axios.post(
        `${process.env.ML_SERVER_URL}/predict`,
        {
          tinggi: profile.tinggi,
          berat: profile.berat,
          usia: profile.usia,
          ibm: profile.ibm,
          target: profile.target,
        }
      );

      return h
        .response(
          successResponse(
            {
              profile: profile,
              recommendation: mlResponse.data,
            },
            "Rekomendasi berhasil didapatkan"
          )
        )
        .code(200);
    } catch (error) {
      if (error.code === "ECONNREFUSED") {
        return h.response(errorResponse("ML Server tidak tersedia")).code(503);
      }
      return h.response(errorResponse("Internal server error")).code(500);
    }
  }
}

module.exports = ProfileController;
