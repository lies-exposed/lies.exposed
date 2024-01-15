import * as t from "io-ts";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { GetListQuery } from "../io/http/Query/index.js";
import { Page } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

export const ListPages = Endpoint({
  Method: "GET",
  getPath: () => "/pages",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      path: optionFromNullable(t.string),
    }),
  },
  Output: t.strict({ data: t.array(Page.Page) }),
});

export const GetPage = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.strict({ data: Page.Page }),
});

export const CreatePage = Endpoint({
  Method: "POST",
  getPath: () => `/pages`,
  Input: {
    Body: Page.CreatePage,
  },
  Output: t.strict({ data: Page.Page }),
});

export const EditPage = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
    Body: Page.EditPage,
  },
  Output: t.strict({ data: Page.Page }),
});

export const DeletePage = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: t.type({ id: UUID }),
  },
  Output: t.strict({ data: Page.Page }),
});

export const DeleteManyPage = Endpoint({
  Method: "DELETE",
  getPath: () => `/pages`,
  Input: {
    Query: t.partial({ ids: t.array(t.string) }),
  },
  Output: t.strict({ data: t.array(t.string) }),
});

export const pages = ResourceEndpoints({
  Create: CreatePage,
  Get: GetPage,
  List: ListPages,
  Edit: EditPage,
  Delete: DeletePage,
  Custom: {},
});
