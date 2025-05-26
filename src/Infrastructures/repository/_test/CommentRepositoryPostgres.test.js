const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const pool = require("../../database/postgres/pool");
const AddComment = require("../../../Domains/comments/entities/AddComment");
const AddedComment = require("../../../Domains/comments/entities/AddedComment");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("CommentRepositoryPostgres", () => {
  it("should be defined and instance of CommentRepository domain", () => {
    const commentRepositoryPostgres = new CommentRepositoryPostgres({}, {});

    expect(commentRepositoryPostgres).toBeDefined();
    expect(commentRepositoryPostgres).toBeInstanceOf(CommentRepository);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const addUserPayload = {
    id: "user-123",
    username: "dicoding",
  };

  const addThreadPayload = {
    id: "thread-123",
    body: "Dummy thread body",
    owner: addUserPayload.id,
  };

  const addCommentPayload = {
    content: "Dummy content of comment",
    thread_id: addThreadPayload.id,
    owner: addUserPayload.id,
  };

  describe("addComment function", () => {
    it("should persist new comment and return added comment correctly", async () => {
      await UsersTableTestHelper.addUser(addUserPayload);

      await ThreadsTableTestHelper.addThread(addThreadPayload);

      const newComment = new AddComment(addCommentPayload);

      const fakeIdGenerator = () => "123";
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedComment = await commentRepositoryPostgres.addComment(
        newComment
      );
      expect(addedComment).toStrictEqual(
        new AddedComment({
          id: "comment-123",
          content: "Dummy content of comment",
          owner: "user-123",
        })
      );

      const comment = await CommentsTableTestHelper.findCommentsById(
        "comment-123"
      );
      expect(comment).toHaveLength(1);
    });
  });

  describe("checkAvailabilityComment function", () => {
    it("should throw NotFoundError if comment not available", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      const commentId = "123";

      await expect(
        commentRepositoryPostgres.checkAvailabilityComment(commentId)
      ).rejects.toThrow(NotFoundError);
    });

    it("should not throw NotFoundError if comment available", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(addUserPayload);

      await ThreadsTableTestHelper.addThread(addThreadPayload);

      await CommentsTableTestHelper.addComment(addCommentPayload);

      await expect(
        commentRepositoryPostgres.checkAvailabilityComment("comment-123")
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe("verifyCommentOwner function", () => {
    it("should throw AuthorizationError if comment not belong to owner", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(addUserPayload);

      await UsersTableTestHelper.addUser({
        id: "user-124",
        username: "sitoruszs",
      });

      await ThreadsTableTestHelper.addThread(addThreadPayload);

      await CommentsTableTestHelper.addComment(addCommentPayload);
      const userId = "user-124"; // 2nd user id

      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", userId)
      ).rejects.toThrow(AuthorizationError);
    });

    it("should not throw AuthorizationError if comment is belongs to owner", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(addUserPayload);

      await ThreadsTableTestHelper.addThread(addThreadPayload);

      await CommentsTableTestHelper.addComment(addCommentPayload);

      await expect(
        commentRepositoryPostgres.verifyCommentOwner("comment-123", "user-123")
      ).resolves.not.toThrow(AuthorizationError);
    });
  });

  describe("deleteComment function", () => {
    it("should delete comment from database", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});
      await UsersTableTestHelper.addUser(addUserPayload);

      await ThreadsTableTestHelper.addThread(addThreadPayload);

      await CommentsTableTestHelper.addComment(addCommentPayload);

      await commentRepositoryPostgres.deleteComment("comment-123");

      const comment = await CommentsTableTestHelper.checkdeletedAtCommentsById(
        "comment-123"
      );
      
      // Make sure the comment value is not null
      expect(comment).not.toBeNull();
      // And make sure the type of comment value is instanceof Date
      expect(comment).toBeInstanceOf(Date);
    });
  });

  describe("getComments function", () => {
    it("should get comments of thread", async () => {
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser(addUserPayload);
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      await CommentsTableTestHelper.addComment(addCommentPayload);

      const comments = await commentRepositoryPostgres.getComments(
        addThreadPayload.id
      );

      expect(Array.isArray(comments)).toBe(true);
      expect(comments[0].id).toEqual("comment-123");
      expect(comments[0].thread_id).toEqual("thread-123");
      expect(comments[0].username).toEqual("dicoding");
      expect(comments[0].content).toEqual("Dummy content of comment");
      expect(comments[0].deleted_at).toBeNull();
      expect(comments[0].date).toBeDefined();
    });
  });
});
