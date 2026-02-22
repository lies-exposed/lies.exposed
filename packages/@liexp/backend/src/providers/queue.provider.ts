import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type DeleteResult, Equal } from "typeorm";
import { type DatabaseContext } from "../context/db.context.js";
import { ServerError } from "../errors/ServerError.js";
import { QueueIO } from "../io/queue.io.js";
import { QueueRepository } from "../services/entity-repository.service.js";
import { type DBError } from "./orm/database.provider.js";

interface QueueProvider<J extends Queue.Queue, C extends DatabaseContext> {
  addJob: (
    job: Omit<J, "createdAt" | "updatedAt" | "deletedAt">,
  ) => ReaderTaskEither<C, ServerError, J>;
  getJob: (
    resource: Queue.QueueResourceNames,
    id: UUID,
  ) => ReaderTaskEither<C, DBError, J>;
  updateJob: (job: J, status: Queue.Status) => ReaderTaskEither<C, DBError, J>;
  listJobs: (opts?: {
    resource?: Queue.QueueResourceNames;
  }) => ReaderTaskEither<C, DBError, readonly J[]>;
  exists: (job: J) => ReaderTaskEither<C, DBError, boolean>;
  deleteJob: (
    resource: Queue.QueueResourceNames,
    id: UUID,
  ) => ReaderTaskEither<C, DBError, DeleteResult>;
}

const GetQueueJobProvider = <J extends Queue.Queue, C extends DatabaseContext>(
  type: Queue.QueueTypes,
): QueueProvider<J, C> => {
  const getJobFindOneOpts = (
    job: {
      resource: Queue.QueueResourceNames;
      type: Queue.QueueTypes;
      id: UUID;
    },
    status?: Queue.Status,
  ) => {
    return {
      where: {
        resource: job.resource,
        type: job.type,
        id: job.id,
        status: status ? Equal(status) : undefined,
      },
    };
  };

  const addJob = (
    job: Omit<J, "createdAt" | "updatedAt" | "deletedAt">,
  ): ReaderTaskEither<C, ServerError, J> => {
    return pipe(
      QueueRepository.save([
        {
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          ...job,
        },
      ]),
      fp.RTE.chainEitherK((ee) => QueueIO.decodeSingle(ee[0])),
      fp.RTE.mapLeft(ServerError.fromUnknown),
      fp.RTE.map((job) => job as J),
    );
  };

  return {
    addJob,
    getJob: (resource, id) => {
      return pipe(
        QueueRepository.findOneOrFail(
          getJobFindOneOpts({ resource, type, id }),
        ),
        fp.RTE.chainEitherK(QueueIO.decodeSingle),
        fp.RTE.mapLeft(ServerError.fromUnknown),
        fp.RTE.map((job) => job as J),
      );
    },
    listJobs: (opts) => {
      return pipe(
        QueueRepository.find({ where: { resource: opts?.resource } }),
        fp.RTE.chainEitherK(QueueIO.decodeMany),
        fp.RTE.map((jobs) => jobs as J[]),
      );
    },
    exists: (job) => {
      return pipe(
        QueueRepository.findOne(getJobFindOneOpts(job)),
        fp.RTE.map(fp.O.isSome),
      );
    },
    updateJob: (job, status) => {
      return pipe(
        QueueRepository.findOneOrFail(getJobFindOneOpts(job, job.status)),
        fp.RTE.chain(() => addJob({ ...job, status })),
      );
    },
    deleteJob: (resource, id) => {
      return QueueRepository.delete([{ resource, type, id }]);
    },
  };
};

export interface QueuesProvider {
  queue: <J extends Queue.Queue, C extends DatabaseContext>(
    type: Queue.QueueTypes,
  ) => QueueProvider<J, C>;
}

export const GetQueueProvider: QueuesProvider = {
  queue: GetQueueJobProvider,
};
