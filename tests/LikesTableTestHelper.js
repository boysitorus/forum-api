/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const LikesTableTestHelper = {
    async addLike({
        id = 'like-123',
        threadId = 'thread-123',
        commentId = 'comment-123',
        owner = 'user-123',
    }) {
        const query = {
            text: 'INSERT INTO likes VALUES($1, $2, $3, $4)',
            values: [id, threadId, commentId, owner],
        };

        await pool.query(query);
    },

    async findLikeById(id) {
        const query = {
            text: 'SELECT * FROM likes WHERE id = $1',
            values: [id],
        };

        const { rows } = await pool.query(query);
        return rows;
    },

    async findLike(threadId, commentId, owner) {
        const query = {
            text: 'SELECT id FROM likes WHERE thread_id = $1 AND comment_id = $2 AND owner = $3',
            values: [threadId, commentId, owner],
        };

        const { rows } = await pool.query(query);
        return rows;
    },

    async cleanTable() {
        await pool.query('DELETE FROM likes WHERE 1=1');
    },
};

module.exports = LikesTableTestHelper;