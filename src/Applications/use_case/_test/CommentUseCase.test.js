const CommentUseCase = require('../CommentUseCase');
const AddedComment = require('../../../Domains/comments/entities/AddedComment');
const AddComment = require('../../../Domains/comments/entities/AddComment');
const ThreadRepository = require('../../../Domains/threads/ThreadRepository');
const CommentRepository = require('../../../Domains/comments/CommentRepository');

describe('CommentUseCase class', () => {
    it('should be defined', async () => {
        const commentUseCase = new CommentUseCase({});
        expect(commentUseCase).toBeDefined();
    });

    describe('addComment function', () => {
        it('should be defined', () => {
            const commentUseCase = new CommentUseCase({});
            expect(commentUseCase.addComment).toBeDefined();
        });

        it('should orchestrating the add comment action correctly', async () => {
            const useCasePayload = {
                thread_id: 'thread-123',
                content: 'Dummy content of comment',
                owner: 'user-123',
            };

            const mockAddedComment = new AddedComment({
                id: 'comment-123',
                content: useCasePayload.content,
                owner: useCasePayload.owner,
            });

            const mockThreadRepository = new ThreadRepository();
            const mockCommentRepository = new CommentRepository();

            mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
                Promise.resolve()
            );

            mockCommentRepository.addComment = jest.fn(() =>
                Promise.resolve(mockAddedComment)
            );

            const commentUseCase = new CommentUseCase({
                threadRepository: mockThreadRepository,
                commentRepository: mockCommentRepository,
            });

            const addedComment = await commentUseCase.addComment(
                useCasePayload
            );

            expect(mockThreadRepository.checkAvailabilityThread).toBeCalledWith(
                useCasePayload.thread_id
            );

            expect(mockCommentRepository.addComment).toBeCalledWith(
                new AddComment({
                    thread_id: useCasePayload.thread_id,
                    content: useCasePayload.content,
                    owner: useCasePayload.owner,
                })
            );
            expect(addedComment).toStrictEqual(
                new AddedComment({
                    id: 'comment-123',
                    content: useCasePayload.content,
                    owner: useCasePayload.owner,
                })
            );
        });
    });

    describe('deleteComment function', () => {
        it('should be defined', () => {
            const commentUseCase = new CommentUseCase({});
            expect(commentUseCase.deleteComment).toBeDefined();
        });

        it('should throw error if use case payload did not contain all data needed', async () => {
            const useCasePayload = {
                thread_id: true,
                comment_id: "comment-123",
            };
            const commentUseCase = new CommentUseCase({});

            await expect(
                commentUseCase.deleteComment(useCasePayload)
            ).rejects.toThrowError(
                'DELETE_COMMENT_USE_CASE.NOT_CONTAIN_VALID_PAYLOAD'
            );
        });

        it('should throw error if payload did not meet data type specification', async () => {
            const useCasePayload = {
                thread_id: true,
                comment_id: "comment-123",
                owner: 123,
            };
            const commentUseCase = new CommentUseCase({});
            await expect(
                commentUseCase.deleteComment(useCasePayload)
            ).rejects.toThrowError(
                'DELETE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION'
            );
        });

        it('should orchestrating the delete comment action correctly', async () => {
            const useCasePayload = {
                thread_id: 'thread-123',
                comment_id: 'comment-123',
                owner: 'user-123',
            };

            const mockCommentRepository = new CommentRepository();
            const mockThreadRepository = new ThreadRepository();

            mockThreadRepository.checkAvailabilityThread = jest.fn(() =>
                Promise.resolve()
            );
            mockCommentRepository.checkAvailabilityComment = jest.fn(() =>
                Promise.resolve()
            );
            mockCommentRepository.verifyCommentOwner = jest.fn(() =>
                Promise.resolve()
            );
            mockCommentRepository.deleteComment = jest.fn(() =>
                Promise.resolve()
            );

            const commentUseCase = new CommentUseCase({
                threadRepository: mockThreadRepository,
                commentRepository: mockCommentRepository,
            });

            await commentUseCase.deleteComment(useCasePayload);

            expect(
                mockThreadRepository.checkAvailabilityThread
            ).toHaveBeenCalledWith(useCasePayload.thread_id);
            expect(
                mockCommentRepository.checkAvailabilityComment
            ).toHaveBeenCalledWith(useCasePayload.comment_id);
            expect(
                mockCommentRepository.verifyCommentOwner
            ).toHaveBeenCalledWith(
                useCasePayload.comment_id,
                useCasePayload.owner
            );
            expect(mockCommentRepository.deleteComment).toHaveBeenCalledWith(
                useCasePayload.comment_id
            );
        });
    });
});