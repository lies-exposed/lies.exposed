import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/DateFromISOString";
import { UUID } from "io-ts-types/UUID";
import { optionFromUndefined } from "../../Common/optionFromUndefined.js";
import { BlockNoteDocument } from "../Common/BlockNoteDocument.js";
import { CreateLink } from "../Link.js";
import { MediaType } from "../Media.js";

export const EditEventBody = t.strict(
  {
    title: optionFromUndefined(t.string),
    media: optionFromUndefined(
      t.array(
        t.union([
          UUID,
          t.strict({
            location: t.string,
            description: t.string,
            thumbnail: t.union([t.string, t.undefined]),
            type: MediaType,
          }),
        ]),
      ),
    ),
    links: optionFromUndefined(t.array(t.union([UUID, CreateLink]))),
    location: optionFromUndefined(UUID),
    actors: optionFromUndefined(t.array(t.string)),
    groups: optionFromUndefined(t.array(t.string)),
    groupsMembers: optionFromUndefined(t.array(t.string)),
    keywords: optionFromUndefined(t.array(t.string)),
    startDate: optionFromUndefined(DateFromISOString),
    endDate: optionFromUndefined(DateFromISOString),
    body: optionFromUndefined(BlockNoteDocument),
    excerpt: optionFromUndefined(BlockNoteDocument),
  },
  "EditEventPayload",
);

export type EditEventBody = t.TypeOf<typeof EditEventBody>;
