import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { buildEvent } from "@liexp/shared/lib/helpers/event/event.js";
import { type EventCommonProps } from "@liexp/shared/lib/helpers/event/getCommonProps.helper.js";
import {
  type Event,
  EventMap,
} from "@liexp/shared/lib/io/http/Events/index.js";
import { type CreateEventFromURLTypeData } from "@liexp/shared/lib/io/http/Queue/event/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { JSONSchema, type Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { loadDocs } from "../common/loadDocs.flow.js";
import { getEventFromJsonPrompt } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you extract an event JSON object from the given text? Return the response in JSON format.";

export const createEventFromURLFlow: JobProcessRTE<
  CreateEventFromURLTypeData,
  Event
> = (job) => {
  const eventSchema = EventMap[job.data.type];

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        JSONSchema.make(eventSchema as Schema.Schema<unknown>),
        fp.RTE.right,
        LoggerService.RTE.debug((s) => [
          `Event JSON Schema ${JSON.stringify(s, null, 2)}`,
        ]),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getEventFromJsonPrompt(job.type));
    }),
    fp.RTE.bindW("event", ({ docs, prompt, jsonSchema }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          EventCommonProps & Events.EventRelationIds
        >({
          message: `${prompt({
            vars: {
              type: job.data.type,
              jsonSchema: JSON.stringify(jsonSchema),
              context: docs.map((d) => d.pageContent).join("\n"),
              question: job.question ?? defaultQuestion,
            },
          })}\n\n${job.question ?? defaultQuestion}`,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.bind(
      "links",
      () => (ctx) =>
        pipe(
          ctx.api.Link.List({
            Query: {
              url: job.data.url,
              _end: "1",
            },
          }),
          fp.TE.map((links) => links.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    LoggerService.RTE.debug("`createEventFromURLFlow` result: %O"),
    fp.RTE.chainEitherK(({ event, links }) => {
      // Ensure we have at least one link - this is critical for buildEvent
      if (links.length === 0) {
        return fp.E.left(
          toAIBotError(
            new Error(
              `No link found in database for URL: ${job.data.url}. Please create the link first before creating the event.`,
            ),
          ),
        );
      }

      // Determine the date with fallbacks:
      // 1. AI-provided date (if non-empty array or single value)
      // 2. Job's date from queue data
      // 3. Link's publish date
      // 4. Current date as last resort
      const aiDate = Array.isArray(event.date)
        ? event.date.length > 0
          ? event.date
          : undefined
        : event.date;
      const fallbackDate = job.data.date ?? links[0]?.publishDate ?? new Date();
      const eventDate = aiDate ?? [fallbackDate];

      return pipe(
        buildEvent(job.data.type, {
          ...event,
          // Provide defaults for relation IDs that AI might not return
          actors: event.actors ?? [],
          groups: event.groups ?? [],
          groupsMembers: event.groupsMembers ?? [],
          keywords: event.keywords ?? [],
          media: event.media ?? [],
          areas: event.areas ?? [],
          // Use computed date with fallbacks
          date: Array.isArray(eventDate) ? eventDate : [eventDate],
          links: links.map((l) => l.id),
        }),
        fp.E.fromOption(() =>
          toAIBotError(
            new Error(
              `Can't create ${job.data.type} event from response. Missing required fields: ${
                links.length === 0 ? "links" : event.date ? "" : "date"
              }`,
            ),
          ),
        ),
        fp.E.map(
          (ev) =>
            ({
              ...ev,
              id: job.id,
              excerpt: toInitialValue(event.excerpt),
              body: null,
              links: links.map((l) => l.id),
              keywords: [],
              media: [],
              socialPosts: [],
              createdAt: new Date(),
              updatedAt: new Date(),
              deletedAt: undefined,
              draft: true,
            }) as Event,
        ),
      );
    }),
  );
};
