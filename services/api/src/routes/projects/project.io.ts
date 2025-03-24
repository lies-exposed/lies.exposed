import { type ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type ControllerError } from "#io/ControllerError.js";

export const toProjectIO = (
  project: ProjectEntity,
): E.Either<
  ControllerError,
  Schema.Schema.Encoded<typeof io.http.Project.Project>
> => {
  return pipe(
    {
      ...project,
      areas: project.areas.map((a) => ({
        ...a,
        events: a.events ?? [],
        media: a.media ?? [],
        socialPosts: a.socialPosts ?? [],
        geometry: a.geometry,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
        creator: null,
      })),
      media: project.media.map(({ image, ...i }) => ({
        ...i,
        description: image.description,
        location: image.location,
        projectId: project.id,
        createdAt: i.createdAt.toISOString(),
        updatedAt: i.updatedAt.toISOString(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
    },
    Schema.encodeUnknownEither(io.http.Project.Project),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode project (${project.id})`, e),
    ),
  );
};
