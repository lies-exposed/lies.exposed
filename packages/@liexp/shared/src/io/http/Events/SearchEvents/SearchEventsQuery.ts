import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";
import { UUID } from "io-ts-types/lib/UUID.js";
import { optionFromUndefined } from "../../../Common/optionFromUndefined.js";
import { ACTORS } from "../../Actor.js";
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

export const GetSearchEventsQuery = t.strict(
  {
    ...GetListQuery.props,
    ...GetListQueryDateRange.props,
    ...GetListQueryActors.props,
    ...GetListQueryGroups.props,
    ...GetListQueryKeywords.props,
    ...GetListQueryLinks.props,
    ...GetListQueryMedia.props,
    ...GetListQueryLocations.props,
    ids: optionFromUndefined(t.array(UUID)),
    eventType: optionFromUndefined(t.array(EventType)),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    exclude: optionFromUndefined(t.array(UUID)),
    withDeleted: optionFromUndefined(BooleanFromString),
    withDrafts: optionFromUndefined(BooleanFromString),
    draft: optionFromUndefined(BooleanFromString),
    emptyKeywords: optionFromUndefined(BooleanFromString),
    emptyActors: optionFromUndefined(BooleanFromString),
    emptyGroups: optionFromUndefined(BooleanFromString),
    emptyMedia: optionFromUndefined(BooleanFromString),
    emptyLinks: optionFromUndefined(BooleanFromString),
    spCount: optionFromUndefined(NumberFromString),
    onlyUnshared: optionFromUndefined(BooleanFromString),
    relations: optionFromUndefined(
      t.array(t.union([ACTORS, GROUPS, MEDIA, KEYWORDS])),
    ),
  },
  "GetEventsQueryFilter",
);

export type GetSearchEventsQuery = t.TypeOf<typeof GetSearchEventsQuery>;
export type GetSearchEventsQueryInput = t.OutputOf<typeof GetSearchEventsQuery>;
