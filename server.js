// server.js - UPDATED GOOGLE OAUTH CONFIG
const Hapi = require("@hapi/hapi");
const Bell = require("@hapi/bell");
const Cookie = require("@hapi/cookie");
require("dotenv").config();

// Import middleware & routes
const authScheme = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

const googleOAuthConfig = require("./config/google-oauth"); // Import konfigurasi Google OAuth

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["http://localhost:3000"], // Pastikan ini cocok dengan frontend Anda
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
    password: process.env.BELL_PASSWORD || "a_very_long_random_string_for_encryption_in_production", // Gunakan env var yang aman
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: process.env.NODE_ENV === 'production', // true di production (pakai HTTPS), false untuk lokal
    scope: ["profile", "email"],
    config: {
      authParams: {
        prompt: "select_account", // Memaksa pengguna memilih akun setiap kali
      },
      // Hapi Bell akan menangani redirect_uri secara otomatis berdasarkan providerParams
      // yang kita definisikan di google-oauth.js
    },
  });

  // Register custom auth scheme & strategy (JWT)
  server.auth.scheme("custom", authScheme);
  server.auth.strategy("default", "custom");
  server.auth.default("default"); // Semua route butuh JWT, kecuali didefinisikan `auth: false`

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(profileRoutes);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

init();