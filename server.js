const Hapi = require("@hapi/hapi");
const Bell = require("@hapi/bell");
const Cookie = require("@hapi/cookie");
require("dotenv").config();

// Import middleware & routes
const authScheme = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["http://localhost:3000"],
        credentials: true,
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  // Register plugins
  await server.register([Bell, Cookie]);

  // Configure Google OAuth (optional, kamu bisa hapus kalau tidak pakai Google Login)
  server.auth.strategy("google", "bell", {
    provider: "google",
    password: "cookie_encryption_password_secure", // ganti jadi env var di produksi
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: false, // false untuk lokal, true di production (pakai HTTPS)
    scope: ["profile", "email"],
    config: {
      authParams: {
        prompt: "select_account",
      },
    },
  });

  // ✅ Register custom auth scheme & strategy (JWT)
  server.auth.scheme("custom", authScheme);
  server.auth.strategy("default", "custom");
  server.auth.default("default"); // Semua route butuh JWT, kecuali didefinisikan `auth: false`

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(profileRoutes);

  // Start server
  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
};

// Error handling
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled error:", err);
  process.exit(1);
});

init();
