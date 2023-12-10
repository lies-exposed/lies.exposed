import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type ProjectImageEntity } from "#entities/ProjectImage.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

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
      label: image?.label ?? image?.id,
      description: image?.description ?? image?.label ?? image?.id,
      projectId: project.id,
      createdAt: projectImage.createdAt.toISOString(),
      updatedAt: projectImage.updatedAt.toISOString(),
    }),
    E.mapLeft((e) =>
      DecodeError(`Failed to project image (${projectImage.id})`, e),
    ),
  );
};
