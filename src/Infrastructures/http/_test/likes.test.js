const pool = require("../../database/postgres/pool");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const AuthenticationsTableTestHelper = require("../../../../tests/AuthenticationsTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const container = require("../../container");
const createServer = require("../createServer");

describe("likes endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await AuthenticationsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  async function getAccessToken(server) {
    const loginPayload = {
      username: "dicoding",
      password: "kosong123",
    };

    const user = await server.inject({
      method: "POST",
      url: "/users",
      payload: {
        username: "dicoding",
        password: "kosong123",
        fullname: "Dicoding Backend",
      },
    });

    const authentication = await server.inject({
      method: "POST",
      url: "/authentications",
      payload: loginPayload,
    });

    const responseAuth = JSON.parse(authentication.payload);

    return {
      accessToken: responseAuth.data.accessToken,
      owner: user.result.data.addedUser.id,
    };
  }

  describe("when PUT threads/{threadId}/comments/{commentId}/likes", () => {
    it("should response 401 if payload did not have access token in Authorization Header", async () => {
      const server = await createServer(container);

      const responseReply = await server.inject({
        method: "PUT",
        url: "/threads/thread-123/comments/comment-123/likes",
        payload: {},
      });

      const responseJson = JSON.parse(responseReply.payload);

      expect(responseReply.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
      expect(responseJson.message).toEqual("Missing authentication");
    });

    it("should response 404 if thread id did not available", async () => {
      const server = await createServer(container);
      const { accessToken } = await getAccessToken(server);
      const response = await server.inject({
        method: "PUT",
        url: "/threads/thread-xxx/comments/comment-123/likes",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("thread tidak ditemukan!");
    });

    it("should response 404 when comment did not available", async () => {
      const server = await createServer(container);
      const { accessToken } = await getAccessToken(server);

      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Dummy thread title",
          body: "Dummy thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadResponse = JSON.parse(thread.payload);

      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/comment-xxx/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("komentar tidak ditemukan!");
    });

    it("should response 200 and Like to comment", async () => {
      const server = await createServer(container);

      const { accessToken, owner } = await getAccessToken(server);

      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Dummy thread title",
          body: "Dummy thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
          content: "Dummy content of comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: "PUT",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
      const likes = await LikesTableTestHelper.findLike(
        threadResponse.data.addedThread.id,
        commentResponse.data.addedComment.id,
        owner
      );
      expect(likes).toHaveLength(1);
    });

    it("should response 200 and unlike", async () => {
      const server = await createServer(container);

      const { accessToken, user_id } = await getAccessToken(server);

      const thread = await server.inject({
        method: "POST",
        url: "/threads",
        payload: {
          title: "Dummy thread title",
          body: "Dummy thread body",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const threadResponse = JSON.parse(thread.payload);

      const comment = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments`,
        payload: {
           content: "Dummy content of comment",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentResponse = JSON.parse(comment.payload);

      // Add Like
      const responseLike = await server.inject({
        method: "PUT",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // Delete Like
      const responseUnLike = await server.inject({
        method: "PUT",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJsonLike = JSON.parse(responseLike.payload);
      expect(responseLike.statusCode).toEqual(200);
      expect(responseJsonLike.status).toEqual("success");

      const responseJsonUnlike = JSON.parse(responseUnLike.payload);
      expect(responseUnLike.statusCode).toEqual(200);
      expect(responseJsonUnlike.status).toEqual("success");
      const unlikes = await LikesTableTestHelper.findLike(
        threadResponse.data.addedThread.id,
        commentResponse.data.addedComment.id,
        user_id
      );
      expect(unlikes).toHaveLength(0);
    });
  });
});
