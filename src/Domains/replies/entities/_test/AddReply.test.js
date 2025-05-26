const AddReply = require('../AddReply');

describe('a AddReply entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            owner: 'user-123',
            comment_id: 'comment-123',
        };

        expect(() => new AddReply(payload)).toThrowError(
            'ADD_REPLY.NOT_CONTAIN_NEEDED_PROPERTY'
        );
    });

    it('should throw error when payload did not meet data type specification', () => {
        const payload = {
            owner: 'user-123',
            thread_id: 'thread-123',
            comment_id: 'comment-123',
            content: 123,
        };

        expect(() => new AddReply(payload)).toThrowError(
            'ADD_REPLY.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should create new reply object correctly', () => {
        const payload = {
            owner: 'user-123',
            thread_id: 'thread-123',
            comment_id: 'comment-123',
            content: 'Dummy content of reply',
        };

        const { thread_id, owner, comment_id, content } = new AddReply(payload);
        
        expect(thread_id).toEqual(payload.thread_id);
        expect(owner).toEqual(payload.owner);
        expect(comment_id).toEqual(payload.comment_id);
        expect(content).toEqual(payload.content);
    });
});