import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { Endpoint } from "ts-endpoint";
import { ListOutput, Output } from "../../io/http/Common/Output.js";
import { Events } from "../../io/http/index.js";
import { ResourceEndpoints } from "../types.js";

const SingleBookOutput = Output(Events.Book.Book, "Book");
const ListBooksOutput = ListOutput(Events.Book.Book, "Books");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/books",
  Input: {
    Query: Events.Book.BookListQuery.type,
  },
  Output: ListBooksOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: SingleBookOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/books",
  Input: {
    Query: undefined,
    Body: t.strict(
      propsOmit(Events.Book.CreateBookBody, ["type"]),
      "CreateBookBody",
    ),
  },
  Output: SingleBookOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: t.strict(
      propsOmit(Events.Book.CreateBookBody, ["type"]),
      "CreateBookBody",
    ),
  },
  Output: SingleBookOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/books/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
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
