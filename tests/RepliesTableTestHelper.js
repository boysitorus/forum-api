/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
    async addReply({
        id = 'reply-123',
        thread_id = 'thread-123',
        comment_id = 'comment-123',
        content = 'Dummy content of reply',
        owner = 'user-123',
    }) {
        const date = new Date().toISOString();
        const deletedAt = null;
        const query = {
            text: 'INSERT INTO replies VALUES($1, $2, $3, $4, $5, $6, $7)',
            values: [id, content, owner, thread_id, comment_id, date, deletedAt],
        };

        await pool.query(query);
    },

    async findRepliesById(id) {
        const query = {
            text: 'SELECT * FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async checkDeletedAtRepliesById(id) {
        const query = {
            text: 'SELECT deleted_at FROM replies WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        const deletedAt = result.rows[0].deleted_at;
        return deletedAt;
    },

    async deleteRepliesById(id) {
        const deletedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE replies SET deleted_at = $2 WHERE id = $1',
            values: [id, deletedAt],
        };
        await pool.query(query);
    },

    async cleanTable() {
        await pool.query('DELETE FROM replies WHERE 1=1');
    },
};

module.exports = RepliesTableTestHelper;