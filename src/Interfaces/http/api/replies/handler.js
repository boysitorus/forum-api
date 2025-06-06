const ReplyUseCase = require('../../../../Applications/use_case/ReplyUseCase');

class ReplyHandler {
    constructor(container) {
        this._container = container;

        this.postReplyHandler = this.postReplyHandler.bind(this);
        this.deleteReplyHandler = this.deleteReplyHandler.bind(this);
    }

    async postReplyHandler(request, h) {
        const replyUseCase = this._container.getInstance(ReplyUseCase.name);
        const { id: owner } = request.auth.credentials;
        const thread_id = request.params.threadId;
        const comment_id = request.params.commentId;
        const useCasePayload = {
            content: request.payload.content,
            thread_id,
            comment_id,
            owner,
        };
        const addedReply = await replyUseCase.addReply(useCasePayload);

        return h
            .response({
                status: 'success',
                data: {
                    addedReply,
                },
            })
            .code(201);
    }

    async deleteReplyHandler(request, h) {
        const replyUseCase = this._container.getInstance(ReplyUseCase.name);
        const { id: owner } = request.auth.credentials;
        const thread_id = request.params.threadId;
        const comment_id = request.params.commentId;
        const reply_id = request.params.id;
        const useCasePayload = {
            thread_id,
            comment_id,
            reply_id,
            owner,
        };
        await replyUseCase.deleteReply(useCasePayload);

        return h.response({
            status: 'success',
        });
    }
}

module.exports = ReplyHandler;