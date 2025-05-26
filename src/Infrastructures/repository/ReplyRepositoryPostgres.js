const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ReplyRepository = require("../../Domains/replies/ReplyRepository");
const AddedReply = require("../../Domains/replies/entities/AddedReply");

class ReplyRepositoryPostgres extends ReplyRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addReply(replyData) {
    const { thread_id, comment_id, content, owner } = replyData;
    const id = `reply-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const deletedAt = null;

    const query = {
      text: "INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id, content, owner",
      values: [id, content, owner, thread_id, comment_id, date, deletedAt],
    };

    const result = await this._pool.query(query);

    return new AddedReply(result.rows[0]);
  }

  async checkAvailabilityReply(replyId) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1",
      values: [replyId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("balasan tidak ditemukan!");
    }
  }

  async verifyReplyOwner(replyId, owner) {
    const query = {
      text: "SELECT * FROM replies WHERE id = $1 AND owner = $2",
      values: [replyId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError(
        "Gagal menghapus pesan reply, anda bukan pemilik reply ini!."
      );
    }
  }

  async deleteReply(replyId) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: "UPDATE replies SET deleted_at = $2 WHERE id = $1",
      values: [replyId, deletedAt],
    };

    await this._pool.query(query);
  }

  async getReplies(threadId) {
    const query = {
      text: `SELECT replies.id, replies.comment_id, users.username, replies.date, replies.content, replies.deleted_at 
            FROM replies 
          LEFT JOIN comments ON comments.id = replies.comment_id
          LEFT JOIN users ON users.id = replies.owner 
          WHERE replies.thread_id = $1 
          ORDER BY replies.date
          ASC`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = ReplyRepositoryPostgres;
