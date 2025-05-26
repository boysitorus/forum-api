const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const AddReply = require('../../../Domains/replies/entities/AddReply');
const AddedReply = require('../../../Domains/replies/entities/AddedReply');
const NotFoundError = require('../../../Commons/exceptions/NotFoundError');
const AuthorizationError = require('../../../Commons/exceptions/AuthorizationError');
const pool = require('../../database/postgres/pool');
const ReplyRepositoryPostgres = require('../ReplyRepositoryPostgres');

describe('ReplyRepositoryPostgres', () => {
    it('should be instance of ReplyRepository domain', () => {
        const replyRepositoryPostgres = new ReplyRepositoryPostgres({}, {});

        expect(replyRepositoryPostgres).toBeInstanceOf(ReplyRepositoryPostgres);
    });

    afterEach(async () => {
        await UsersTableTestHelper.cleanTable();
        await ThreadsTableTestHelper.cleanTable();
        await CommentsTableTestHelper.cleanTable();
        await RepliesTableTestHelper.cleanTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    const getPayloadDummy = () => {
        const userPayload = {
            id: 'user-123',
            username: 'dicoding',
        };

        const threadPayload = {
            id: 'thread-123',
            title: 'Dummy thread title',
            body: 'Dummy thread body',
            owner: userPayload.id,
        };

        const commentPayload = {
            id: 'comment-123',
            content: 'Dummy content of comment',
            thread_id: threadPayload.id,
            owner: userPayload.id,
        };

        const replyPayload = {
            id: 'reply-123',
            thread_id: threadPayload.id,
            comment_id: commentPayload.id,
            content: 'Dummy content of reply',
            owner: userPayload.id,
        };

        return {
            userPayload,
            threadPayload,
            commentPayload,
            replyPayload,
        };
    };

    describe('addReply function', () => {
        it('should persist new reply and return added reply correctly', async () => {
            const fakeIdGenerator = () => '123';
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                fakeIdGenerator
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);

            const replyData = new AddReply({
                thread_id: threadPayload.id,
                comment_id: commentPayload.id,
                content: replyPayload.content,
                owner: userPayload.id,
            });

            const addedReply = await replyRepositoryPostgres.addReply(
                replyData
            );

            expect(addedReply).toStrictEqual(
                new AddedReply({
                    id: replyPayload.id,
                    content: replyPayload.content,
                    owner: userPayload.id,
                })
            );

            const reply = await RepliesTableTestHelper.findRepliesById(
                'reply-123'
            );

            expect(reply).toHaveLength(1);
            expect(reply).toEqual(expect.any(Array));
            expect(reply[0]).toEqual(expect.any(Object));
            expect(reply[0]).toHaveProperty('id', expect.any(String));
        });
    });

    describe('checkAvailabilityReply function', () => {
        it('should throw NotFoundError if reply not available', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );
            const reply = 'reply-123';

            await expect(
                replyRepositoryPostgres.checkAvailabilityReply(reply)
            ).rejects.toThrow(NotFoundError);
        });

        it('should not throw NotFoundError if reply available', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(replyPayload);

            await expect(
                replyRepositoryPostgres.checkAvailabilityReply('reply-123')
            ).resolves.not.toThrow(NotFoundError);
        });
    });

    describe('verifyReplyOwner function', () => {
        it('should throw AuthorizationError if reply not belong to owner', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(replyPayload);

            await UsersTableTestHelper.addUser({
                id: 'user-124',
                username: 'sitoruszs',
            });
            const owner = 'user-124';

            await expect(
                replyRepositoryPostgres.verifyReplyOwner('reply-123', owner)
            ).rejects.toThrow(AuthorizationError);
        });

        it('should not throw AuthorizationError if reply is belongs to owner', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(replyPayload);

            await expect(
                replyRepositoryPostgres.verifyReplyOwner(
                    'reply-123',
                    'user-123'
                )
            ).resolves.not.toThrow(AuthorizationError);
        });
    });

    describe('deleteReply', () => {
        it('should delete reply from database', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(replyPayload);

            await replyRepositoryPostgres.deleteReply('reply-123');

            const isReplyDeleted =
                await RepliesTableTestHelper.checkDeletedAtRepliesById(
                    'reply-123'
                );

            expect(isReplyDeleted).toBeInstanceOf(Date);
        });
    });

    describe('getRepliesThread', () => {
        it('should get replies from threads based on comments', async () => {
            const replyRepositoryPostgres = new ReplyRepositoryPostgres(
                pool,
                {}
            );

            const { userPayload, threadPayload, commentPayload, replyPayload } =
                getPayloadDummy();

            await UsersTableTestHelper.addUser(userPayload);
            await ThreadsTableTestHelper.addThread(threadPayload);
            await CommentsTableTestHelper.addComment(commentPayload);
            await RepliesTableTestHelper.addReply(replyPayload);

            const replies = await replyRepositoryPostgres.getReplies(
                threadPayload.id
            );

            expect(replies).toEqual(expect.any(Array));
            expect(replies[0].id).toEqual(replyPayload.id);
            expect(replies[0].comment_id).toEqual(commentPayload.id);
            expect(replies[0].username).toEqual(userPayload.username);
            expect(replies[0].date).toBeDefined();
            expect(replies[0].content).toEqual('Dummy content of reply');
            expect(replies[0].deleted_at).toBeNull();
        });
    });
});