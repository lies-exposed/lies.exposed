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
      images: [],
      areas: [{
        type: "Polygon",
        coordinates: [
          [
            [-351.9827194, 45.5162451],
            [-350.8204059, 44.9384085],
            [-349.7264637, 45.6597865],
            [-350.6836631, 46.0882086],
            [-351.9827194, 45.5162451],
          ],
        ],
      }],
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
