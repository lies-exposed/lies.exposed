import { Schema } from "effect";
import { Endpoint, ResourceEndpoints } from "ts-endpoint";
import { OptionFromNullishToNull } from "../io/http/Common/OptionFromNullishToNull.js";
import { UUID } from "../io/http/Common/index.js";
import * as Group from "../io/http/Group.js";
import { GetListQuery } from "../io/http/Query/index.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      _sort: OptionFromNullishToNull(
        Schema.Union(
          Schema.Literal("id"),
          Schema.Literal("name"),
          Schema.Literal("createdAt"),
          Schema.Literal("updatedAt"),
        ),
      ),
      name: OptionFromNullishToNull(Schema.String),
      username: OptionFromNullishToNull(Schema.String),
      ids: OptionFromNullishToNull(Schema.Array(UUID)),
      members: OptionFromNullishToNull(Schema.Array(Schema.String)),
    }),
  },
  Output: Group.GroupListOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: Schema.Union(
      Schema.Struct({ search: Schema.String }),
      Group.CreateGroupBody,
    ),
  },
  Output: Group.GroupOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Group.GroupOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
    Body: Group.EditGroupBody,
  },
  Output: Group.GroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: Schema.Struct({ id: UUID }),
  },
  Output: Group.GroupOutput,
});

export const groups = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {},
});
