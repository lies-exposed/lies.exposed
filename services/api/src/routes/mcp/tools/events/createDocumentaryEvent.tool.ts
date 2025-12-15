import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateDocumentaryBody } from "@liexp/shared/lib/io/http/Events/Documentary.js";
import { DOCUMENTARY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import {
  baseEventSchema,
  transformBaseCreateEventFields,
  wrapEventFlowTask,
} from "./eventHelpers.js";

export const CreateDocumentaryEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title of the documentary",
  }),
  mediaId: UUID.annotations({
    description: "UUID of the main media for the documentary (video)",
  }),
  website: Schema.NullOr(UUID).annotations({
    description: "UUID of the website link for the documentary or null",
  }),
  authorActors: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs who created/directed the documentary",
  }),
  authorGroups: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs who produced the documentary",
  }),
  subjectActors: Schema.Array(UUID).annotations({
    description: "Array of actor UUIDs who are subjects of the documentary",
  }),
  subjectGroups: Schema.Array(UUID).annotations({
    description: "Array of group UUIDs who are subjects of the documentary",
  }),
});
export type CreateDocumentaryEventInputSchema =
  typeof CreateDocumentaryEventInputSchema.Type;

export const createDocumentaryEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  mediaId,
  website,
  authorActors,
  authorGroups,
  subjectActors,
  subjectGroups,
}: CreateDocumentaryEventInputSchema) => {
  const eventBody: CreateDocumentaryBody = {
    ...transformBaseCreateEventFields({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
    }),
    type: DOCUMENTARY.literals[0],
    payload: {
      title,
      media: mediaId,
      website: website ?? undefined,
      authors: {
        actors: (authorActors ?? []) as any,
        groups: (authorGroups ?? []) as any,
      },
      subjects: {
        actors: (subjectActors ?? []) as any,
        groups: (subjectGroups ?? []) as any,
      },
    },
  };

  return pipe(createEvent(eventBody), (flow) =>
    wrapEventFlowTask(flow, "Created documentary"),
  );
};
