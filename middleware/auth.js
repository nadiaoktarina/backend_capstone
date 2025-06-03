const { verifyToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/response");

const authMiddleware = async (request, h) => {
  try {
    const authorization = request.headers.authorization;

    if (!authorization) {
      return h.response(errorResponse("Token tidak ditemukan", 401)).code(401);
    }

    const token = authorization.replace("Bearer ", "");
    const decoded = verifyToken(token);

    request.auth = {
      userId: decoded.userId,
      email: decoded.email,
    };

    return h.continue;
  } catch (error) {
    return h.response(errorResponse("Token tidak valid", 401)).code(401);
  }
};

module.exports = authMiddleware;
