import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { UUID } from "../io/http/Common";
import { ListOutput, Output } from "../io/http/Common/Output";
import * as Group from "../io/http/Group";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleGroupOutput = Output(Group.Group, "Group");
const ListGroupOutput = ListOutput(Group.Group, "ListGroup");

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
        ])
      ),
      name: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(UUID)),
      members: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: ListGroupOutput,
});


export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: Group.CreateGroupBody,
  },
  Output: SingleGroupOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
    Body: Group.EditGroupBody,
  },
  Output: SingleGroupOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupOutput,
});

export const groups = ResourceEndpoints({
  Get,
  Edit,
  List,
  Create,
  Delete,
  Custom: {},
});
