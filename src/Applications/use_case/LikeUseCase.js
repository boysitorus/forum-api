const AddLike = require('../../Domains/likes/entities/AddLike');

class LikeUseCase {
    constructor({ likeRepository, commentRepository, threadRepository }) {
        this._likeRepository = likeRepository;
        this._commentRepository = commentRepository;
        this._threadRepository = threadRepository;
    }

    async execute(useCasePayload) {
        const addLike = new AddLike(useCasePayload); //verify payload AddLike
        const { thread_id, comment_id, owner } = addLike;
        await this._threadRepository.checkAvailabilityThread(thread_id);
        await this._commentRepository.checkAvailabilityComment(comment_id);
        const id = await this._likeRepository.verifyAvailableLike(
            thread_id,
            comment_id,
            owner
        );
        if (id) await this._likeRepository.deleteLike(id);
        else await this._likeRepository.addLike(addLike);
    }
}

module.exports = LikeUseCase;