const pool = require("@/config/database");

class RevokedToken {
  async create(token, expiresAt) {
    const [{ insertId }] = await pool.query(
      "insert into revoked_tokens (token, expires_at) values (?, ?);",
      [token, expiresAt],
    );
    return insertId;
  }

  async isRevoked(token) {
    const [rows] = await pool.query(
      "select id from revoked_tokens where token = ? limit 1;",
      [token],
    );
    return rows.length > 0;
  }

  async deletedExpiresd() {
    const [{ affectedRows }] = await pool.query(
      "delete from revoked_tokens where expires_at < now();",
    );
    return affectedRows;
  }
}

module.exports = new RevokedToken();
