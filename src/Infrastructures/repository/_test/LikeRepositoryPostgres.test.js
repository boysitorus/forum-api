const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const AddLike = require("../../../Domains/likes/entities/AddLike");
const pool = require("../../database/postgres/pool");
const LikeRepository = require("../../../Domains/likes/LikeRepository");
const LikeRepositoryPostgres = require("../LikeRepositoryPostgres");
const InvariantError = require("../../../Commons/exceptions/InvariantError");

describe("LikeRepositoryPostgres", () => {
  it("should be defined and instance of LikeRepository domain", () => {
    const likeRepositoryPostgres = new LikeRepositoryPostgres({}, {});

    expect(likeRepositoryPostgres).toBeDefined();
    expect(likeRepositoryPostgres).toBeInstanceOf(LikeRepository);
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  const addThreadPayload = {
    id: "thread-123",
    owner: "user-123",
  };

  const addCommentPayload = {
    id: "comment-123",
    thread_id: "thread-123",
    owner: "user-123",
  };

  const addLikePayload = {
    id: "like-123",
    thread_id: "thread-123",
    comment_id: "comment-123",
    owner: "user-123",
  };

  describe("addLike function", () => {
    it("should persist add like and return added like correctly", async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      await CommentsTableTestHelper.addComment(addCommentPayload);
      const addLike = new AddLike({
        thread_id: "thread-123",
        comment_id: "comment-123",
        owner: "user-123",
      });
      const fakeIdGenerator = () => "123";
      const likeRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      const addedLike = await likeRepositoryPostgres.addLike(addLike);
      expect(addedLike).toStrictEqual("like-123");
      const newLike = await LikesTableTestHelper.findLikeById("like-123");
      expect(newLike).toHaveLength(1);
    });
  });

  describe("verifyAvailableLike function", () => {
    it("should throw null when thread, comment, and user not available", async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await expect(
        likeRepositoryPostgres.verifyAvailableLike(
          "thread-xxx",
          "comment-xxx",
          "user-xxx"
        )
      ).resolves.toStrictEqual(null);
    });

    it("should throw id when thread, comment, and user available", async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      await CommentsTableTestHelper.addComment(addCommentPayload);
      await LikesTableTestHelper.addLike(addLikePayload);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await expect(
        likeRepositoryPostgres.verifyAvailableLike(
          "thread-123",
          "comment-123",
          "user-123"
        )
      ).resolves.toStrictEqual("like-123");
    });
  });

  describe("deleteLike function", () => {
    it("should throw Error when something wrong", async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await expect(
        likeRepositoryPostgres.deleteLike("like-123")
      ).rejects.toThrowError(InvariantError);
    });

    it("should not throw Error when query run correctly", async () => {
      await UsersTableTestHelper.addUser({ id: "user-123" });
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      await CommentsTableTestHelper.addComment(addCommentPayload);
      await LikesTableTestHelper.addLike(addLikePayload);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      await expect(
        likeRepositoryPostgres.deleteLike("like-123")
      ).resolves.not.toThrowError(InvariantError);
    });
  });

  describe("getLikeByThreadId function", () => {
    it("should throw 0 when like in comment not available", async () => {
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const likes = await likeRepositoryPostgres.getLikeByThreadId(
        "thread-123"
      );

      expect(likes).toHaveLength(0);
    });

    it("should return like count when like in comment available", async () => {
      await UsersTableTestHelper.addUser({});
      await ThreadsTableTestHelper.addThread(addThreadPayload);
      await CommentsTableTestHelper.addComment(addCommentPayload);
      await LikesTableTestHelper.addLike(addLikePayload);
      const likeRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      const likes = await likeRepositoryPostgres.getLikeByThreadId(
        "thread-123"
      );

      expect(Array.isArray(likes)).toBe(true);
      expect(likes[0].id).toEqual("like-123");
      expect(likes[0].thread_id).toEqual("thread-123");
      expect(likes[0].comment_id).toEqual("comment-123");
    });
  });
});
