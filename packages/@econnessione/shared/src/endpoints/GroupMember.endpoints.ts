import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import * as http from "../io/http";
import { ListOutput, Output } from "../io/http/Common/Output";
import { CreateGroupMember } from "../io/http/GroupMember";
import { GetListQuery } from "../io/http/Query";
import { ResourceEndpoints } from "./types";

const SingleGroupMemberOutput = Output(
  http.GroupMember.GroupMember,
  "GroupMember"
);
const ListGroupMemberOutput = ListOutput(
  http.GroupMember.GroupMember,
  "ListGroupMember"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups-members",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      group: optionFromNullable(t.string),
      search: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: ListGroupMemberOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups-members",
  Input: {
    Query: undefined,
    Body: CreateGroupMember,
  },
  Output: SingleGroupMemberOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupMemberOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
    Body: nonEmptyRecordFromType({
      group: optionFromNullable(t.string),
      actor: optionFromNullable(t.string),
      startDate: optionFromNullable(DateFromISOString),
      endDate: optionFromNullable(DateFromISOString),
      body: optionFromNullable(t.string),
    }),
  },
  Output: SingleGroupMemberOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: SingleGroupMemberOutput,
});

export const groupsMembers = ResourceEndpoints({
  Create,
  Get,
  List,
  Edit,
  Delete,
});
