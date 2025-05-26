const GetReplies = require("../GetReplies");

describe("a GetReplies entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      replies: [
        {
          id: "reply-123",
          username: "dicoding",
          date: "2025-05-23T01:01:01.001Z",
          deleted_at: "",
        },
      ],
    };

    expect(() => new GetReplies(payload)).toThrowError(
      "GET_REPLIES.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      replies: {},
    };

    const payload2 = {
      replies: [
        {
          id: "reply-123",
          username: 123,
          date: "2025-05-23T01:01:01.001Z",
          content: "Dummy content of reply",
          deleted_at: null,
        },
      ],
    };

    const payload3 = {
      replies: [
        {
          id: "reply-123",
          username: "dicoding",
          date: "2025-05-24T01:01:01.001Z",
          content: "Dummy content of reply",
          deleted_at: 123,
        },
      ],
    };

    expect(() => new GetReplies(payload)).toThrowError(
      "GET_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
    expect(() => new GetReplies(payload2)).toThrowError(
      "GET_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
    expect(() => new GetReplies(payload3)).toThrowError(
      "GET_REPLIES.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should remap replies data correctly", () => {
    const payload = {
      replies: [
        {
          id: "reply-123",
          username: "dicoding",
          date: "2025-05-23T01:01:01.001Z",
          content: "Dummy content of reply",
          deleted_at: null,
        },
      ],
    };

    const { replies } = new GetReplies(payload);

    const expectedReply = [
      {
        id: "reply-123",
        username: "dicoding",
        date: "2025-05-23T01:01:01.001Z",
        content: "Dummy content of reply",
      },
    ];

    expect(replies).toEqual(expectedReply);
  });

  it("should create GetReplies object correctly", () => {
    const payload = {
      replies: [
        {
          id: "reply-123",
          username: "dicoding",
          date: "2025-05-23T01:01:01.001Z",
          content: "Dummy content of reply",
          deleted_at: "2025-05-24T01:01:01.001Z",
        },
        {
          id: "reply-124",
          username: "sitoruszs",
          date: "2025-05-24T01:01:01.001Z",
          content: "Dummy content of reply",
          deleted_at: null,
        },
      ],
    };

    const expected = {
      replies: [
        {
          id: "reply-123",
          username: "dicoding",
          date: "2025-05-23T01:01:01.001Z",
          content: "**balasan telah dihapus**",
        },
        {
          id: "reply-124",
          username: "sitoruszs",
          date: "2025-05-24T01:01:01.001Z",
          content: "Dummy content of reply",
        },
      ],
    };

    const { replies } = new GetReplies(payload);

    expect(replies).toEqual(expected.replies);
  });
});
