import { type OnLoginErrorFn, } from "@liexp/backend/lib/providers/ig/ig.provider";
import { fp } from "@liexp/core/lib/fp";
import {
  SocialPostPhoto,
  type CreateSocialPost,
  type SocialPostBodyMultipleMedia,
} from "@liexp/shared/lib/io/http/SocialPost";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type MediaRepositoryConfigureResponseRootObject } from 'instagram-private-api';
import * as t from "io-ts";
import { type TEFlow } from "@flows/flow.types";
import { ServerError } from "@io/ControllerError";

export const postToIG: TEFlow<
  [CreateSocialPost, OnLoginErrorFn],
  MediaRepositoryConfigureResponseRootObject
> = (ctx) => (body, onError) => {
  ctx.logger.debug.log(
    "Posting %O on IG account %s",
    body,
    ctx.env.IG_USERNAME,
  );
  const writeText = (body: CreateSocialPost): string => {
    const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;

    return [body.title, body.date, "\n", body.content, "\n", keywords].join(
      "\n",
    );
  };

  return pipe(
    writeText(body),
    TE.right,
    TE.chainFirst(() => ctx.ig.login(onError)),
    TE.chain((text) => {
      ctx.logger.debug.log(
        "Upload media %O with text length %d",
        body.media,
        text.length,
      );
      const media: SocialPostBodyMultipleMedia = t.string.is(body.media)
        ? [{ type: "photo", media: body.media, thumbnail: body.media }]
        : body.media;
      return pipe(
        media,
        TE.right,
        TE.filterOrElse(
          (media) => media.length >= 1,
          () => new Error("No media to post given"),
        ),
        TE.map((media) => ({ media, text })),
      );
    }),
    TE.chain(({ text, media }) => {
      if (media.length === 1) {
        const m = media[0];

        return pipe(
          ctx.http.get<Buffer>(m.media, {
            responseType: "arraybuffer",
          }),
          TE.chain((stream) => {
            if (SocialPostPhoto.is(m)) {
              return ctx.ig.postPhoto(stream, text);
            }

            return pipe(
              ctx.http.get<Buffer>(m.thumbnail, {
                responseType: "arraybuffer",
              }),
              TE.chain((thumbnail) =>
                ctx.ig.postVideo({
                  caption: text,
                  video: stream,
                  coverImage: thumbnail,
                }),
              )
            );
          }),
        );
      }

      return pipe(
        media,
        fp.A.traverse(fp.TE.ApplicativePar)((m) =>
          pipe(
            ctx.http.get<Buffer>(m.media, {
              responseType: "arraybuffer",
            }),
            fp.TE.map((b) => ({ file: b })),
          ),
        ),
        TE.chain((items) => ctx.ig.postAlbum({ items, caption: text })),
      );
    }),
    TE.mapLeft((e) => ServerError([e.message])),
  );
};
