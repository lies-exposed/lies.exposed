import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { Equal, type FindOptionsWhere } from "typeorm";
import { type CronJobTE } from "./cron-task.type.js";
import { type ServerContext } from "#context/context.type.js";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type EventV2Entity } from "#entities/Event.v2.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type StoryEntity } from "#entities/Story.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { toControllerError } from "#io/ControllerError.js";
import {
  ActorRepository,
  EventRepository,
  GroupRepository,
  LinkRepository,
  MediaRepository,
  StoryRepository,
  type EntityRepository,
} from "#providers/db/entity-repository.provider.js";

const processDoneJobBlockNoteResult =
  <E extends ActorEntity | GroupEntity | StoryEntity | EventV2Entity>(
    dbRepo: EntityRepository<E>,
  ) =>
  (job: Queue.Queue): TEReader<Queue.Queue> => {
    return pipe(
      fp.RTE.Do,
      fp.RTE.apS(
        "entity",
        dbRepo.findOneOrFail({
          where: { id: Equal(job.id) } as FindOptionsWhere<E>,
        }),
      ),
      fp.RTE.bind("excerpt", ({ entity }) => {
        const { result } = job.data;
        if (!result) {
          return fp.RTE.of(entity.excerpt);
        }

        return pipe(
          fp.RTE.asks((ctx: ServerContext) => ctx.blocknote),
          fp.RTE.chainTaskEitherK((blocknote) =>
            fp.TE.tryCatch(() => {
              return blocknote.tryParseHTMLToBlocks(result);
            }, toControllerError),
          ),
        );
      }),
      fp.RTE.chain(({ entity, excerpt }) =>
        dbRepo.save([
          {
            ...entity,
            excerpt,
          },
        ]),
      ),
      fp.RTE.map(() => job),
    );
  };

export const processDoneJob = (job: Queue.Queue): TEReader<Queue.Queue> => {
  return pipe(
    fp.RTE.right(job),
    fp.RTE.chain((job) => {
      if (job.resource === "media") {
        return pipe(
          MediaRepository.save([{ id: job.id, description: job.data.result }]),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === "links") {
        return pipe(
          LinkRepository.findOneOrFail({ where: { id: Equal(job.id) } }),
          fp.RTE.chain((link) =>
            LinkRepository.save([
              { ...link, description: job.data.result ?? link.description },
            ]),
          ),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === "actors") {
        return pipe(
          processDoneJobBlockNoteResult(ActorRepository)(job),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === "groups") {
        return pipe(
          processDoneJobBlockNoteResult(GroupRepository)(job),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === "stories") {
        return pipe(
          processDoneJobBlockNoteResult(StoryRepository)(job),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === "events") {
        return pipe(
          processDoneJobBlockNoteResult(EventRepository)(job),
          fp.RTE.map(() => job),
        );
      }

      return fp.RTE.of(job);
    }),
    fp.RTE.chainFirst((job) => (ctx) => {
      return ctx.queue.queue(job.type).updateJob(job, "completed");
    }),
    LoggerService.RTE.info(["Job %s completed", job.id]),
  );
};

export const processOpenAIJobsDone: CronJobTE = (opts) => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.apS(
      "doneJobs",
      pipe(
        fp.RTE.ask<ServerContext>(),
        fp.RTE.chainTaskEitherK((ctx) => ctx.queue.list({ status: "done" })),
      ),
    ),
    fp.RTE.chain(({ doneJobs }) => {
      return pipe(
        doneJobs,
        fp.A.traverse(fp.RTE.ApplicativePar)(processDoneJob),
      );
    }),
    fp.RTE.fold(
      (e) => (ctx) => {
        ctx.logger.error.log("Error processing embeddings queue task %O", e);
        return fp.T.of(undefined);
      },
      () => (ctx) => {
        ctx.logger.info.log("End processing embeddings queue task...");
        return fp.T.of(undefined);
      },
    ),
  );
};
