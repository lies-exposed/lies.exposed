import { createEventFromText } from "@liexp/backend/lib/flows/ai/createEventFromText.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type CreateEventFromTextQueueData } from "@liexp/shared/lib/io/http/Queue/CreateEventFromTextQueueData.js";
import { toAIBotError } from "../../common/error/index.js";
import { type ClientContext } from "../../context.js";
import { loadDocs } from "./common/loadDocs.flow.js";
import { getPromptFromResource } from "./prompts.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export const createEventFromTextFlow: JobProcessRTE<
  CreateEventFromTextQueueData
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("docs", () => loadDocs(job)),
    fp.RTE.bind(
      "jsonSchema",
      () => (ctx) =>
        pipe(
          ctx.endpointsRESTClient.Endpoints.Event.getList({
            filter: { eventType: [job.data.type] },
            sort: { field: "updatedAt", order: "DESC" },
          }),
          fp.TE.map((events) => events.data[0]),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    fp.RTE.chain(({ docs, jsonSchema }) =>
      createEventFromText<ClientContext>(
        docs,
        job.data.type,
        job.prompt ?? getPromptFromResource(job.resource, job.type),
        JSON.stringify(jsonSchema),
        job.data.text,
      ),
    ),
    fp.RTE.map((event) => JSON.stringify(event)),
    LoggerService.RTE.debug("`createEventFromTextFlow` result: %O"),
  );
};
