import { pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { DecodeError } from "@liexp/io/lib/http/Error/DecodeError.js";
import * as io from "@liexp/io/lib/index.js";
import { IOError } from "@ts-endpoint/core";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { type StoryEntity } from "../entities/Story.entity.js";
import { IOCodec } from "./DomainCodec.js";
import { MediaIO } from "./media.io.js";

const toStoryIO = ({
  body,
  body2,
  creator,
  ...story
}: StoryEntity): E.Either<DecodeError, io.http.Story.Story> => {
  const featuredImageE: E.Either<
    DecodeError,
    io.http.Media.AdminMedia | UUID | undefined
  > = Schema.is(UUID)(story.featuredImage)
    ? E.right(story.featuredImage)
    : story.featuredImage
      ? MediaIO.decodeSingle(story.featuredImage)
      : E.right(undefined);

  return pipe(
    featuredImageE,
    E.chain((featuredImage) =>
      pipe(
        {
          ...story,
          creator: creator ?? undefined,
          body,
          body2,
          links: [],
          media: story.media ?? [],
          actors: story.actors ?? [],
          groups: story.groups ?? [],
          events: story.events ?? [],
          keywords: story.keywords ?? [],
          featuredImage,
          date: story.date ?? new Date(),
        },
        Schema.validateEither(io.http.Story.Story),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode "Story" (${story.id})`, e),
        ),
      ),
    ),
  );
};

export const StoryIO = IOCodec(
  io.http.Story.Story,
  {
    decode: toStoryIO,
    encode: () =>
      E.left(
        new IOError("Not implemented", {
          kind: "DecodingError",
          errors: [],
        }),
      ),
  },
  "story",
);
