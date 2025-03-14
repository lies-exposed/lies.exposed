import { Schema } from "effect";
import { BlockNoteDocument } from "../Common/BlockNoteDocument.js";
import { UUID } from "../Common/UUID.js";
import { CreateLink } from "../Link.js";
import { MediaType } from "../Media/index.js";
import { OptionFromNullishToNull } from '../Common/OptionFromNullishToNull.js';

export const EditEventBody = Schema.Struct({
  title: OptionFromNullishToNull(Schema.String),
  media: OptionFromNullishToNull(
    Schema.Array(
      Schema.Union(
        UUID,
        Schema.Struct({
          location: Schema.String,
          description: Schema.String,
          thumbnail: Schema.Union(Schema.String, Schema.Undefined),
          type: MediaType,
        }),
      ),
    ),
  ),
  links: OptionFromNullishToNull(Schema.Array(Schema.Union(UUID, CreateLink))),
  location: OptionFromNullishToNull(UUID),
  actors: OptionFromNullishToNull(Schema.Array(Schema.String)),
  groups: OptionFromNullishToNull(Schema.Array(Schema.String)),
  groupsMembers: OptionFromNullishToNull(Schema.Array(Schema.String)),
  keywords: OptionFromNullishToNull(Schema.Array(Schema.String)),
  startDate: OptionFromNullishToNull(Schema.DateFromString),
  endDate: OptionFromNullishToNull(Schema.DateFromString),
  body: OptionFromNullishToNull(BlockNoteDocument),
  excerpt: OptionFromNullishToNull(BlockNoteDocument),
}).annotations({ title: "EditEventBody" });

export type EditEventBody = typeof EditEventBody.Type;
