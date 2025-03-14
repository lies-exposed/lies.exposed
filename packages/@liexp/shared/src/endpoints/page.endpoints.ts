import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { UUID } from "../io/http/Common/UUID.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { Page } from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

const ListPages = Endpoint({
  Method: "GET",
  getPath: () => "/pages",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      path: OptionFromNullishToNull(Schema.String),
    }),
  },
  Output: Schema.Struct({ data: Schema.Array(Page.Page) }),
});

const GetPage = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Struct({ data: Page.Page }),
});

const CreatePage = Endpoint({
  Method: "POST",
  getPath: () => `/pages`,
  Input: {
    Body: Page.CreatePage,
  },
  Output: Schema.Struct({ data: Page.Page }),
});

const EditPage = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: Page.EditPage,
  },
  Output: Schema.Struct({ data: Page.Page }),
});

const DeletePage = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/pages/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Schema.Struct({ data: Page.Page }),
});

const DeleteManyPage = Endpoint({
  Method: "DELETE",
  getPath: () => `/pages`,
  Input: {
    Query: Schema.Struct({
      ids: OptionFromNullishToNull(Schema.Array(Schema.String)),
    }),
  },
  Output: Schema.Struct({ data: Schema.Array(Schema.String) }),
});

export const pages = ResourceEndpoints({
  Create: CreatePage,
  Get: GetPage,
  List: ListPages,
  Edit: EditPage,
  Delete: DeletePage,
  Custom: {
    DeleteMany: DeleteManyPage,
  },
});
