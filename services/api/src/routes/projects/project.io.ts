import { io } from "@econnessione/shared";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import { ProjectEntity } from "./project.entity";

export const toProjectIO = (
  project: ProjectEntity
): E.Either<ControllerError, io.http.Project.Project> => {
  return pipe(
    io.http.Project.Project.decode({
      ...project,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
