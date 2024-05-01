import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "../io/http/Common/BlockNoteDocument.js";
import { CreateGroupMember } from "../io/http/GroupMember.js";
import { GetListQuery } from "../io/http/Query/index.js";
import * as http from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups-members",
  Input: {
    Query: t.type({
      ...GetListQuery.props,
      group: optionFromNullable(t.string),
      actor: optionFromNullable(t.string),
      ids: optionFromNullable(t.array(t.string)),
    }),
  },
  Output: http.GroupMember.ListGroupMemberOutput,
});

export const Create = Endpoint({
  Method: "POST",
  getPath: () => "/groups-members",
  Input: {
    Query: undefined,
    Body: CreateGroupMember,
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Get = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
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
      body: optionFromNullable(BlockNoteDocument),
    }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const groupsMembers = ResourceEndpoints({
  Create,
  Get,
  List,
  Edit,
  Delete,
  Custom: {},
});
