import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types";
import { Endpoint } from "ts-endpoint";
import { Page } from "../io/http";
import { GetListQuery } from "../io/http/Query";

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
    Params: t.type({ id: t.string }),
  },
  Output: t.strict({ data: Page.Page }),
});

export const CreatePage = Endpoint({
  Method: "POST",
  getPath: () => `/pages`,
  Input: {
    Body: t.strict({
      title: t.string,
      path: t.string,
      body: t.string,
    }),
  },
  Output: t.strict({ data: Page.Page }),
});

export const EditPage = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: t.strict({
      title: t.string,
      path: t.string,
      body: t.string,
    }),
  },
  Output: t.strict({ data: Page.Page }),
});

export const DeletePage = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
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
