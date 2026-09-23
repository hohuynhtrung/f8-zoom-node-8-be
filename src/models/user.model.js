const pool = require("@/config/database");

class User {
  async findOne(id) {
    const [rows] = await pool.query(
      "select id, email, created_at from users where id = ?;",
      [id],
    );
    return rows[0];
  }

  async findByEmail(email) {
    const [rows] = await pool.query(
      "select id, email, password, verified_at, refresh_token, refresh_expires_at from users where email = ?;",
      [email],
    );
    return rows[0];
  }

  async create(email, password) {
    const [{ insertId }] = await pool.query(
      "insert into users (email, password) values (?, ?);",
      [email, password],
    );
    return insertId;
  }

  async updateRefreshToken(id, token, expiresAt) {
    const [{ affectedRows }] = await pool.query(
      "update users set refresh_token = ?, refresh_expires_at = ? where id = ?;",
      [token, expiresAt, id],
    );
    return affectedRows;
  }

  async findByRefreshToken(token) {
    const [rows] = await pool.query(
      "select id, email, refresh_expires_at from users where refresh_token = ?;",
      [token],
    );
    return rows[0];
  }

  async verifyEmail(id) {
    const query = `update users set verified_at = now() where id = ?`;
    const [{ affectedRows }] = await pool.query(query, [id]);
    return affectedRows;
  }

  async findByWithPassword(id) {
    const [rows] = await pool.query(
      "select id, email, password, verified_at from users where id = ?;",
      [id],
    );
    return rows[0];
  }

  async updatePassword(id, hashPassword) {
    const query = `update users set password = ? where id = ?`;
    const [{ affectedRows }] = await pool.query(query, [hashPassword, id]);
    return affectedRows;
  }
}

module.exports = new User();
