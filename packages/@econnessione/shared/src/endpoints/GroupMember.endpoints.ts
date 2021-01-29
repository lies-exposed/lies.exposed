import * as t from "io-ts";
import { DateFromISOString, optionFromNullable } from "io-ts-types";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord";
import * as http from "../io/http";
import { GetListOutput, Output } from "../io/http/Common/Output";

const SingleGroupMemberOutput = Output(
  http.GroupMember.GroupMember,
  "GroupMember"
);
const ListGroupMemberOutput = GetListOutput(
  http.GroupMember.GroupMember,
  "ListGroupMember"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups-members",
  Input: {
    Query: undefined,
  },
  Output: ListGroupMemberOutput,
});

const CreateBody = t.strict(
  {
    group: t.string,
    actor: t.string,
    startDate: DateFromISOString,
    endDate: optionFromNullable(DateFromISOString),
    body: t.string,
  },
  "CreateGroupMemberBody"
);

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups-members",
  Input: {
    Query: undefined,
    Body: CreateBody,
  },
  Output: SingleGroupMemberOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupMemberOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Query: undefined,
    Params: { id: t.string },
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
    Query: undefined,
    Params: { id: t.string },
  },
  Output: SingleGroupMemberOutput,
});
