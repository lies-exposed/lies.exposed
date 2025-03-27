import { type ProjectImageEntity } from "@liexp/backend/lib/entities/ProjectImage.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toProjectImageIO = ({
  project,
  image,
  ...projectImage
}: ProjectImageEntity): E.Either<
  ControllerError,
  io.http.ProjectImage.ProjectImage
> => {
  return pipe(
    {
      ...projectImage,
      ...image,
      label: image?.label ?? image?.id,
      description: image?.description ?? image?.label ?? image?.id,
      projectId: project.id,
      createdAt: projectImage.createdAt.toISOString(),
      updatedAt: projectImage.updatedAt.toISOString(),
    },
    Schema.decodeUnknownEither(io.http.ProjectImage.ProjectImage),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to project image (${projectImage.id})`, e),
    ),
  );
};
