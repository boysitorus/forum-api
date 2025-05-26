const ThreadUseCase = require("../../../../Applications/use_case/ThreadUseCase");

class ThreadHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getThreadHandler = this.getThreadHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);

    const { id: owner } = request.auth.credentials;

    const useCasePayload = {
      title: request.payload.title,
      body: request.payload.body,
      owner: owner,
    };

    const addedThread = await threadUseCase.addThread(useCasePayload);
    
    return h
      .response({
        status: "success",
        data: {
          addedThread,
        },
      })
      .code(201);
  }

  async getThreadHandler(request, h) {
    const threadUseCase = this._container.getInstance(ThreadUseCase.name);
    const useCasePayload = request.params.id;
    const { thread } = await threadUseCase.getThread(useCasePayload);

    return h.response({
      status: "success",
      data: {
        thread,
      },
    });
  }
}

module.exports = ThreadHandler;
