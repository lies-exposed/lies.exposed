import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { GetListQuery } from "@liexp/io/lib/http/Query/index.js";
import * as Page from "@liexp/io/lib/http/Page.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

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
      ids: Schema.Array(UUID),
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
