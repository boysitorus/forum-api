const GetComments = require("../GetComments");

describe("a GetComments entities", () => {
  it("should throw error when payload did not contain needed property", () => {
    const payload = {
      comments: [
        {
          id: "comment-123",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "Dummy content of comment",
        },
      ],
    };

    expect(() => new GetComments(payload)).toThrowError(
      "GET_COMMENTS.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error when payload did not meet data type specification", () => {
    const payload = {
      comments: {},
    };

    const payload2 = {
      comments: [
        {
          id: "comment-123",
          username: 1234,
          date: "2025-05-23 01:01:01.001Z",
          content: "Dummy content of comment",
          deletedAt: null,
        },
      ],
    };

    const payload3 = {
      comments: [
        {
          id: "comment-123",
          username: "dicoding-123",
          date: "2025-05-23 01:01:01.001Z",
          content: "Dummy content of comment",
          deletedAt: 123,
        },
      ],
    };

    expect(() => new GetComments(payload)).toThrowError(
      "GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
    expect(() => new GetComments(payload2)).toThrowError(
      "GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
    expect(() => new GetComments(payload3)).toThrowError(
      "GET_COMMENTS.NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  it("should remap comments data correctly", () => {
    const payload = {
      comments: [
        {
          id: "comment-123",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "Dummy content of comment",
          deletedAt: null,
        },
        {
          id: "comment-124",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "Dummy content of comment",
          deletedAt: "2025-05-24 01:01:01.001Z",
        },
      ],
    };

    const { comments } = new GetComments(payload);

    const expectedComment = [
      {
        id: "comment-123",
        username: "dicoding",
        date: "2025-05-23 01:01:01.001Z",
        content: "Dummy content of comment",
      },
      {
        id: "comment-124",
        username: "dicoding",
        date: "2025-05-23 01:01:01.001Z",
        content: "**komentar telah dihapus**",
      },
    ];

    expect(comments).toEqual(expectedComment);
  });

  it("should create GetComments object correctly", () => {
    const payload = {
      comments: [
        {
          id: "comment-123",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "some reply a comment",
          deletedAt: null,
        },
        {
          id: "comment-124",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "some reply a comment",
          deletedAt: "2025-05-24 01:01:01.001Z",
        },
      ],
    };

    const expected = {
      comments: [
        {
          id: "comment-123",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "some reply a comment",
        },
        {
          id: "comment-124",
          username: "dicoding",
          date: "2025-05-23 01:01:01.001Z",
          content: "**komentar telah dihapus**",
        },
      ],
    };

    const { comments } = new GetComments(payload);

    expect(comments).toEqual(expected.comments);
  });
});
