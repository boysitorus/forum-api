const AddThread = require("../../Domains/threads/entities/AddThread");
const GetComments = require("../../Domains/comments/entities/GetComments");
const GetReplies = require("../../Domains/replies/entities/GetReplies");

class ThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    replyRepository,
    likeRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._replyRepository = replyRepository;
    this._likeRepository = likeRepository;
  }

  async addThread(useCasePayload) {
    const newThread = new AddThread(useCasePayload);
    return this._threadRepository.addThread(newThread);
  }

  async getThread(useCasePayload) {
    const threadId = useCasePayload;
    await this._threadRepository.checkAvailabilityThread(threadId);

    const thread = await this._threadRepository.getThread(threadId);

    const comments = await this._commentRepository.getComments(threadId);
    const commentsThread = comments.map((comment) => {
      return {
        id: comment.id,
        username: comment.username,
        content: comment.content,
        deletedAt: comment.deleted_at
          ? new Date(comment.deleted_at).toISOString()
          : null,
        date: new Date(comment.date).toISOString(),
      };
    });

    // console.log(commentsThread); // debugging

    const replies = await this._replyRepository.getReplies(threadId);
    const repliesThread = replies.map((reply) => {
      return {
        ...reply,
        deleted_at: reply.deleted_at
          ? new Date(reply.deleted_at).toISOString()
          : null,
        date: new Date(reply.date).toISOString(),
      };
    });

    const likes = await this._likeRepository.getLikeByThreadId(threadId);

    // console.log(repliesThread); // debugging

    // merging
    const commentsWithReplies = commentsThread.map((comment) => {
      const nestedReplies = repliesThread
        .filter((reply) => reply.comment_id === comment.id)
        .map((reply) => {
          const buildGetReplies = new GetReplies({
            replies: [reply],
          }).replies[0];

          return buildGetReplies;
        });

      // Assuming GetComments is designed to take an array and expose a formatted comment
      const buildGetComment = new GetComments({ comments: [comment] })
        .comments[0];

      // Count Like for Each Comment
      const likesCount = likes.filter(
        (like) => like.comment_id === comment.id
      ).length;

      // Ensure the original properties from buildGetComment are preserved
      // and then append the replies array
      return {
        ...buildGetComment,
        replies: nestedReplies, // Assign the filtered and formatted replies
        likeCount: likesCount,
      };
    });

    // console.log(commentsWithReplies); // For debugging purposes

    return {
      thread: {
        ...thread,
        comments: commentsWithReplies,
      },
    };
  }
}

module.exports = ThreadUseCase;
