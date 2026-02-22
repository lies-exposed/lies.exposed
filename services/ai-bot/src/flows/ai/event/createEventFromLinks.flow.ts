import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import { EventMap } from "@liexp/io/lib/http/Events/index.js";
import { APPROVED, type Link } from "@liexp/io/lib/http/Link.js";
import { type CreateEventFromLinksTypeData } from "@liexp/io/lib/http/Queue/event/index.js";
import {
  buildEvent,
  type EventCommonProps,
} from "@liexp/shared/lib/helpers/event/event.helper.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { JSONSchema, type Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { getEventFromLinksPrompt } from "../prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion = `
Can you synthesize an event from the provided multiple link sources?
Use the api.lies.exposed proper tools to fetch links and create the new resources.

When creating the event you have also to link it with the given linkIds in the links relations to
`;

/**
 * Removes undefined values from an object to prevent JSON serialization from converting them to null
 * This is critical for queue job results that will be deserialized by the worker
 */
const removeUndefinedFromPayload = <T extends Record<string, unknown>>(
  payload: T,
): T =>
  pipe(
    payload,
    fp.Rec.filter((value) => value !== undefined),
  ) as T;

/**
 * Builds a combined context string from multiple links.
 * Each link's information is formatted with its URL, title, and description.
 */
const buildLinksContext = (links: Link[]): string => {
  return links
    .map((link, index) => {
      const parts = [
        `=== Source ${index + 1} ===`,
        `URL: ${link.url}`,
        link.title ? `Title: ${link.title}` : null,
        link.description ? `Description: ${link.description}` : null,
        link.publishDate
          ? `Publish Date: ${new Date(link.publishDate).toISOString().split("T")[0]}`
          : null,
      ].filter(Boolean);
      return parts.join("\n");
    })
    .join("\n\n");
};

export const createEventFromLinksFlow: JobProcessRTE<
  CreateEventFromLinksTypeData,
  Event
> = (job) => {
  const eventSchema = EventMap[job.data.type];

  return pipe(
    fp.RTE.Do,
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
    fp.RTE.bindW(
      "links",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Link.List({
            Query: {
              ids: job.data.linkIds,
              _end: String(job.data.linkIds.length),
            },
          }),
          fp.TE.map((response) => [...response.data] as Link[]),
          fp.TE.chain((links) => {
            if (links.length === 0) {
              return fp.TE.left(
                toAIBotError(
                  new Error(
                    `No links found for the provided IDs: ${job.data.linkIds.join(", ")}. Please verify the link IDs exist.`,
                  ),
                ),
              );
            }
            return fp.TE.right(links);
          }),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.bind("prompt", () => {
      if (job.prompt) {
        return fp.RTE.right(() => job.prompt!);
      }
      return fp.RTE.right(getEventFromLinksPrompt());
    }),
    fp.RTE.bindW("event", ({ prompt, links, jsonSchema }) =>
      pipe(
        AgentChatService.getStructuredOutput<
          ClientContext,
          EventCommonProps & Events.EventRelationIds
        >({
          message: `${prompt({
            vars: {
              type: job.data.type,
              jsonSchema: JSON.stringify(jsonSchema),
              context: buildLinksContext(links),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    LoggerService.RTE.debug("`createEventFromLinksFlow` result: %O"),
    fp.RTE.chainEitherK(({ event, links }) => {
      // Determine the date with fallbacks:
      // 1. AI-provided date (if non-empty array or single value)
      // 2. Job's date from queue data
      // 3. Earliest publish date from all links
      // 4. Current date as last resort
      const aiDate = Array.isArray(event.date)
        ? event.date.length > 0
          ? event.date
          : undefined
        : event.date;

      // Find the earliest publish date from all links as fallback
      const earliestLinkDate = links
        .filter((l) => l.publishDate)
        .map((l) => new Date(l.publishDate!))
        .sort((a, b) => a.getTime() - b.getTime())[0];

      const fallbackDate = job.data.date ?? earliestLinkDate ?? new Date();
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
          // Use computed date with fallbacks (already normalized as an array)
          date: eventDate,
          // Attach ALL links to this event
          links: links.map((l) => l.id),
        }),
        fp.E.fromOption(() =>
          toAIBotError(
            new Error(
              `Can't create ${job.data.type} event from response. buildEvent returned None.`,
            ),
          ),
        ),
        fp.E.map((ev) => {
          // Remove undefined values from payload to prevent JSON serialization from converting them to null
          const cleanedPayload = removeUndefinedFromPayload(ev.payload);

          return {
            ...ev,
            payload: cleanedPayload,
            id: job.id,
            excerpt: toInitialValue(event.excerpt),
            body: null,
            socialPosts: [],
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: undefined,
            draft: !links.every((l) => l.status === APPROVED.literals[0]),
          } as Event;
        }),
      );
    }),
  );
};
