const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const pool = require("../../database/postgres/pool");
const container = require("../../container");
const createServer = require("../createServer");

describe("replies endpoint", () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await RepliesTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  async function getAccessToken(server) {
    const loginPayload = {
      username: "dicoding",
      password: "kosong123",
    };

    await server.inject({
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
    return responseAuth.data.accessToken;
  }

  describe("when POST threads/{threadId}/comments/{commentId}/replies", () => {
    it("should response 401 if payload did not have access token in Authorization Header", async () => {
      const server = await createServer(container);

      const responseReply = await server.inject({
        method: "POST",
        url: "/threads/thread-123/comments/comment-123/replies",
        payload: {},
      });

      const responseJson = JSON.parse(responseReply.payload);

      expect(responseReply.statusCode).toEqual(401);
      expect(responseJson.error).toEqual("Unauthorized");
      expect(responseJson.message).toEqual("Missing authentication");
    });

    it('should response 404 if thread id did not available', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const responseReply = await server.inject({
                method: 'POST',
                url: '/threads/thread-zzz/comments/comment-yyy/replies',
                payload: {
                    content: 'Dummy content of reply',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(responseReply.payload);

            expect(responseReply.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan!');
        });

    it("should response 404 if comment id did not available", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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

      // add reply
      const responseReply = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/xxxx/replies`,
        payload: {
          content: "Dummy content of reply",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReply.payload);

      expect(responseReply.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("komentar tidak ditemukan!");
    });

    it("should response 400 if payload reply not contain needed property", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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

      const responseReply = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: {},
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(responseReply.payload);

      expect(responseReply.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "gagal membuat reply baru, beberapa properti yang dibutuhkan tidak ada"
      );
    });

    it("should response 400 if payload not meet data type specification", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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

      const replyResponse = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: {
          content: 123,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(replyResponse.payload);

      expect(replyResponse.statusCode).toEqual(400);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "gagal membuat reply baru, tipe data tidak sesuai"
      );
    });

    it("should response 201 and return addedComment", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: {
          content: "Dummy content of reply",
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(201);
      expect(responseJson.status).toEqual("success");
      expect(responseJson.data.addedReply.content).toEqual(
        "Dummy content of reply"
      );
    });
  });

  describe("when DELETE /threads/{threadId}/comments/{commentId}/replies/{id}", () => {
    it("should response 404 if comment not found", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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
        method: "DELETE",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/abc`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("komentar tidak ditemukan!");
    });

    it("should response 404 if reply not found", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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
          content: 'Dummy content of comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentResponse = JSON.parse(comment.payload);

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies/reply-xxx`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual("balasan tidak ditemukan!");
    });

    it("should response 403 if another user delete the comment", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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
          content: 'Dummy content of comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentResponse = JSON.parse(comment.payload);

      const reply = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: {
          content: 'Dummy content of reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const replyResponse = JSON.parse(reply.payload);

      // Other user
      const loginPayload_2 = {
        username: "sitoruszs",
        password: "kosong123",
      };

      await server.inject({
        method: "POST",
        url: "/users",
        payload: {
          username: loginPayload_2.username,
          password: loginPayload_2.password,
          fullname: "Second Account",
        },
      });

      const authentication_2 = await server.inject({
        method: "POST",
        url: "/authentications",
        payload: loginPayload_2,
      });

      const responseAuth_2 = JSON.parse(authentication_2.payload);

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies/${replyResponse.data.addedReply.id}`,
        headers: {
          Authorization: `Bearer ${responseAuth_2.data.accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual("fail");
      expect(responseJson.message).toEqual(
        "Gagal menghapus pesan reply, anda bukan pemilik reply ini!."
      );
    });

    it("should response 200 and return success", async () => {
      const server = await createServer(container);

      const accessToken = await getAccessToken(server);

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
          content: 'Dummy content of comment',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const commentResponse = JSON.parse(comment.payload);

      const reply = await server.inject({
        method: "POST",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies`,
        payload: {
          content: 'Dummy content of reply',
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const replyResponse = JSON.parse(reply.payload);

      const response = await server.inject({
        method: "DELETE",
        url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}/replies/${replyResponse.data.addedReply.id}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const responseJson = JSON.parse(response.payload);

      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual("success");
    });
  });
});
