import { type ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { type EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { type StoryEntity } from "@liexp/backend/lib/entities/Story.entity.js";
import { QueueIO } from "@liexp/backend/lib/io/queue.io.js";
import { GetQueueProvider } from "@liexp/backend/lib/providers/queue.provider.js";
import {
  ActorRepository,
  EventRepository,
  GroupRepository,
  LinkRepository,
  MediaRepository,
  QueueRepository,
  StoryRepository,
  type EntityRepository,
} from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { ACTORS } from "@liexp/io/lib/http/Actor.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import { Event } from "@liexp/io/lib/http/Events/index.js";
import { APPROVED, LINKS } from "@liexp/io/lib/http/Link.js";
import { MEDIA } from "@liexp/io/lib/http/Media/Media.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import {
  DoneStatus,
  OpenAIUpdateEntitiesFromURLType,
} from "@liexp/io/lib/http/Queue/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { Schema } from "effect";
import { Equal, In, type FindOptionsWhere } from "typeorm";
import { type RTE } from "../types.js";
import { type CronJobTE } from "./cron-task.type.js";
import { type WorkerContext } from "#context/context.js";
import { toWorkerError } from "#io/worker.error.js";

const processDoneJobBlockNoteResult =
  <E extends ActorEntity | GroupEntity | StoryEntity | EventV2Entity>(
    dbService: EntityRepository<E>,
  ) =>
  (job: Queue.Queue): RTE<Queue.Queue> => {
    return pipe(
      fp.RTE.Do,
      fp.RTE.apS(
        "entity",
        dbService.findOneOrFail({
          where: { id: Equal(job.id) } as FindOptionsWhere<E>,
        }),
      ),
      fp.RTE.bind("excerpt", ({ entity }) => {
        const { result } = job;
        if (!result) {
          return fp.RTE.of(entity.excerpt);
        }

        return pipe(fp.RTE.right(toInitialValue(job.result.excerpt)));
      }),
      fp.RTE.chain(({ entity, excerpt }) =>
        dbService.save([
          {
            ...entity,
            excerpt,
          },
        ]),
      ),
      fp.RTE.map(() => job),
    );
  };

const processDoneJobEventResult =
  (dbService: EntityRepository<EventV2Entity>) =>
  (job: Queue.Queue): RTE<Queue.Queue> => {
    return pipe(
      fp.RTE.Do,
      fp.RTE.bind("event", () => {
        return pipe(
          fp.RTE.of({
            id: job.id,
            draft: true,
            ...job.result,
          }),
          fp.RTE.chainEitherK(Schema.decodeUnknownEither(Event)),
          fp.RTE.mapLeft((errs) => DecodeError.of("Event", errs)),
        );
      }),
      fp.RTE.chain(({ event }) =>
        dbService.save([
          {
            ...event,
            links: event.links.map((id) => ({ id })),
            media: event.media.map((id) => ({ id })),
            keywords: event.keywords.map((id) => ({ id })),
            socialPosts: event.socialPosts?.map((id) => ({ id })),
          },
        ]),
      ),
      fp.RTE.map(() => job),
    );
  };

export const processDoneJob = (job: Queue.Queue): RTE<Queue.Queue> => {
  return pipe(
    fp.RTE.right(job),
    fp.RTE.chain((job) => {
      if (Schema.is(OpenAIUpdateEntitiesFromURLType)(job.type)) {
        const linkId = (job.data as { linkId?: string }).linkId as
          | UUID
          | undefined;
        if (!linkId) return fp.RTE.of(job);
        return pipe(
          LinkRepository.findOneOrFail({
            where: { id: Equal(linkId) },
            loadRelationIds: { relations: ["events"] },
          }),
          fp.RTE.chain((link) => {
            const draftStatus = link.status !== APPROVED.literals[0];
            const eventIds = link.events as any[] as string[];
            if (eventIds.length === 0) return fp.RTE.right(job);
            return pipe(
              EventRepository.find({ where: { id: In(eventIds) } }),
              fp.RTE.chain((events) =>
                events.length > 0
                  ? EventRepository.save(
                      events.map((e) => ({ ...e, draft: draftStatus })),
                    )
                  : fp.RTE.right([]),
              ),
              fp.RTE.map(() => job),
            );
          }),
        );
      }

      if (Schema.is(MEDIA)(job.resource)) {
        return pipe(
          MediaRepository.save([{ id: job.id, description: job.result }]),
          fp.RTE.map(() => job),
        );
      }

      if (Schema.is(LINKS)(job.resource)) {
        return pipe(
          LinkRepository.findOneOrFail({ where: { id: Equal(job.id) } }),
          fp.RTE.chain((link) =>
            LinkRepository.save([{ ...link, ...job.result }]),
          ),
          fp.RTE.map(() => job),
        );
      }

      if (job.resource === ACTORS.literals[0]) {
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
          processDoneJobEventResult(EventRepository)(job),
          fp.RTE.map(() => job),
        );
      }

      return fp.RTE.of(job);
    }),
    fp.RTE.chainFirst((job) => {
      return pipe(
        GetQueueProvider.queue<Queue.Queue, WorkerContext>(job.type).updateJob(
          job,
          "completed",
        ),
        fp.RTE.mapLeft(toWorkerError),
      );
    }),
    LoggerService.RTE.info(["Job %s completed", job.id]),
  );
};

export const processOpenAIJobsDone: CronJobTE = () => {
  return pipe(
    fp.RTE.Do,
    fp.RTE.apS(
      "doneJobs",
      pipe(
        QueueRepository.find({
          where: { status: In([DoneStatus.literals[0]]) },
        }),
        fp.RTE.chainEitherK(QueueIO.decodeMany),
        fp.RTE.mapLeft(toWorkerError),
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
