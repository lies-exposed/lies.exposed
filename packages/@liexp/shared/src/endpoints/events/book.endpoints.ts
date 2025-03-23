import { Schema } from "effect";
import { Endpoint, ResourceEndpoints } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { UUID } from "../../io/http/Common/UUID.js";
import { Events } from "../../io/http/index.js";

const SingleBookOutput = Output(Events.Book.Book).annotations({
  title: "Book",
});
const ListBooksOutput = ListOutput(Events.Book.Book, "Books");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/books",
  Input: {
    Query: Events.Book.BookListQuery,
  },
  Output: ListBooksOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleBookOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/books",
  Input: {
    Query: undefined,
    Body: Events.Book.CreateBookBody.omit("type").annotations({
      title: "CreateBookBody",
    }),
  },
  Output: SingleBookOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Events.Book.CreateBookBody.omit("type").annotations({
      title: "CreateBookBody",
    }),
  },
  Output: SingleBookOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: SingleBookOutput,
});

export const books = ResourceEndpoints({
  Create,
  Edit,
  List,
  Get,
  Delete,
  Custom: {},
});
