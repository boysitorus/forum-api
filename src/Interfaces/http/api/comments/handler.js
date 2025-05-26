const CommentUseCase = require('../../../../Applications/use_case/CommentUseCase');

class CommentHandler {
    constructor(container) {
        this._container = container;

        this.postCommentHandler = this.postCommentHandler.bind(this);
        this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
    }

    async postCommentHandler(request, h) {
        const commentUseCase = this._container.getInstance(CommentUseCase.name);
        const { id: owner } = request.auth.credentials;
        const thread_id = request.params.threadId;
        const useCasePayload = {
            content: request.payload.content,
            thread_id,
            owner,
        };
        
        const addedComment = await commentUseCase.addComment(useCasePayload);

        return h
            .response({
                status: 'success',
                data: {
                    addedComment,
                },
            })
            .code(201);
    }

    async deleteCommentHandler(request, h) {
        const commentUseCase = this._container.getInstance(CommentUseCase.name);
        const { id: owner } = request.auth.credentials;
        const thread_id = request.params.threadId;
        const comment_id = request.params.id;
        const useCasePayload = {
            thread_id,
            comment_id,
            owner,
        };
        await commentUseCase.deleteComment(useCasePayload);

        return h.response({
            status: 'success',
        });
    }
}

module.exports = CommentHandler;