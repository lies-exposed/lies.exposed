import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateDeathBody } from "@liexp/shared/lib/io/http/Events/Death.js";
import { DEATH } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { pipe } from "fp-ts/lib/function.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import {
  baseEventSchema,
  transformBaseCreateEventFields,
  wrapEventFlowTask,
} from "./eventHelpers.js";

export const CreateDeathEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  victim: UUID.annotations({
    description: "UUID of the victim actor who died",
  }),
  location: Schema.NullOr(UUID).annotations({
    description: "UUID of the location where the death occurred or null",
  }),
});
export type CreateDeathEventInputSchema =
  typeof CreateDeathEventInputSchema.Type;

export const createDeathEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  victim,
  location,
}: CreateDeathEventInputSchema) => {
  const eventBody: CreateDeathBody = {
    ...transformBaseCreateEventFields({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
    }),
    type: DEATH.literals[0],
    payload: {
      victim,
      location: O.fromNullable(location),
    },
  };

  return pipe(createEvent(eventBody), (flow) =>
    wrapEventFlowTask(flow, "Created death"),
  );
};
