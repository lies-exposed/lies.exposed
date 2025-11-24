import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  EditEventBody,
  EditEventTypeAndPayload,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { Schema } from "effect";
import type * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { editEvent } from "../../../../flows/events/editEvent.flow.js";
import {
  type ControllerError,
  toControllerError,
} from "../../../../io/ControllerError.js";
import { baseEditEventSchema, wrapEventFlowTask } from "./eventHelpers.js";

export const EditEventInputSchema = Schema.Struct({
  id: UUID.annotations({ description: "UUID of the event to edit" }),
  ...baseEditEventSchema.fields,
  // payload: discriminated union where `type` lives inside each member (matches shared EditEventPlainBody)
  payload: EditEventTypeAndPayload.annotations({
    description:
      "Type-discriminated edit body. Each member includes its `type` and `payload` fields (see EditEventPlainBody union).",
  }),
});

export type EditEventInputSchema = typeof EditEventInputSchema.Type;

export const editEventToolTask = (input: EditEventInputSchema) => {
  return pipe(
    liftEventBodyPayloadWithOptions(input),
    fp.RTE.fromEither,
    fp.RTE.chain((body) => editEvent(input.id, body)),
    (flow) => wrapEventFlowTask(flow, "Edited event"),
  );
};

const liftEventBodyPayloadWithOptions = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  payload,
}: EditEventInputSchema): E.Either<ControllerError, EditEventBody> => {
  // const baseFields = transformBaseEditEventFields({
  //   date,
  //   draft,
  //   excerpt,
  //   body,
  //   media,
  //   links,
  //   keywords,
  // });

  const unknownBody = {
    date,
    draft,
    excerpt,
    body,
    media,
    links,
    keywords,
    ...payload,
  };

  return pipe(
    Schema.decodeUnknownEither(EditEventBody)(unknownBody),
    fp.E.mapLeft(toControllerError),
  );
};
