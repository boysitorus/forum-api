const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");
const AddedComment = require("../../Domains/comments/entities/AddedComment");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async addComment(newComment) {
    const { content, thread_id, owner } = newComment;
    const id = `comment-${this._idGenerator()}`;
    const date = new Date().toISOString();
    const deletedAt = null;

    const query = {
      text: "INSERT INTO comments VALUES($1, $2, $3, $4, $5 ,$6) RETURNING id, content, owner",
      values: [id, content, owner, thread_id, date, deletedAt],
    };

    const result = await this._pool.query(query);

    return new AddedComment(result.rows[0]);
  }

  async checkAvailabilityComment(commentId) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1",
      values: [commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new NotFoundError("komentar tidak ditemukan!");
    }
  }

  async verifyCommentOwner(commentId, owner) {
    const query = {
      text: "SELECT * FROM comments WHERE id = $1 AND owner = $2",
      values: [commentId, owner],
    };

    const result = await this._pool.query(query);

    if (result.rowCount === 0) {
      throw new AuthorizationError(
        "Gagal menghapus komentar, anda bukan pemilik komentar ini!"
      );
    }
  }

  async deleteComment(commentId) {
    const deletedAt = new Date().toISOString();
    const query = {
      text: "UPDATE comments SET deleted_at = $2 WHERE id = $1",
      values: [commentId, deletedAt],
    };

    await this._pool.query(query);
  }

  async getComments(threadId) {
    const query = {
      text: `SELECT comments.id, comments.thread_id, users.username, comments.date AS date, comments.content, comments.deleted_at
            FROM comments 
            LEFT JOIN threads ON threads.id = comments.thread_id 
            LEFT JOIN users ON users.id = comments.owner
            WHERE comments.thread_id = $1 
            ORDER BY comments.date 
            ASC`,
      values: [threadId],
    };

    const { rows } = await this._pool.query(query);

    return rows;
  }
}

module.exports = CommentRepositoryPostgres;
