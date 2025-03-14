import { Schema } from "effect";
import { Endpoint } from "ts-endpoint";
import { nonEmptyRecordFromType } from "../io/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "../io/http/Common/BlockNoteDocument.js";
import { CreateGroupMember } from "../io/http/GroupMember.js";
import { GetListQuery } from "../io/http/Query/index.js";
import * as http from "../io/http/index.js";
import { ResourceEndpoints } from "./types.js";
import { OptionFromNullishToNull } from '../io/http/Common/OptionFromNullishToNull.js';

export const List = Endpoint({
  Method: "GET",
  getPath: () => "/groups-members",
  Input: {
    Query: Schema.Struct({
      ...GetListQuery.fields,
      group: OptionFromNullishToNull(Schema.String),
      actor: OptionFromNullishToNull(Schema.String),
      ids: OptionFromNullishToNull(Schema.Array(Schema.String)),
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
    Params: Schema.Struct({ id: Schema.String }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
    Body: nonEmptyRecordFromType({
      group: OptionFromNullishToNull(Schema.String),
      actor: OptionFromNullishToNull(Schema.String),
      startDate: OptionFromNullishToNull(Schema.DateFromString),
      endDate: OptionFromNullishToNull(Schema.DateFromString),
      body: OptionFromNullishToNull(BlockNoteDocument),
    }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: Schema.Struct({ id: Schema.String }),
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
