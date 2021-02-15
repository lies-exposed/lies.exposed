import { io } from "@econnessione/shared";
import { ProjectEntity } from "@entities/Project.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toProjectIO = (
  project: ProjectEntity
): E.Either<ControllerError, io.http.Project.Project> => {
  return pipe(
    io.http.Project.Project.decode({
      ...project,
      areas: project.areas.map((a) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
