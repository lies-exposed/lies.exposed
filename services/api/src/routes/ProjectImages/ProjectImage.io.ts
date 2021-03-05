import * as io from "@econnessione/shared/io";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { ControllerError, DecodeError } from "@io/ControllerError";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";

export const toProjectImageIO = ({
  project,
  image,
  ...projectImage
}: ProjectImageEntity): E.Either<
  ControllerError,
  io.http.ProjectImage.ProjectImage
> => {
  return pipe(
    io.http.ProjectImage.ProjectImage.decode({
      ...projectImage,
      ...image,
      projectId: project.id,
      createdAt: projectImage.createdAt.toISOString(),
      updatedAt: projectImage.updatedAt.toISOString(),
    }),
    E.mapLeft(DecodeError)
  );
};
