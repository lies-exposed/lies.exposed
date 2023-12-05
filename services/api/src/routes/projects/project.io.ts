import { pipe } from "@liexp/core/lib/fp/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type ProjectEntity } from "#entities/Project.entity.js";
import { type ControllerError, DecodeError } from "#io/ControllerError.js";

export const toProjectIO = (
  project: ProjectEntity,
): E.Either<ControllerError, io.http.Project.Project> => {
  return pipe(
    io.http.Project.Project.decode({
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
    }),
    E.mapLeft((e) =>
      DecodeError(`Failed to decode project (${project.id})`, e),
    ),
  );
};
