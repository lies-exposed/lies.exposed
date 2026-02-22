import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { APPROVED } from "@liexp/io/lib/http/Link.js";
import { type UpdateEntitiesFromLinkTypeData } from "@liexp/io/lib/http/Queue/event/index.js";
import { toAIBotError } from "../../../common/error/index.js";
import { type ClientContext } from "../../../context.js";
import { type JobProcessRTE } from "#services/job-processor/job-processor.service.js";

export interface UpdateEntitiesFromLinkResult {
  draftStatus: boolean;
  eventIds: string[];
}

export const updateEntitiesFromLinkFlow: JobProcessRTE<
  UpdateEntitiesFromLinkTypeData,
  UpdateEntitiesFromLinkResult
> = (job) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.bindW(
      "link",
      () => (ctx: ClientContext) =>
        pipe(
          ctx.api.Link.Get({ Params: { id: job.data.linkId } }),
          fp.TE.map((response) => response.data),
          fp.TE.mapLeft(toAIBotError),
        ),
    ),
    LoggerService.RTE.debug(({ link }) => [
      "updateEntitiesFromLink: link %s has status %s with %d events",
      link.id,
      link.status,
      link.events.length,
    ]),
    fp.RTE.map(({ link }) => ({
      draftStatus: link.status !== APPROVED.literals[0],
      eventIds: [...link.events].filter(Boolean),
    })),
  );
};
