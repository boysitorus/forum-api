const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const pool = require('../../database/postgres/pool');
const container = require('../../container');
const createServer = require('../createServer');

describe('threads endpoint', () => {
    afterAll(async () => {
        await pool.end();
    });

    afterEach(async () => {
        await ThreadsTableTestHelper.cleanTable();
        await UsersTableTestHelper.cleanTable();
    });

    async function getAccessToken() {
        const loginPayload = {
            username: 'dicoding',
            password: 'kosong123',
        };

        // add user
        const server = await createServer(container);

        await server.inject({
            method: 'POST',
            url: '/users',
            payload: {
                username: 'dicoding',
                password: 'kosong123',
                fullname: 'Dicoding Indonesia',
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
    }

    describe('when POST /threads', () => {
        it('should response 401 if authorization in header is missing', async () => {
            const server = await createServer(container);

            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {},
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(401);
            expect(responseJson.error).toEqual('Unauthorized');
            expect(responseJson.message).toEqual('Missing authentication');
        });

        it('should response 400 if payload not contain needed property', async () => {
            const server = await createServer(container);

            // Create user & Login
            const accessToken = await getAccessToken();

            // action add thread
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {},
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            // assert
            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual(
                'gagal membuat thread baru, beberapa properti yang dibutuhkan tidak ada'
            );
        });

        it('should response 400 if payload not meet data type specification', async () => {
            const server = await createServer(container);

            // Create user & Login
            const accessToken = await getAccessToken();

            // action add thread
            const response = await server.inject({
                method: 'POST',
                url: '/threads',
                payload: {
                    title: 'Dummy thread title',
                    body: 123455446,
                },
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(400);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual(
                'gagal membuat thread baru, tipe data tidak sesuai'
            );
        });

        it('should response 201 and create new thread', async () => {
            const server = await createServer(container);

            // Create user & Login
            const accessToken = await getAccessToken();

            // Add Thread
            const response = await server.inject({
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

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(201);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.addedThread.title).toEqual(
                'Dummy thread title'
            );
        });
    });

     describe('when GET /threads', () => {
        it('should response 404 when thread not valid', async () => {
            const server = await createServer(container);

            // Create user & Login
            const accessToken = await getAccessToken();

            const response = await server.inject({
                method: 'GET',
                url: '/threads/xxx',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload);

            expect(response.statusCode).toEqual(404);
            expect(responseJson.status).toEqual('fail');
            expect(responseJson.message).toEqual('thread tidak ditemukan!');
        });

        it('should response 200 and return detail thread', async () => {
            const server = await createServer(container);

            // Create user & Login
            const accessToken = await getAccessToken();

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
                method: 'GET',
                url: `/threads/${threadResponse.data.addedThread.id}`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const responseJson = JSON.parse(response.payload)

            expect(response.statusCode).toEqual(200);
            expect(responseJson.status).toEqual('success');
            expect(responseJson.data.thread.id).toEqual(
                threadResponse.data.addedThread.id
            );
            expect(responseJson.data.thread.title).toEqual('Dummy thread title');
            expect(responseJson.data.thread.body).toEqual('Dummy thread body');
            expect(responseJson.data.thread.username).toEqual('dicoding');
            expect(Array.isArray(responseJson.data.thread.comments)).toBe(true);
            if (Array.isArray(responseJson.data.thread.comments)) {
                responseJson.data.thread.comments.forEach((comments) => {
                    if (comments.replies) {
                        expect(
                            Array.isArray(
                                responseJson.data.thread.comments.replies
                            )
                        ).toBe(true);
                    }
                });
            }
        });
    });
});