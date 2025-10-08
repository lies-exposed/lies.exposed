import { type Stream } from "stream";
import { type ENVContext } from "@liexp/backend/lib/context/env.context.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid, type UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { PDFType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import {
  SocialPostDocument,
  SocialPostPhoto,
  SocialPostVideo,
  type CreateSocialPost,
  type SocialPostContentMedia,
} from "@liexp/shared/lib/io/http/SocialPost.js";
import { Schema } from "effect";
import type TelegramBot from "node-telegram-bot-api";
import { type ENV } from "../../io/env.js";
import { type RTE } from "../../types.js";

const writeText =
  (body: CreateSocialPost) =>
  <C extends ENVContext<ENV>>(ctx: C): string => {
    const title = `<a href="${body.url}"><b>${body.title}</b></a>`;
    const date = `<a href="${ctx.env.WEB_URL}/events?startDate=${body.date}&endDate=${body.date}">${body.date}</a>`;
    const keywords =
      body.keywords.length > 0
        ? body.keywords.map((k) => `#${k.tag}`).join(" ")
        : null;
    const actors =
      body.actors.length > 0
        ? [
            "Actors:",
            `${body.actors
              .map(
                (a) =>
                  `<a href="${ctx.env.WEB_URL}/actors/${a.id}">${a.fullName}</a>`,
              )
              .join(", ")}`,
            " ",
          ]
        : [];
    const groups =
      body.groups.length > 0
        ? [
            "Groups:",
            `${body.groups
              .map(
                (g) =>
                  `<a href="${ctx.env.WEB_URL}/groups/${g.id}">${g.name}</a>`,
              )
              .join(", ")}`,
            " ",
          ]
        : [];
    // const submitLink = `Submit a link to ${ctx.env.TG_BOT_USERNAME}`;
    const publicChannels = [
      `${ctx.env.TG_BOT_CHAT}`,
      `<a href="${ctx.env.WEB_URL}">lies.exposed</a>`,
      `<a href="https://github.com/lies-exposed/lies.exposed">GitHub</a>`,
    ];
    const footer = [publicChannels.join(" | ")];

    const post = [title, date, "\n", body.content, "\n"];

    const relationsBlock =
      actors.length > 0 || groups.length > 0 || keywords
        ? [...actors, ...groups, ...(keywords ? [keywords] : []), "\n"]
        : [];

    return [...post, ...relationsBlock, ...footer].join("\n");
  };

const getMessageTexts = (
  label: string,
  text: string,
  useReply: boolean,
): { mediaText: string; messageText: string; useReply: boolean } => {
  if (useReply) {
    return {
      mediaText: label,
      messageText: text,
      useReply: true,
    };
  }
  return {
    mediaText: text,
    messageText: text,
    useReply: false,
  };
};

export const postToTG =
  (
    params: CreateSocialPost & { id: UUID },
  ): RTE<readonly TelegramBot.Message[]> =>
  (ctx) => {
    const { id: _id, ...body } = params;
    return pipe(
      writeText(body)(ctx),
      fp.TE.right,
      fp.TE.chain((text) => {
        ctx.logger.debug.log(
          "Upload media %O with text length %d",
          body.media,
          text.length,
        );
        const media: SocialPostContentMedia = Schema.is(Schema.String)(
          body.media,
        )
          ? [
              {
                id: uuid(),
                type: "photo",
                media: body.media,
                thumbnail: body.media,
              },
            ]
          : body.media;

        const { mediaText, messageText, useReply } = getMessageTexts(
          body.title,
          text,
          body.useReply,
        );

        return pipe(
          media,
          fp.TE.right,
          fp.TE.chain((media) => {
            if (media.length === 1) {
              const m = media[0];
              if (Schema.is(SocialPostPhoto)(m)) {
                return pipe(
                  ctx.tg.postPhoto(m.media, mediaText),
                  fp.TE.map(fp.A.of),
                );
              }

              if (Schema.is(SocialPostDocument)(m)) {
                return pipe(
                  ctx.tg.postFile(
                    mediaText,
                    m.filename,
                    m.media,
                    PDFType.literals[0],
                  ),
                  fp.TE.map(fp.A.of),
                );
              }

              if (Schema.is(SocialPostVideo)(m)) {
                return pipe(
                  ctx.http.get<Stream>(m.media, {
                    responseType: "stream",
                  }),
                  fp.TE.chain((stream) =>
                    ctx.tg.postVideo(stream, mediaText, {
                      duration: m.duration,
                    }),
                  ),
                  fp.TE.map(fp.A.of),
                );
              }
            }

            const allowedMedia = pipe(
              media.map((m) => {
                if (m.type === "document") {
                  return fp.E.left(m);
                }
                return fp.E.right(m);
              }),
              fp.A.separate,
            );

            if (allowedMedia.right.length > 1) {
              return ctx.tg.postMediaGroup(mediaText, allowedMedia.right);
            }

            return pipe(ctx.tg.post(messageText), fp.TE.map(fp.A.of));
          }),
          fp.TE.chain(([message]) =>
            useReply
              ? ctx.tg.post(messageText, message.message_id)
              : fp.TE.right(message),
          ),
          fp.TE.map(fp.A.of),
        );
      }),
      fp.TE.mapLeft((e) => ServerError.of([e.message])),
    );
  };
