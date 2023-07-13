import * as io from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { type StoryEntity } from "@entities/Story.entity";
import { type ControllerError, DecodeError } from "@io/ControllerError";

export const toStoryIO = ({
  body,
  body2,
  creator,
  ...story
}: StoryEntity): E.Either<ControllerError, io.http.Story.Story> => {
  return pipe(
    io.http.Story.Story.decode({
      ...story,
      creator: creator ?? undefined,
      body,
      body2,
      links: [],
      media: story.media ?? [],
      actors: story.actors ?? [],
      groups: story.groups ?? [],
      events: story.events ?? [],
      featuredImage: story.featuredImage
        ? {
            ...story.featuredImage,
            thumbnail: story.featuredImage.thumbnail ?? undefined,
            createdAt: story.featuredImage.createdAt?.toISOString(),
            updatedAt: story.featuredImage.updatedAt?.toISOString(),
            deletedAt: story.featuredImage.deletedAt?.toISOString(),
            keywords: [],
            events: [],
            links: [],
            featuredIn: [],
          }
        : undefined,
      date: story.date?.toISOString() ?? new Date().toISOString(),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    }),
    E.mapLeft((e) => DecodeError(`Failed to decode "Story" (${story.id})`, e)),
  );
};
