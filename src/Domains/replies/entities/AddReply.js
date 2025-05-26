class AddReply {
  constructor(payload) {
    this._verifyPayload(payload);
    const { thread_id, comment_id, content, owner } = payload;
    this.thread_id = thread_id;
    this.comment_id = comment_id;
    this.content = content;
    this.owner = owner;
  }

  _verifyPayload({ thread_id, comment_id, content, owner }) {
    if (!thread_id || !comment_id || !content || !owner) {
      throw new Error("ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (
      typeof thread_id !== "string" ||
      typeof comment_id !== "string" ||
      typeof content !== "string" ||
      typeof owner !== "string"
    ) {
      throw new Error("ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION");
    }
  }
}

module.exports = AddReply;
