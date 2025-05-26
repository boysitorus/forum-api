const GetThread = require('../GetThread');

describe('a GetThread entity', () => {
    it('should throw an error when did not contain needed property', () => {
        // Arrange
        const payload = {
            title: 'Dummy thread title',
            body: 'Dummy thread body',
            date: '2025-05-23T01:01:01.001Z',
            username: 'dicoding',
        };

        // Action & Assert
        expect(() => new GetThread(payload)).toThrowError(
            'GET_THREAD.NOT_CONTAIN_NEEDED_PROPERTY'
        );
    });

    it('should throw an error when did not meet data type specification', () => {
        // Arrange
        const payload = {
            id: 90000,
            title: 'Dummy title',
            body: 123,
            date: 2025,
            username: 'dicoding',
        };

        // Action & Assert
        expect(() => new GetThread(payload)).toThrowError(
            'GET_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION'
        );
    });

    it('should return GetThread object correctly', () => {
        // Arrange
        const payload = {
            id: 'thread-123',
            title: 'Dummy thread title',
            body: 'Dummy thread body',
            date: '2025-05-23T01:01:01.001Z',
            username: 'dicoding',
        };

        // Action
        const getThread = new GetThread(payload);

        // Assert
        expect(getThread.id).toEqual(payload.id);
        expect(getThread.title).toEqual(payload.title);
        expect(getThread.body).toEqual(payload.body);
        expect(getThread.date).toEqual(new Date(payload.date).toISOString());
        expect(getThread.username).toEqual(payload.username);
    });
});