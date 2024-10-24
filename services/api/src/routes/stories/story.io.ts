import { pipe } from "@liexp/core/lib/fp/index.js";
import { DecodeError } from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as E from "fp-ts/lib/Either.js";
import { type StoryEntity } from "#entities/Story.entity.js";
import { type ControllerError } from "#io/ControllerError.js";
import { IOCodec } from "#io/DomainCodec.js";

const toStoryIO = ({
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
            label: story.featuredImage.label ?? undefined,
            description: story.featuredImage.description ?? undefined,
            thumbnail: story.featuredImage.thumbnail ?? undefined,
            createdAt: story.featuredImage.createdAt?.toISOString(),
            updatedAt: story.featuredImage.updatedAt?.toISOString(),
            deletedAt: story.featuredImage.deletedAt?.toISOString(),
            extra: story.featuredImage.extra ?? undefined,
            keywords: [],
            events: [],
            links: [],
            areas: [],
            featuredInStories: [],
          }
        : undefined,
      date: story.date?.toISOString() ?? new Date().toISOString(),
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    }),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode "Story" (${story.id})`, e),
    ),
  );
};

export const StoryIO = IOCodec(toStoryIO, "story");
