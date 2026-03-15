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
import { uuid, type UUID } from "@liexp/io/lib/http/Common/UUID.js";
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
import { type WorkerError, toWorkerError } from "#io/worker.error.js";

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

        return pipe(
          fp.RTE.right(
            toInitialValue(job.result.description ?? job.result.excerpt),
          ),
        );
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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isValidUUID = (value: unknown): value is UUID =>
  typeof value === "string" && UUID_REGEX.test(value);

const resolveToActorIds = (values: unknown[]): RTE<UUID[]> =>
  pipe(
    values,
    fp.A.traverse(fp.RTE.ApplicativeSeq)((value): RTE<UUID | null> => {
      if (isValidUUID(value)) return fp.RTE.of(value);
      if (typeof value !== "string") return fp.RTE.of(null);
      return pipe(
        ActorRepository.findOne({ where: { fullName: Equal(value) } }),
        fp.RTE.mapLeft(toWorkerError),
        fp.RTE.map((opt) => (fp.O.isSome(opt) ? opt.value.id : null)),
      );
    }),
    fp.RTE.map((results) => results.filter((id): id is UUID => id !== null)),
  );

const resolveToGroupIds = (values: unknown[]): RTE<UUID[]> =>
  pipe(
    values,
    fp.A.traverse(fp.RTE.ApplicativeSeq)((value): RTE<UUID | null> => {
      if (isValidUUID(value)) return fp.RTE.of(value);
      if (typeof value !== "string") return fp.RTE.of(null);
      return pipe(
        GroupRepository.findOne({ where: { name: Equal(value) } }),
        fp.RTE.mapLeft(toWorkerError),
        fp.RTE.map((opt) => (fp.O.isSome(opt) ? opt.value.id : null)),
      );
    }),
    fp.RTE.map((results) => results.filter((id): id is UUID => id !== null)),
  );

const normalizeEventPayload = (result: unknown): RTE<unknown> => {
  if (!result || typeof result !== "object")
    return fp.RTE.of(result) as RTE<unknown>;
  const r = result as Record<string, unknown>;
  const payload = r.payload;
  if (!payload || typeof payload !== "object")
    return fp.RTE.of(result) as RTE<unknown>;
  const p = payload as Record<string, unknown>;

  const actorValues: unknown[] = Array.isArray(p.actors) ? p.actors : [];
  const groupValues: unknown[] = Array.isArray(p.groups) ? p.groups : [];

  const needsResolution =
    actorValues.some((v) => !isValidUUID(v)) ||
    groupValues.some((v) => !isValidUUID(v));

  if (!needsResolution) return fp.RTE.of(result) as RTE<unknown>;

  return pipe(
    resolveToActorIds(actorValues),
    fp.RTE.bindTo("actors"),
    fp.RTE.bind("groups", () => resolveToGroupIds(groupValues)),
    fp.RTE.map(({ actors, groups }) => ({
      ...r,
      payload: { ...p, actors, groups },
    })),
  );
};

const processDoneJobEventResult =
  (dbService: EntityRepository<EventV2Entity>) =>
  (job: Queue.Queue): RTE<Queue.Queue> =>
    pipe(
      normalizeEventPayload({ id: job.id, draft: true, ...job.result }),
      fp.RTE.chain(
        (normalizedResult): RTE<Event> =>
          (_ctx) => {
            const decoded = Schema.decodeUnknownEither(Event)(normalizedResult);
            if (fp.E.isLeft(decoded)) {
              return fp.TE.left(
                DecodeError.of("Event", decoded.left) as WorkerError,
              );
            }
            return fp.TE.right(decoded.right);
          },
      ),
      fp.RTE.chain((event) =>
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
        const { thumbnailUrl, ...linkResult } = job.result ?? {};
        return pipe(
          fp.RTE.Do,
          fp.RTE.apS(
            "link",
            LinkRepository.findOneOrFail({ where: { id: Equal(job.id) } }),
          ),
          fp.RTE.bind("image", () => {
            if (!thumbnailUrl) {
              return fp.RTE.of(undefined);
            }

            return pipe(
              MediaRepository.findOne({
                where: { location: Equal(thumbnailUrl) },
              }),
              fp.RTE.chain((existing) =>
                fp.O.isSome(existing)
                  ? fp.RTE.of(existing.value)
                  : pipe(
                      MediaRepository.save([
                        {
                          id: uuid(),
                          location: thumbnailUrl,
                          thumbnail: null,
                          label: null,
                          description: null,
                          type: "image/jpg" as const,
                          creator: null,
                          extra: null,
                        },
                      ]),
                      fp.RTE.map((saved) => saved[0]),
                    ),
              ),
            );
          }),
          fp.RTE.chain(({ link, image }) =>
            LinkRepository.save([
              {
                ...link,
                ...linkResult,
                ...(image ? { image: image.id } : {}),
              },
            ]),
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
        fp.A.traverse(fp.RTE.ApplicativePar)((job) =>
          pipe(
            processDoneJob(job),
            fp.RTE.orElse(
              (e): RTE<Queue.Queue> =>
                (ctx) => {
                  ctx.logger.error.log(
                    "Error processing done job %s: %O",
                    job.id,
                    e,
                  );
                  return fp.TE.right(job);
                },
            ),
          ),
        ),
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
