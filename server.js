const Hapi = require("@hapi/hapi");
const Bell = require("@hapi/bell");
const Cookie = require("@hapi/cookie");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 3000,
    host: "localhost",
    routes: {
      cors: {
        origin: ["*"],
        headers: ["Accept", "Authorization", "Content-Type", "If-None-Match"],
        additionalHeaders: ["cache-control", "x-requested-with"],
      },
    },
  });

  // Register plugins
  await server.register([Bell, Cookie]);

  // Configure Bell for Google OAuth
  server.auth.strategy("google", "bell", {
    provider: "google",
    password: "cookie_encryption_password_secure",
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: false,
    scope: ["profile", "email"],
    config: {
      authParams: {
        prompt: "select_account",
      },
    },
  });

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
