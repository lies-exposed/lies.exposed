import path from "path";
import { type FSClient } from "@liexp/backend/lib/providers/fs/fs.provider.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type Queue } from "@liexp/shared/lib/io/http/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { type UUID } from "io-ts-types/lib/UUID.js";
import {
  toControllerError,
  type ControllerError,
} from "#io/ControllerError.js";

export interface QueueProvider<J extends Queue.Queue> {
  addJob: (job: J) => TaskEither<ControllerError, void>;
  getJob: (
    resource: Queue.QueueResourceNames,
    id: UUID,
  ) => TaskEither<ControllerError, J>;
  updateJob: (
    job: J,
    status: Queue.Status,
  ) => TaskEither<ControllerError, void>;
  listJobs: (opts?: {
    resource?: Queue.QueueResourceNames;
  }) => TaskEither<ControllerError, J[]>;
  exists: (job: J) => TaskEither<ControllerError, boolean>;
  deleteJob: (
    resource: Queue.QueueResourceNames,
    id: string,
  ) => TaskEither<ControllerError, void>;
}

export const GetQueueJobProvider = <J extends Queue.Queue>(
  fs: FSClient,
  configPath: string,
): ((type: Queue.QueueTypes) => QueueProvider<J>) => {
  const getJobPath = (
    job: {
      resource: Queue.QueueResourceNames;
      type: string;
      id: string;
    },
    status?: Queue.Status,
  ) => {
    const statusSuffix = status ? `-${status}` : "";
    return path.resolve(
      configPath,
      `${job.type}-${job.resource}-${job.id}${statusSuffix}.json`,
    );
  };

  const addJob = (job: J) => {
    return fs.writeObject(getJobPath(job), JSON.stringify(job));
  };

  return (type) => {
    return {
      addJob,
      getJob: (resource, id) => {
        return pipe(
          fs.getObject(getJobPath({ resource, type, id })),
          fp.TE.mapLeft(toControllerError),
          fp.TE.map(JSON.parse),
        );
      },
      listJobs: (opts) => {
        return pipe(
          fs._fs
            .readdirSync(configPath)
            .filter((file: string) =>
              opts?.resource ? file.includes(opts.resource) : true,
            ),
          fp.A.traverse(fp.TE.ApplicativePar)((file) => {
            return pipe(
              fs.getObject(path.resolve(configPath, file)),
              fp.TE.mapLeft(toControllerError),
              fp.TE.map((data) => JSON.parse(data)),
            );
          }),
        );
      },
      exists: (job) => {
        return fs.objectExists(getJobPath(job));
      },
      updateJob: (job, status) => {
        return pipe(
          fs.deleteObject(getJobPath(job, job.status)),
          fp.TE.chain(() => addJob({ ...job, status })),
        );
      },
      deleteJob: (resource, id) => {
        return fs.deleteObject(getJobPath({ resource, type, id }));
      },
    };
  };
};

export interface QueuesProvider {
  queue: <J extends Queue.Queue>(type: Queue.QueueTypes) => QueueProvider<J>;
  list: <J extends Queue.Queue>(opts?: {
    resource?: Queue.QueueResourceNames;
    type?: string;
    status?: Queue.Status;
  }) => TaskEither<ControllerError, J[]>;
}

export const GetQueueProvider = (
  fs: FSClient,
  configPath: string,
): QueuesProvider => {
  return {
    list: (opts) => {
      const filters = [opts?.resource, opts?.type].flatMap((x) =>
        x !== undefined ? [x] : [],
      );

      const filterFn = (file: string) => {
        return filters.length
          ? filters.every((filter) => file.includes(filter))
          : true;
      };
      return pipe(
        fs._fs.readdirSync(configPath).filter(filterFn),
        fp.A.traverse(fp.TE.ApplicativePar)((file) => {
          return pipe(
            fs.getObject(path.resolve(configPath, file)),
            fp.TE.mapLeft(toControllerError),
            fp.TE.map((data) => JSON.parse(data)),
            fp.TE.chain((data) => {
              if (opts?.status && data.status !== opts.status) {
                return fp.TE.right([]);
              }
              return fp.TE.right([data]);
            }),
          );
        }),
        fp.TE.map(fp.A.flatten),
      );
    },
    queue: GetQueueJobProvider(fs, configPath),
  };
};
