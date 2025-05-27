const ThreadUseCase = require("../ThreadUseCase");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const GetThread = require("../../../Domains/threads/entities/GetThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const ReplyRepository = require("../../../Domains/replies/ReplyRepository");
const LikeRepository = require("../../../Domains/likes/LikeRepository");

describe("ThreadUseCase", () => {
  describe("addThread function", () => {
    it("should orchestrating the add thread function correctly", async () => {
      // Arrange
      const useCasePayload = {
        title: "Dummy thread title",
        body: "Dummy thread body",
        owner: "user-123",
      };

      const mockAddedThread = new AddedThread({
        id: "thread-123",
        title: useCasePayload.title,
        body: useCasePayload.body,
        owner: useCasePayload.owner,
      });

      const mockThreadRepository = new ThreadRepository();
      mockThreadRepository.addThread = jest.fn(() =>
        Promise.resolve(mockAddedThread)
      );

      const getThreadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: {},
        replyRepository: {},
      });

      // Action
      const addedThread = await getThreadUseCase.addThread(useCasePayload);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-123",
          title: useCasePayload.title,
          body: useCasePayload.body,
          owner: useCasePayload.owner,
        })
      );

      expect(mockThreadRepository.addThread).toBeCalledWith(
        new AddThread({
          title: useCasePayload.title,
          body: useCasePayload.body,
          owner: useCasePayload.owner,
        })
      );
    });
  });

  describe("getThread function", () => {
    it("should get return detail thread correctly", async () => {
      // Arrange
      const expectedThread = new GetThread({
        id: "thread-123",
        title: "Dummy thread title",
        body: "Dummy thread body",
        date: "2025-05-23T01:01:01.001Z",
        username: "dicoding",
      });

      const expectedComments = [
        {
          id: "comment-123",
          content: "Dummy content of comment",
          username: "dicoding",
          thread_id: "thread-123",
          date: "2025-05-23T01:01:01.001Z",
          deleted_at: null,
        },
        {
          id: "comment-124",
          content: "Dummy content of comment",
          username: "sitoruszs",
          thread_id: "thread-123",
          date: "2025-05-24T01:01:01.001Z",
          deleted_at: null,
        },
      ];

      const expectedReplies = [
        {
          id: "reply-123",
          content: "Dummy content of reply",
          date: "2025-05-24T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
        {
          id: "reply-124",
          content: "Dummy content of reply",
          date: "2025-05-25T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
      ];

      const expectedLikes = [];

      // Test Double
      const threadId = "thread-123";
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
        Promise.resolve()
      );

      mockThreadRepository.getThread = jest.fn(() =>
        Promise.resolve(expectedThread)
      );

      mockCommentRepository.getComments = jest.fn(() =>
        Promise.resolve(expectedComments)
      );

      mockReplyRepository.getReplies = jest.fn(() =>
        Promise.resolve(expectedReplies)
      );

      mockLikeRepository.getLikeByThreadId = jest.fn(() =>
        Promise.resolve(expectedLikes)
      );

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const detailThread = await threadUseCase.getThread(threadId);

      expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(
        threadId
      );

      expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
      expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(threadId);
      expect(mockLikeRepository.getLikeByThreadId).toHaveBeenCalledWith(
        threadId
      );

      expect(detailThread).toStrictEqual({
        thread: {
          id: "thread-123",
          title: "Dummy thread title",
          body: "Dummy thread body",
          date: "2025-05-23T01:01:01.001Z",
          username: "dicoding",
          comments: [
            {
              id: "comment-123",
              username: "dicoding",
              date: "2025-05-23T01:01:01.001Z",
              content: "Dummy content of comment",
              replies: [],
              likeCount: 0,
            },
            {
              id: "comment-124",
              username: "sitoruszs",
              date: "2025-05-24T01:01:01.001Z",
              content: "Dummy content of comment",
              replies: [
                {
                  id: "reply-123",
                  username: "dicoding",
                  date: "2025-05-24T01:01:01.001Z",
                  content: "Dummy content of reply",
                },
                {
                  id: "reply-124",
                  content: "Dummy content of reply",
                  date: "2025-05-25T01:01:01.001Z",
                  username: "dicoding",
                },
              ],
              likeCount: 0,
            },
          ],
        },
      });
    });

    it("should get return detail thread correctly when there is deleted comment", async () => {
      // Arrange
      const expectedThread = new GetThread({
        id: "thread-123",
        title: "Dummy thread title",
        body: "Dummy thread body",
        date: "2025-05-23T01:01:01.001Z",
        username: "dicoding",
      });

      const expectedComments = [
        {
          id: "comment-123",
          content: "Dummy content of comment",
          username: "dicoding",
          thread_id: "thread-123",
          date: "2025-05-23T01:01:01.001Z",
          deleted_at: "2025-05-24T01:01:01.001Z",
        },
        {
          id: "comment-124",
          content: "Dummy content of comment",
          username: "sitoruszs",
          thread_id: "thread-123",
          date: "2025-05-24T01:01:01.001Z",
          deleted_at: null,
        },
      ];

      const expectedReplies = [
        {
          id: "reply-123",
          content: "Dummy content of reply",
          date: "2025-05-24T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
        {
          id: "reply-124",
          content: "Dummy content of reply",
          date: "2025-05-25T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
      ];

      const expectedLikes = [];

      // Test Double
      const threadId = "thread-123";
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
        Promise.resolve()
      );

      mockThreadRepository.getThread = jest.fn(() =>
        Promise.resolve(expectedThread)
      );

      mockCommentRepository.getComments = jest.fn(() =>
        Promise.resolve(expectedComments)
      );

      mockReplyRepository.getReplies = jest.fn(() =>
        Promise.resolve(expectedReplies)
      );

      mockLikeRepository.getLikeByThreadId = jest.fn(() =>
        Promise.resolve(expectedLikes)
      );

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const detailThread = await threadUseCase.getThread(threadId);

      expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(
        threadId
      );

      expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
      expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(threadId);
      expect(mockLikeRepository.getLikeByThreadId).toHaveBeenCalledWith(
        threadId
      );

      expect(detailThread).toStrictEqual({
        thread: {
          id: "thread-123",
          title: "Dummy thread title",
          body: "Dummy thread body",
          date: "2025-05-23T01:01:01.001Z",
          username: "dicoding",
          comments: [
            {
              id: "comment-123",
              username: "dicoding",
              date: "2025-05-23T01:01:01.001Z",
              content: "**komentar telah dihapus**",
              replies: [],
              likeCount: 0,
            },
            {
              id: "comment-124",
              username: "sitoruszs",
              date: "2025-05-24T01:01:01.001Z",
              content: "Dummy content of comment",
              replies: [
                {
                  id: "reply-123",
                  username: "dicoding",
                  date: "2025-05-24T01:01:01.001Z",
                  content: "Dummy content of reply",
                },
                {
                  id: "reply-124",
                  content: "Dummy content of reply",
                  date: "2025-05-25T01:01:01.001Z",
                  username: "dicoding",
                },
              ],
              likeCount: 0,
            },
          ],
        },
      });
    });

    it("should get return detail thread correctly when there is deleted reply", async () => {
      // Arrange
      const expectedThread = new GetThread({
        id: "thread-123",
        title: "Dummy thread title",
        body: "Dummy thread body",
        date: "2025-05-23T01:01:01.001Z",
        username: "dicoding",
      });

      const expectedComments = [
        {
          id: "comment-123",
          content: "Dummy content of comment",
          username: "dicoding",
          thread_id: "thread-123",
          date: "2025-05-23T01:01:01.001Z",
          deleted_at: "2025-05-24T01:01:01.001Z",
        },
        {
          id: "comment-124",
          content: "Dummy content of comment",
          username: "sitoruszs",
          thread_id: "thread-123",
          date: "2025-05-24T01:01:01.001Z",
          deleted_at: null,
        },
      ];

      const expectedReplies = [
        {
          id: "reply-123",
          content: "Dummy content of reply",
          date: "2025-05-24T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: "2025-05-25T01:01:01.001Z",
        },
        {
          id: "reply-124",
          content: "Dummy content of reply",
          date: "2025-05-25T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
      ];

      const expectedLikes = [];

      // Test Double
      const threadId = "thread-123";
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
        Promise.resolve()
      );

      mockThreadRepository.getThread = jest.fn(() =>
        Promise.resolve(expectedThread)
      );

      mockCommentRepository.getComments = jest.fn(() =>
        Promise.resolve(expectedComments)
      );

      mockReplyRepository.getReplies = jest.fn(() =>
        Promise.resolve(expectedReplies)
      );

      mockLikeRepository.getLikeByThreadId = jest.fn(() =>
        Promise.resolve(expectedLikes)
      );

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const detailThread = await threadUseCase.getThread(threadId);

      expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(
        threadId
      );

      expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
      expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(threadId);
      expect(mockLikeRepository.getLikeByThreadId).toHaveBeenCalledWith(
        threadId
      );

      expect(detailThread).toStrictEqual({
        thread: {
          id: "thread-123",
          title: "Dummy thread title",
          body: "Dummy thread body",
          date: "2025-05-23T01:01:01.001Z",
          username: "dicoding",
          comments: [
            {
              id: "comment-123",
              username: "dicoding",
              date: "2025-05-23T01:01:01.001Z",
              content: "**komentar telah dihapus**",
              replies: [],
              likeCount: 0,
            },
            {
              id: "comment-124",
              username: "sitoruszs",
              date: "2025-05-24T01:01:01.001Z",
              content: "Dummy content of comment",
              replies: [
                {
                  id: "reply-123",
                  username: "dicoding",
                  date: "2025-05-24T01:01:01.001Z",
                  content: "**balasan telah dihapus**",
                },
                {
                  id: "reply-124",
                  content: "Dummy content of reply",
                  date: "2025-05-25T01:01:01.001Z",
                  username: "dicoding",
                },
              ],
              likeCount: 0,
            },
          ],
        },
      });
    });

    it("should get return detail thread correctly when there is comment like added", async () => {
      // Arrange
      const expectedThread = new GetThread({
        id: "thread-123",
        title: "Dummy thread title",
        body: "Dummy thread body",
        date: "2025-05-23T01:01:01.001Z",
        username: "dicoding",
      });

      const expectedComments = [
        {
          id: "comment-123",
          content: "Dummy content of comment",
          username: "dicoding",
          thread_id: "thread-123",
          date: "2025-05-23T01:01:01.001Z",
          deleted_at: "2025-05-24T01:01:01.001Z",
        },
        {
          id: "comment-124",
          content: "Dummy content of comment",
          username: "sitoruszs",
          thread_id: "thread-123",
          date: "2025-05-24T01:01:01.001Z",
          deleted_at: null,
        },
      ];

      const expectedReplies = [
        {
          id: "reply-123",
          content: "Dummy content of reply",
          date: "2025-05-24T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: "2025-05-25T01:01:01.001Z",
        },
        {
          id: "reply-124",
          content: "Dummy content of reply",
          date: "2025-05-25T01:01:01.001Z",
          username: "dicoding",
          comment_id: "comment-124",
          deleted_at: null,
        },
      ];

      const expectedLikes = [
        {
          id: "like-123",
          comment_id: "comment-123",
          thread_id: "thread-qL0F2VXZNo71cUwy-mGmq",
        },
        {
          id: "like-124",
          comment_id: "comment-123",
          thread_id: "thread-qL0F2VXZNo71cUwy-mGmq",
        },
        {
          id: "like-125",
          comment_id: "comment-124",
          thread_id: "thread-qL0F2VXZNo71cUwy-mGmq",
        },
      ];

      // Test Double
      const threadId = "thread-123";
      const mockThreadRepository = new ThreadRepository();
      const mockCommentRepository = new CommentRepository();
      const mockReplyRepository = new ReplyRepository();
      const mockLikeRepository = new LikeRepository();

      mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
        Promise.resolve()
      );

      mockThreadRepository.getThread = jest.fn(() =>
        Promise.resolve(expectedThread)
      );

      mockCommentRepository.getComments = jest.fn(() =>
        Promise.resolve(expectedComments)
      );

      mockReplyRepository.getReplies = jest.fn(() =>
        Promise.resolve(expectedReplies)
      );

      mockLikeRepository.getLikeByThreadId = jest.fn(() =>
        Promise.resolve(expectedLikes)
      );

      const threadUseCase = new ThreadUseCase({
        threadRepository: mockThreadRepository,
        commentRepository: mockCommentRepository,
        replyRepository: mockReplyRepository,
        likeRepository: mockLikeRepository,
      });

      // Action
      const detailThread = await threadUseCase.getThread(threadId);

      expect(mockThreadRepository.checkAvailabilityThread).toHaveBeenCalledWith(
        threadId
      );

      expect(mockThreadRepository.getThread).toHaveBeenCalledWith(threadId);
      expect(mockCommentRepository.getComments).toHaveBeenCalledWith(threadId);
      expect(mockReplyRepository.getReplies).toHaveBeenCalledWith(threadId);
      expect(mockLikeRepository.getLikeByThreadId).toHaveBeenCalledWith(
        threadId
      );

      expect(detailThread).toStrictEqual({
        thread: {
          id: "thread-123",
          title: "Dummy thread title",
          body: "Dummy thread body",
          date: "2025-05-23T01:01:01.001Z",
          username: "dicoding",
          comments: [
            {
              id: "comment-123",
              username: "dicoding",
              date: "2025-05-23T01:01:01.001Z",
              content: "**komentar telah dihapus**",
              replies: [],
              likeCount: 2,
            },
            {
              id: "comment-124",
              username: "sitoruszs",
              date: "2025-05-24T01:01:01.001Z",
              content: "Dummy content of comment",
              replies: [
                {
                  id: "reply-123",
                  username: "dicoding",
                  date: "2025-05-24T01:01:01.001Z",
                  content: "**balasan telah dihapus**",
                },
                {
                  id: "reply-124",
                  content: "Dummy content of reply",
                  date: "2025-05-25T01:01:01.001Z",
                  username: "dicoding",
                },
              ],
              likeCount: 1,
            },
          ],
        },
      });
    });
  });
});
