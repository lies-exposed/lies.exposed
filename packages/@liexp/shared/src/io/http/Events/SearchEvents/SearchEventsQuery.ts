import { Schema } from "effect";
import { ACTORS } from "../../Actor.js";
import { OptionFromNullishToNull } from "../../Common/OptionFromNullishToNull.js";
import { UUID } from "../../Common/UUID.js";
import { GROUPS } from "../../Group.js";
import { KEYWORDS } from "../../Keyword.js";
import { MEDIA } from "../../Media/Media.js";
import {
  GetListQuery,
  GetListQueryDateRange,
  GetListQueryActors,
  GetListQueryGroups,
  GetListQueryKeywords,
  GetListQueryLinks,
  GetListQueryMedia,
  GetListQueryLocations,
} from "../../Query/index.js";
import { EventType } from "../EventType.js";

export const GetSearchEventsQuery = Schema.Struct({
  ...GetListQuery.fields,
  ...GetListQueryDateRange.fields,
  ...GetListQueryActors.fields,
  ...GetListQueryGroups.fields,
  ...GetListQueryKeywords.fields,
  ...GetListQueryLinks.fields,
  ...GetListQueryMedia.fields,
  ...GetListQueryLocations.fields,
  ids: OptionFromNullishToNull(Schema.Array(UUID)),
  eventType: OptionFromNullishToNull(Schema.Array(EventType)),
  groupsMembers: OptionFromNullishToNull(Schema.Array(Schema.String)),
  exclude: OptionFromNullishToNull(Schema.Array(UUID)),
  withDeleted: OptionFromNullishToNull(Schema.BooleanFromString),
  withDrafts: OptionFromNullishToNull(Schema.BooleanFromString),
  draft: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyKeywords: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyActors: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyGroups: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyMedia: OptionFromNullishToNull(Schema.BooleanFromString),
  emptyLinks: OptionFromNullishToNull(Schema.BooleanFromString),
  spCount: OptionFromNullishToNull(Schema.NumberFromString),
  onlyUnshared: OptionFromNullishToNull(Schema.BooleanFromString),
  relations: OptionFromNullishToNull(
    Schema.Array(Schema.Union(ACTORS, GROUPS, MEDIA, KEYWORDS)),
  ),
}).annotations({
  title: "GetEventsQueryFilter",
});

export type GetSearchEventsQuery = typeof GetSearchEventsQuery.Type;
export type GetSearchEventsQueryInput = typeof GetSearchEventsQuery.Encoded;
