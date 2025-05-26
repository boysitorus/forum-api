class GetComments {
  constructor(payload) {
    this._verifyPayload(payload);
    const comments = this._mapComments(payload);
    this.comments = comments;
  }

  _verifyPayload({ comments }) {
    if (!Array.isArray(comments)) {
      throw new Error("GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }

    for (const comment of comments) {
      const id = "id" in comment;
      const username = "username" in comment;
      const date = "date" in comment;
      const content = "content" in comment;
      const deletedAt = "deletedAt" in comment;

      if (!id || !username || !date || !content || !deletedAt) {
        throw new Error("GET_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY");
      }
    }

    for (const comment of comments) {
      for (const key in comment) {
        if (key === "deletedAt") {
          if (typeof comment[key] !== "string" && comment[key] !== null) {
            throw new Error("GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION");
          }
        } else if (typeof comment[key] !== "string") {
          throw new Error("GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION");
        }
      }
    }
  }

  _mapComments({ comments }) {
    return comments.map((comment) => ({
      id: comment.id,
      username: comment.username,
      date: comment.date,
      content: comment.deletedAt
        ? "**komentar telah dihapus**"
        : comment.content,
    }));
  }
}

module.exports = GetComments;
