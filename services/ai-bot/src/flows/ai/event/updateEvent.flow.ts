import { AgentChatService } from "@liexp/backend/lib/services/agent-chat/agent-chat.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Event, EventMap } from "@liexp/io/lib/http/Events/index.js";
import { type UpdateEventTypeData } from "@liexp/io/lib/http/Queue/event/index.js";
import { UPDATE_EVENT_PROMPT } from "@liexp/io/lib/openai/prompts/event.prompts.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { JSONSchema, Schema } from "effect";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

const defaultQuestion =
  "Can you give me an excerpt of the given documents? Return the response in JSON format following the provided schema.";

export const updateEventFlow: JobProcessRTE<UpdateEventTypeData, Event> = (
  job,
) => {
  const EventSchemaWithBlocknote = EventMap[job.data.type];

  /**
   * Override excerpt and body to String for OpenAI structured output compatibility.
   * OpenAI's structured output doesn't support complex BlockNote document types,
   * so we use String here and convert back to BlockNote format in the final map step.
   */
  const EventSchema = Schema.Struct({
    ...EventSchemaWithBlocknote.fields,
    excerpt: Schema.String,
    body: Schema.String,
  });

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind(
      "event",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Event.Get({
            Params: { id: job.id },
          }),
          fp.TE.map((r) => r.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.bindW("jsonSchema", () =>
      pipe(
        JSONSchema.make(EventSchema),
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
      return fp.RTE.right(UPDATE_EVENT_PROMPT);
    }),
    fp.RTE.bindW("aiEvent", ({ prompt, jsonSchema }) =>
      pipe(
        AgentChatService.getStructuredOutput<ClientContext, Event>({
          message: `${prompt({
            vars: {
              id: job.data.id,
              type: job.data.type,
              jsonSchema: JSON.stringify(jsonSchema),
            },
          })}\n\n${job.question ?? defaultQuestion}`,
          conversationId: null,
        }),
        fp.RTE.mapLeft(toAIBotError),
      ),
    ),
    fp.RTE.map(
      ({ event, aiEvent }) =>
        ({
          ...event,
          ...aiEvent,
          payload: {
            ...event.payload,
            ...aiEvent.payload,
          },
          id: job.data.id,
          excerpt: aiEvent.excerpt
            ? toInitialValue(aiEvent.excerpt)
            : event.excerpt,
          body: aiEvent.body ? toInitialValue(aiEvent.body) : event.body,
          draft: true,
        }) as Event,
    ),
  );
};
