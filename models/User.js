const db = require("../config/database");

class User {
  static async create(userData) {
    const { email, password, token } = userData;
    const [result] = await db.execute(
      "INSERT INTO users (email, password, token, created_at) VALUES (?, ?, ?, NOW())",
      [email, password, token]
    );
    return result.insertId;
  }

  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM users WHERE user_id = ?", [
      user_id,
    ]);
    return rows[0];
  }

  static async updateToken(user_id, token) {
    await db.execute(
      "UPDATE users SET token = ?, updated_at = NOW() WHERE user_id = ?",
      [token, user_id]
    );
  }

  static async updatePassword(user_id, hashedPassword) {
    await db.execute(
      "UPDATE users SET password = ?, updated_at = NOW() WHERE user_id = ?",
      [hashedPassword, user_id]
    );
  }

  static async deleteById(user_id) {
    await db.execute("DELETE FROM users WHERE user_id = ?", [user_id]);
  }

  static async findByGoogleId(googleId) {
    const [rows] = await db.execute("SELECT * FROM users WHERE google_id = ?", [
      googleId,
    ]);
    return rows[0];
  }

  static async createFromGoogle(googleData) {
    const { googleId, email, token } = googleData;
    const [result] = await db.execute(
      "INSERT INTO users (google_id, email, token, created_at) VALUES (?, ?, ?, NOW())",
      [googleId, email, token]
    );
    return result.insertId;
  }

  static async getAllUsers() {
    const [rows] = await db.execute(
      "SELECT user_id, email, created_at, updated_at FROM users ORDER BY created_at DESC"
    );
    return rows;
  }

  static async updateLastLogin(user_id) {
    await db.execute(
      "UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE user_id = ?",
      [user_id]
    );
  }
}

module.exports = User;
