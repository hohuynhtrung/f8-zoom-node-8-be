const pool = require("@/config/database");

class Task {
  async findByUserId(userId) {
    const [rows] = await pool.query(
      "select id, title, is_completed, created_at from tasks where user_id = ? order by created_at desc;",
      [userId],
    );
    return rows;
  }
  async findByIdAndUserId(id, userId) {
    const [rows] = await pool.query(
      "select id, title, is_completed, created_at from tasks where id = ? and user_id = ?;",
      [id, userId],
    );
    return rows[0];
  }

  async create(userId, title) {
    const [result] = await pool.query(
      "INSERT INTO tasks (user_id, title) VALUES (?, ?);",
      [userId, title],
    );
    return this.findByIdAndUserId(result.insertId, userId);
  }

  async update(id, userId, { title, is_completed }) {
    const [result] = await pool.query(
      "update tasks set title = ?, is_completed = ? where id = ? and user_id = ?;",
      [title, is_completed, id, userId],
    );
    return result.affectedRows;
  }

  async destroy(id, user_id) {
    const [result] = await pool.query(
      "delete from tasks where id = ? and user_id = ?;",
      [id, user_id],
    );
    return result.affectedRows;
  }
}

module.exports = new Task();
