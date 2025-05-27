const AddLike = require('../AddLike');

describe('a AddLike entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            thread_id: 'thread-123',
            comment_id: 'comment-123',
        };
        expect(() => new AddLike(payload)).toThrowError(
            'ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY'
        );
    });

    it('should throw error when payload did not meet data type specification', () => {
        const payload = {
            thread_id: 123,
            comment_id: 123,
            owner: 'user-123',
        };
        expect(() => new AddLike(payload)).toThrowError(
            'ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should create AddLike object correctly', () => {
        const payload = {
            thread_id: 'thread-123',
            comment_id: 'comment-123',
            owner: 'user-123',
        };
        const { thread_id, comment_id, owner } = new AddLike(payload);
        expect(thread_id).toEqual('thread-123');
        expect(comment_id).toEqual('comment-123');
        expect(owner).toEqual('user-123');
    });
});