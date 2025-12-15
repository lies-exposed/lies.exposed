import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatEventToMarkdown } from "../formatters/eventToMarkdown.formatter.js";

// Optionize only the keys you list; arrays and nested objects are left as-is.
export const optionizeKeys = <T extends Record<string, unknown>>(
  obj: T,
  keys: (keyof T)[],
) =>
  keys.reduce(
    (acc, k) => {
      const v = obj[k as string];
      return {
        ...acc,
        [k]: v === undefined ? O.none() : O.some(v),
      };
    },
    { ...obj } as Record<string, unknown>,
  );

/**
 * Shared base event schema fields used across all event types
 */
export const baseEventSchema = Schema.Struct({
  date: Schema.String.annotations({
    description: "Event date in ISO format (YYYY-MM-DD)",
  }),
  draft: Schema.Boolean.annotations({
    description: "Whether the event is a draft (true) or published (false)",
  }),
  excerpt: Schema.NullOr(Schema.String).annotations({
    description: "Short description/excerpt of the event as plain text or null",
  }),
  body: Schema.NullOr(Schema.String).annotations({
    description: "Full body/description of the event as plain text or null",
  }),
  media: Schema.Array(UUID).annotations({
    description: "Array of media UUIDs to associate with the event",
  }),
  links: Schema.Array(UUID).annotations({
    description: "Array of link UUIDs to associate with the event",
  }),
  keywords: Schema.Array(UUID).annotations({
    description: "Array of keyword UUIDs to associate with the event",
  }),
});

/**
 * Shared base event schema fields for editing events
 */
export const baseEditEventSchema = Schema.Struct({
  date: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Event date in ISO format (YYYY-MM-DD) or undefined to keep current",
  }),
  draft: Schema.UndefinedOr(Schema.Boolean).annotations({
    description:
      "Whether the event is a draft (true) or published (false) or undefined to keep current",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Short description/excerpt of the event as plain text or undefined to keep current",
  }),
  body: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Full body/description of the event as plain text or undefined to keep current",
  }),
  media: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Array of media UUIDs to associate with the event or undefined to keep current",
  }),
  links: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Array of link UUIDs to associate with the event or undefined to keep current",
  }),
  keywords: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description:
      "Array of keyword UUIDs to associate with the event or undefined to keep current",
  }),
});

/**
 * Base fields for create event input
 */
export interface BaseCreateEventInput {
  date: string;
  draft: boolean;
  excerpt: string | null;
  body: string | null;
  media: readonly string[];
  links: readonly string[];
  keywords: readonly string[];
}

/**
 * Base fields for edit event input
 */
export interface BaseEditEventInput {
  date?: string;
  draft?: boolean;
  excerpt?: string;
  body?: string;
  media?: readonly string[];
  links?: readonly string[];
  keywords?: readonly string[];
}

/**
 * Transforms base create event input fields to the format expected by the event body
 */
export const transformBaseCreateEventFields = (
  input: BaseCreateEventInput,
) => ({
  date: new Date(input.date),
  draft: input.draft,
  excerpt: input.excerpt ? toInitialValue(input.excerpt) : undefined,
  body: input.body ? toInitialValue(input.body) : undefined,
  media: (input.media ?? []) as any,
  links: (input.links ?? []) as any,
  keywords: (input.keywords ?? []) as any,
});

/**
 * Transforms base edit event input fields to the format expected by the event body
 */
export const transformBaseEditEventFields = (input: BaseEditEventInput) => ({
  date: input.date !== undefined ? O.some(new Date(input.date)) : O.none(),
  draft: input.draft !== undefined ? O.some(input.draft) : O.none(),
  excerpt:
    input.excerpt !== undefined
      ? O.some(toInitialValue(input.excerpt))
      : O.none(),
  body:
    input.body !== undefined ? O.some(toInitialValue(input.body)) : O.none(),
  media: input.media !== undefined ? O.some(input.media as any) : O.none(),
  links: input.links !== undefined ? O.some(input.links as any) : O.none(),
  keywords:
    input.keywords !== undefined ? O.some(input.keywords as any) : O.none(),
});

/**
 * Wraps an event flow execution with logging and formatting for MCP tool response
 */
export const wrapEventFlowTask = <T extends { id: string }>(
  flowTask: ReaderTaskEither<ServerContext, Error, T>,
  actionName: string,
): ReaderTaskEither<ServerContext, Error, CallToolResult> => {
  return pipe(
    flowTask,
    LoggerService.RTE.debug(`${actionName} event %O`),
    fp.RTE.map((event) => ({
      content: [
        {
          text: formatEventToMarkdown(event as any),
          type: "text" as const,
          uri: `event://${event.id}`,
        },
      ],
    })),
  );
};
