const AddedComment = require('../AddedComment');

describe('a AddedComment entities', () => {
    it('should throw error when payload did not contain needed property', () => {
        const payload = {
            id: 'comment-123',
            owner: 'user-123',
        };

        expect(() => new AddedComment(payload)).toThrowError(
            'ADDED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY'
        );
    });

    it('should throw error when payload did not meet data type specification', () => {
        const payload = {
            id: 'comment-123',
            content: 123,
            owner: 'user-123',
        };

        expect(() => new AddedComment(payload)).toThrowError(
            'ADDED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should create new added comment object correctly', () => {
        const payload = {
            id: 'comment-123',
            content: 'Dummy content of comment',
            owner: 'user-123',
        };

        const addedComment = new AddedComment(payload);

        expect(addedComment.id).toEqual(payload.id);
        expect(addedComment.content).toEqual(payload.content);
        expect(addedComment.owner).toEqual(payload.owner);
    });
});