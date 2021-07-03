import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
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
      ids: optionFromNullable(t.array(t.string)),
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
    members: t.array(t.string),
    body: t.string,
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

const { members, ...editBodyProps } = CreateGroupBody.type.props;
export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups/${id}`,
  Input: {
    Query: undefined,
    Params: t.type({ id: t.string }),
    Body: nonEmptyRecordFromType({
      ...editBodyProps,
      avatar: t.string,
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
});
