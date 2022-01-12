import * as t from "io-ts";
import { DateFromISOString, UUID } from "io-ts-types";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleGroupOutput = Output(http.Group.Group, "Group");
const ListGroupOutput = ListOutput(http.Group.Group, "ListGroup");

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      name: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(t.string)),
      members: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: ListGroupOutput,
});

const CreateGroupBody = t.strict(
  {
    name: t.string,
    color: t.string,
    kind: http.Group.GroupKind,
    avatar: t.string,
    excerpt: t.union([t.UnknownRecord, t.undefined]),
    body: t.UnknownRecord,
    members: t.array(
      t.strict(
        {
          actor: UUID,
          body: t.UnknownRecord,
          startDate: DateFromISOString,
          endDate: optionFromNullable(DateFromISOString),
        },
        "CreateGroupMember"
      )
    ),
  },
  "CreateGroupBody"
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups",
  Input: {
    Query: undefined,
    Body: CreateGroupBody,
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
    Body: t.strict({
      ...CreateGroupBody.type.props,
      members: t.array(
        t.union([
          UUID,
          t.strict(
            {
              actor: UUID,
              body: t.UnknownRecord,
              startDate: DateFromISOString,
              endDate: optionFromNullable(DateFromISOString),
            },
            "CreateGroupMember"
          ),
        ])
      ),
    }),
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
