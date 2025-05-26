const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const AddThread = require("../../../Domains/threads/entities/AddThread");
const AddedThread = require("../../../Domains/threads/entities/AddedThread");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  it("should be instance of ThreadRepository", () => {
    const threadRepositoryPostgres = new ThreadRepositoryPostgres({}, {});

    expect(threadRepositoryPostgres).toBeInstanceOf(ThreadRepository);
  });

  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("addThread function", () => {
    it("should persist new thread and return added thread correctly", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });

      const newThread = new AddThread({
        title: "Dummy thread title",
        body: "Dummy thread body",
        owner: "user-123",
      });

      const fakeIdGenerator = () => "12345";
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const addedThread = await threadRepositoryPostgres.addThread(newThread);

      // Assert
      expect(addedThread).toStrictEqual(
        new AddedThread({
          id: "thread-12345",
          title: "Dummy thread title",
          owner: "user-123",
        })
      );

      const thread = await ThreadsTableTestHelper.findThreadsById(
        "thread-12345"
      );
      expect(thread).toHaveLength(1);
    });
  });

  describe("checkAvailabilityThread function", () => {
    it("should throw NotFoundError if thread not available", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const threadId = "thread-123";

      await expect(
        threadRepositoryPostgres.checkAvailabilityThread(threadId)
      ).rejects.toThrow(NotFoundError);
      await expect(
        threadRepositoryPostgres.checkAvailabilityThread(threadId)
      ).rejects.toThrowError("thread tidak ditemukan!");
    });

    it("should not throw NotFoundError if thread available", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      await ThreadsTableTestHelper.addThread({
        id: "thread-123",
        body: "Dummy thread body",
        owner: "user-123",
      });

      await expect(
        threadRepositoryPostgres.checkAvailabilityThread("thread-123")
      ).resolves.not.toThrow(NotFoundError);
    });
  });

  describe("getDetailThread function", () => {
    it("should get detail thread", async () => {
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      const userPayload = {
        id: "user-123",
        username: "dicoding",
      };

      await UsersTableTestHelper.addUser(userPayload);

      const threadPayload = {
        id: "thread-123",
        title: "Dummy thread title",
        body: "Dummy thread body",
        owner: "user-123",
      };

      await ThreadsTableTestHelper.addThread(threadPayload);

      const detailThread = await threadRepositoryPostgres.getThread(
        threadPayload.id
      );

      expect(detailThread.id).toEqual(threadPayload.id);
      expect(detailThread.title).toEqual(threadPayload.title);
      expect(detailThread.body).toEqual(threadPayload.body);
      expect(detailThread.username).toEqual(userPayload.username);
    });
  });
});
