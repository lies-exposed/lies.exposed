import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type CreateScientificStudyBody } from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { createEvent } from "../../../../flows/events/createEvent.flow.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";

const baseEventSchema = Schema.Struct({
  date: Schema.String.annotations({
    description: "Event date in ISO format (YYYY-MM-DD)",
  }),
  draft: Schema.Boolean.annotations({
    description: "Whether the event is a draft (true) or published (false)",
  }),
  excerpt: Schema.NullOr(Schema.String).annotations({
    description: "Short description/excerpt of the study as plain text or null",
  }),
  body: Schema.NullOr(Schema.String).annotations({
    description: "Full body/description of the study as plain text or null",
  }),
  media: Schema.Array(UUID).annotations({
    description: "Array of media UUIDs to associate with the study",
  }),
  links: Schema.Array(UUID).annotations({
    description: "Array of link UUIDs to associate with the study",
  }),
  keywords: Schema.Array(UUID).annotations({
    description: "Array of keyword UUIDs to associate with the study",
  }),
});

export const CreateScientificStudyEventInputSchema = Schema.Struct({
  ...baseEventSchema.fields,
  title: Schema.String.annotations({
    description: "Title of the scientific study",
  }),
  url: UUID.annotations({
    description: "UUID of the link to the scientific study source",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description:
      "UUID of the image media for the study cover/image, or null if not available",
  }),
  authors: Schema.Array(UUID).annotations({
    description:
      "Array of existing actor UUIDs representing the study authors. IMPORTANT: Use findActors to search for each author by name first. If not found, create the actor using createActor, then use that UUID here. Do NOT create actors within this tool. It can be empty.",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description:
      "UUID of an existing group representing the publisher/institution, or null if not available. IMPORTANT: Use findGroups to search for the publisher first. If not found, create using createGroup, then use that UUID here.",
  }),
});
export type CreateScientificStudyEventInputSchema =
  typeof CreateScientificStudyEventInputSchema.Type;

/**
 * Create a scientific study event with existing actor and group references.
 *
 * IMPORTANT: This tool does NOT create actors or groups. It only links existing entities.
 * Workflow:
 * 1. For each author: Use findActors to search by name
 * 2. If author not found: Create with createActor, then use the returned UUID
 * 3. For publisher: Use findGroups to search by name
 * 4. If publisher not found: Create with createGroup, then use the returned UUID
 * 5. Call this tool with all the UUIDs collected from steps 1-4
 */
export const createScientificStudyEventToolTask = ({
  date,
  draft,
  excerpt,
  body,
  media,
  links,
  keywords,
  title,
  url,
  image,
  authors,
  publisher,
}: CreateScientificStudyEventInputSchema) => {
  const eventBody: CreateScientificStudyBody = {
    type: SCIENTIFIC_STUDY.literals[0],
    date: new Date(date),
    draft,
    excerpt: excerpt ? toInitialValue(excerpt) : undefined,
    body: body ? toInitialValue(body) : undefined,
    media: media ?? [],
    links: links ?? [],
    keywords: keywords ?? [],
    payload: {
      title,
      url,
      image: image ?? undefined,
      authors,
      publisher: publisher ?? undefined,
    },
  };

  return pipe(
    createEvent(eventBody),
    LoggerService.RTE.debug("Created scientific study event %O"),
    fp.RTE.map((event) => ({
      content: [
        {
          text: formatEventToMarkdown(event),
          type: "text" as const,
          uri: `event://${event.id}`,
        },
      ],
    })),
  );
};
