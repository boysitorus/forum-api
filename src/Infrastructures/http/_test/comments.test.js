const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('comments endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await CommentsTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    const getAccessToken = async (server) => {
        const loginPayload = {
            username: 'dicoding',
            password: 'kosong123',
        };

        await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: loginPayload.username,
                password: loginPayload.password,
                fullname: 'Dicoding Backend',
            },
        });

        const authentication = await server.inject({
            method: 'POST',
            url: '/authentications',
            payload: loginPayload,
        });

        const responseAuth = JSON.parse(authentication.payload);
        const accessToken = responseAuth.data.accessToken;

        return accessToken;
    };

    describe('when POST threads/{threadId}/comments', () => {
        it('should response 401 if payload not access token', async () => {
            const server = await createServer(container);
            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-123/comments',
                payload: {},
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(401);
            expect(responseJson.error).toEqual('Unauthorized');
            expect(responseJson.message).toEqual('Missing authentication');
        });

        it('should response 400 if payload not contain needed property', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadResponse.data.addedThread.id}/comments`,
                payload: {},
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual(
                'gagal membuat komentar baru, beberapa properti yang dibutuhkan tidak ada'
            );
        });

        it('should response 400 if payload not meet data type specification', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);
            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadResponse.data.addedThread.id}/comments`,
                payload: {
                    content: 123,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual(
                'gagal membuat komentar baru, tipe data tidak sesuai'
            );
        });

        it('should response 404 if thread id not valid', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const response = await server.inject({
                method: 'POST',
                url: '/threads/thread-xxx/comments',
                payload: {
                    content: 'Dummy content of comment',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan!');
        });

        it('should response 201 and return addedComment', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);

            const response = await server.inject({
                method: 'POST',
                url: `/threads/${threadResponse.data.addedThread.id}/comments`,
                payload: {
                    content: 'Dummy content of comment',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedComment.content).toEqual(
                'Dummy content of comment'
            );
        });
    });

    describe('when DELETE /threads/{threadId}/comments/{id}', () => {
        it('should response 404 if thread not found', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const response = await server.inject({
                method: 'DELETE',
                url: '/threads/thread-xxx/comments/comment-123',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan!');
        });

        it('should response 404 if comment not found', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);

            const response = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadResponse.data.addedThread.id}/comments/comment-xxx`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('komentar tidak ditemukan!');
        });

        it('should response 403 if another user delete the comment', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);

            const comment = await server.inject({
                method: 'POST',
                url: `/threads/${threadResponse.data.addedThread.id}/comments`,
                payload: {
                    content: 'Comment made by dicoding',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const commentResponse = JSON.parse(comment.payload);

            // Other user
            const loginPayload_2 = {
                username: 'sitoruszs',
                password: 'kosong123',
            };

            await server.inject({
                method: 'POST',
                url: '/users',
                payload: {
                    username: 'sitoruszs',
                    password: 'kosong123',
                    fullname: 'Another Account',
                },
            });

            const authentication_2 = await server.inject({
                method: 'POST',
                url: '/authentications',
                payload: loginPayload_2,
            });

            const responseAuth_2 = JSON.parse(authentication_2.payload);

            const replyResponse = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}`,
                headers: {
                    Authorization: `Bearer ${responseAuth_2.data.accessToken}`,
                },
            });

            const responseJson = JSON.parse(replyResponse.payload);

            expect(replyResponse.statusCode).toEqual(403);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual(
                'Gagal menghapus komentar, anda bukan pemilik komentar ini!'
            );
        });

        it('should response 200 and return success', async () => {
            const server = await createServer(container);

            const accessToken = await getAccessToken(server);

            const thread = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 'Dummy thread body',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const threadResponse = JSON.parse(thread.payload);

            const comment = await server.inject({
                method: 'POST',
                url: `/threads/${threadResponse.data.addedThread.id}/comments`,
                payload: {
                    content: 'Dummy content of comment',
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const commentResponse = JSON.parse(comment.payload);

            const replyResponse = await server.inject({
                method: 'DELETE',
                url: `/threads/${threadResponse.data.addedThread.id}/comments/${commentResponse.data.addedComment.id}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(replyResponse.payload);

            expect(replyResponse.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
        });
    });
});