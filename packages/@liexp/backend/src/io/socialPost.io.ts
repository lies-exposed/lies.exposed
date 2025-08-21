import { flow, fp, pipe } from "@liexp/core/lib/fp/index.js";
import {
  type _DecodeError,
  DecodeError,
} from "@liexp/shared/lib/io/http/Error/DecodeError.js";
import {
  ImageType,
  MP4Type,
} from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { SocialPost } from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as E from "fp-ts/lib/Either.js";
import { type ActorEntity } from "../entities/Actor.entity.js";
import { type GroupEntity } from "../entities/Group.entity.js";
import { type KeywordEntity } from "../entities/Keyword.entity.js";
import { type MediaEntity } from "../entities/Media.entity.js";
import { type SocialPostEntity } from "../entities/SocialPost.entity.js";
import { ActorIO } from "./Actor.io.js";
import { IOCodec } from "./DomainCodec.js";
import { GroupIO } from "./group.io.js";
import { KeywordIO } from "./keyword.io.js";
import { MediaIO } from "./media.io.js";

const encodeSocialPost = (
  socialPost: SocialPostEntity,
): E.Either<_DecodeError, typeof SocialPost.Encoded> => {
  return pipe(
    {
      ...socialPost,
      createdAt: socialPost.createdAt.toISOString(),
      updatedAt: socialPost.updatedAt.toISOString(),
      deletedAt: socialPost.deletedAt?.toISOString(),
    },
    Schema.encodeUnknownEither(SocialPost),
    E.mapLeft((e) =>
      DecodeError.of(`Failed to decode link (${socialPost.id})`, e),
    ),
  );
};

export type SocialPostEntityWithContent = Omit<SocialPostEntity, "content"> & {
  content: Omit<
    SocialPostEntity["content"],
    "media" | "actors" | "groups" | "keywords"
  > & {
    media: MediaEntity[];
    actors: ActorEntity[];
    groups: GroupEntity[];
    keywords: KeywordEntity[];
  };
};

const decodeSocialPost = ({
  content,
  ...socialPost
}: SocialPostEntityWithContent): E.Either<_DecodeError, SocialPost> => {
  return pipe(
    sequenceS(fp.E.Applicative)({
      media: MediaIO.decodeMany(content.media),
      keywords: KeywordIO.decodeMany(content.keywords),
      actors: ActorIO.decodeMany(content.actors),
      groups: GroupIO.decodeMany(content.groups),
    }),
    fp.E.map((relations) => ({
      ...socialPost,
      ...content,
      ...relations,
      platforms: content.platforms ?? { TG: false, IG: false },
      useReply: content.useReply ?? false,
      publishCount:
        typeof socialPost.publishCount === "number"
          ? socialPost.publishCount
          : parseInt(socialPost.publishCount, 10),
      media: content.media.map((m) => ({
        ...m,
        type: Schema.is(ImageType)(m.type)
          ? "photo"
          : Schema.is(MP4Type)(m.type)
            ? "video"
            : "document",

        media: m.location,
        filename: (m.label ?? m.description ?? m.id).replace(/\s/g, "-"),
      })),
      result: {
        tg: socialPost.result?.tg ?? undefined,
        ig: socialPost.result?.ig ?? undefined,
      },
      scheduledAt: socialPost.scheduledAt?.toISOString(),
      createdAt: socialPost.createdAt.toISOString(),
      updatedAt: socialPost.updatedAt.toISOString(),
    })),
    E.chain(
      flow(
        Schema.decodeUnknownEither(SocialPost, { errors: "all" }),
        E.mapLeft((e) =>
          DecodeError.of(`Failed to decode "SocialPost" (${socialPost.id})`, e),
        ),
      ),
    ),
  );
};

export const SocialPostIO = IOCodec(
  SocialPost,
  {
    decode: decodeSocialPost,
    encode: encodeSocialPost,
  },
  "link",
);
