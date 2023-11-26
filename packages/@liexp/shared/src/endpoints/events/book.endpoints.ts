import { propsOmit } from "@liexp/core/lib/io/utils";
import * as t from "io-ts";
import { UUID } from "io-ts-types/UUID";
import { Endpoint } from "ts-endpoint";
import { Events } from "../../io/http";
import { ListOutput, Output } from "../../io/http/Common/Output";
import { ResourceEndpoints } from "../types";

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
