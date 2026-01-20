import { nonEmptyRecordFromType } from "@liexp/io/lib/Common/NonEmptyRecord.js";
import { BlockNoteDocument } from "@liexp/io/lib/http/Common/BlockNoteDocument.js";
import { OptionFromNullishToNull } from "@liexp/io/lib/http/Common/OptionFromNullishToNull.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { CreateGroupMember } from "@liexp/io/lib/http/GroupMember.js";
import { GetListQuery } from "@liexp/io/lib/http/Query/index.js";
import * as http from "@liexp/io/lib/http/index.js";
import { Endpoint, ResourceEndpoints } from "@ts-endpoint/core";
import { Schema } from "effect";

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
    Params: Schema.Struct({ id: UUID }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Edit = Endpoint({
  Method: "PUT",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
    Body: nonEmptyRecordFromType({
      group: OptionFromNullishToNull(Schema.String),
      actor: OptionFromNullishToNull(Schema.String),
      startDate: OptionFromNullishToNull(Schema.Date),
      endDate: OptionFromNullishToNull(Schema.Date),
      body: OptionFromNullishToNull(BlockNoteDocument),
    }),
  },
  Output: http.GroupMember.SingleGroupMemberOutput,
});

export const Delete = Endpoint({
  Method: "DELETE",
  getPath: ({ id }) => `/groups-members/${id}`,
  Input: {
    Params: Schema.Struct({ id: UUID }),
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
