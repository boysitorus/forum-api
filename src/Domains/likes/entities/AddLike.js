class AddLike {
    constructor(payload) {
        this._verifyPayload(payload);
        const { thread_id, comment_id, owner } = payload;

        this.thread_id = thread_id;
        this.comment_id = comment_id;
        this.owner = owner;
    }

    _verifyPayload({ thread_id, comment_id, owner }) {
        if (!thread_id || !comment_id || !owner) {
            throw new Error('ADD_LIKE.NOT_CONTAIN_NEEDED_PROPERTY');
        }

        if (
            typeof thread_id !== 'string' ||
            typeof comment_id !== 'string' ||
            typeof owner !== 'string'
        ) {
            throw new Error('ADD_LIKE.NOT_MEET_DATA_TYPE_SPECIFICATION');
        }
    }
}

module.exports = AddLike;