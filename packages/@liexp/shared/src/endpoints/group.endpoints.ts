import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { UUID } from "../io/http/Common/index.js";
import * as Group from "../io/http/Group.js";
import { GetListQuery } from "../io/http/Query/index.js";
import { ResourceEndpoints } from "./types.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      _sort: optionFromNullable(
        t.union([
          t.literal("id"),
          t.literal("name"),
          t.literal("createdAt"),
          t.literal("updatedAt"),
        ]),
      ),
      name: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(UUID)),
      members: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: Group.GroupListOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: t.union([t.type({ search: t.string }), Group.CreateGroupBody]),
  },
  Output: Group.GroupOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: UUID }),
  },
  Output: Group.GroupOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: UUID }),
    Body: Group.EditGroupBody,
  },
  Output: Group.GroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: UUID }),
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
