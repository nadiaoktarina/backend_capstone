const Path = require('path');
const Hapi = require('@hapi/hapi');
const Bell = require('@hapi/bell');
const Cookie = require('@hapi/cookie');
const Inert = require('@hapi/inert');
require('dotenv').config();

// Import middleware & routes
const authScheme = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const profileRoutes = require('./routes/profile');
const foodRoutes = require('./routes/food'); 

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: "0.0.0.0",
    routes: {
      cors: {
        origin: ['*'],
        credentials: true,
        headers: ['Accept', 'Authorization', 'Content-Type', 'If-None-Match'],
        additionalHeaders: ['cache-control', 'x-requested-with'],
      },
      files: {
        relativeTo: Path.join(__dirname, 'public/foodphoto'),
      },
    },
  });

  // Register plugins
  await server.register([Bell, Cookie, Inert]);

  // Google OAuth via Bell
  server.auth.strategy('google', 'bell', {
    provider: 'google',
    password: process.env.BELL_PASSWORD || 'a_very_long_random_string_for_encryption_in_production',
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    isSecure: process.env.NODE_ENV === 'production', // true jika HTTPS
    scope: ['profile', 'email'],
    config: {
      authParams: {
        prompt: 'select_account',
      },
    },
  });

  // JWT Auth
  server.auth.scheme('custom', authScheme);
  server.auth.strategy('default', 'custom');
  server.auth.default('default');

  server.route([
    {
      method: 'GET',
      path: '/health',
      handler: async (request, h) => {
        try {
          const pool = require('./config/database');
          await pool.execute('SELECT 1');
          return { status: 'ok', database: 'connected' };
        } catch (error) {
          return h.response({ status: 'error', database: error.message }).code(500);
        }
      },
      options: { auth: false }
    }
  ]);

  // Register routes
  server.route(authRoutes);
  server.route(userRoutes);
  server.route(profileRoutes);
  server.route(foodRoutes);

  // Start server
  await server.start();
  console.log(`✅ Server running on ${server.info.uri}`);
};

// Error handler
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled error:', err);
  process.exit(1);
});

init();