const db = require("../config/database");

class Profile {
  static async create(profileData) {
    const { user_id, nama, tinggi, berat, usia, ibm, target } = profileData;
    const [result] = await db.execute(
      "INSERT INTO profiles (user_id, nama, tinggi, berat, usia, ibm, target, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
      [user_id, nama, tinggi, berat, usia, ibm, target]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await db.execute(
      "SELECT * FROM profiles WHERE user_id = ?",
      [userId]
    );
    return rows[0];
  }

  static async update(user_id, profileData) {
    const { nama, tinggi, berat, usia, ibm, target } = profileData;
    await db.execute(
      "UPDATE profiles SET nama = ?, tinggi = ?, berat = ?, usia = ?, ibm = ?, target = ?, updated_at = NOW() WHERE user_id = ?",
      [nama, tinggi, berat, usia, ibm, target, user_id]
    );
  }

  static async delete(user_id) {
    await db.execute("DELETE FROM profiles WHERE id = ?", [user_id]);
  }
}

module.exports = Profile;
