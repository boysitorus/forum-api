/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
    async addComment({
        id = 'comment-123',
        thread_id = 'thread-123',
        content = 'Dummy content of comment',
        owner = 'user-123',
    }) {
        const date = new Date().toISOString();
        const deletedAt = null;
        const query = {
            text: 'INSERT INTO comments VALUES($1, $2, $3, $4, $5, $6)',
            values: [id, content, owner, thread_id, date, deletedAt],
        };

        await pool.query(query);
    },

    async findCommentsById(id) {
        const query = {
            text: 'SELECT * FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        return result.rows;
    },

    async checkdeletedAtCommentsById(id) {
        const query = {
            text: 'SELECT deleted_at FROM comments WHERE id = $1',
            values: [id],
        };

        const result = await pool.query(query);
        const deletedAt = result.rows[0].deleted_at;
        return deletedAt;
    },

    async deleteCommentsById(id) {
        const deletedAt = new Date().toISOString();
        const query = {
            text: 'UPDATE comments SET deleted_at = $2, WHERE id = $1',
            values: [id, deletedAt],
        };
        await pool.query(query);
    },

    async cleanTable() {
        await pool.query('DELETE FROM comments WHERE 1=1');
    },
};

module.exports = CommentsTableTestHelper;