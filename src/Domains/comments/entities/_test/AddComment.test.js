const AddComment = require('../AddComment');

describe('an AddComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            owner: 'user-123',
            thread_id: 'thread-123',
        };

        expect(() => new AddComment(payload)).toThrowError(
            'ADD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
        );
    });

    it('should throw error when payload did not meet data type specification', () => {
        const payload = {
            owner: 'user-123',
            thread_id: 123,
            content: 'Dummy content of comment',
        };

        expect(() => new AddComment(payload)).toThrowError(
            'ADD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should create AddComment object correctly', () => {
        const payload = {
            owner: 'user-123',
            thread_id: 'thread-123',
            content: 'Dummy content of comment',
        };

        const { owner, thread_id, content } = new AddComment(payload);

        expect(owner).toEqual(payload.owner);
        expect(thread_id).toEqual(payload.thread_id);
        expect(content).toEqual(payload.content);
    });
});