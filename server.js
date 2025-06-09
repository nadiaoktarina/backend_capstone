// server.js - UPDATED FOR DEPLOYMENT
const Hapi = require("@hapi/hapi");
const Bell = require("@hapi/bell");
const Cookie = require("@hapi/cookie");
require("dotenv").config();

// Import middleware & routes
const authScheme = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

const googleOAuthConfig = require("./config/google-oauth"); // Optional, if you handle config separately

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: "0.0.0.0", // ✅ WAJIB untuk deployment (Render, Railway, dll)
    routes: {
      cors: {
        origin: ["http://localhost:3000"], // Ganti jika frontend sudah live
        credentials: true,
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  // Register plugins
  await server.register([Bell, Cookie]);

  // Configure Google OAuth
  server.auth.strategy("google", "bell", {
    provider: "google",
    password: process.env.BELL_PASSWORD || "a_very_long_random_string_for_encryption_in_production",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: process.env.NODE_ENV === "production", // true jika HTTPS
    scope: ["profile", "email"],
    config: {
      authParams: {
        prompt: "select_account", // Paksa pilih akun Google setiap kali
      },
    },
  });

  // Register custom auth scheme & strategy (JWT)
  server.auth.scheme("custom", authScheme);
  server.auth.strategy("default", "custom");
  server.auth.default("default");

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(profileRoutes);

  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
};

// Global error handling
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err);
  process.exit(1);
});

init();
