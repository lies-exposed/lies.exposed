import { type Stream } from "stream";
import { fp, pipe } from "@liexp/core/lib/fp";
import { PDFType } from "@liexp/shared/lib/io/http/Media";
import {
  SocialPostDocument,
  SocialPostPhoto,
  SocialPostVideo,
  type CreateSocialPost,
  type SocialPostBodyMultipleMedia,
} from "@liexp/shared/lib/io/http/SocialPost";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import type TelegramBot from "node-telegram-bot-api";
import { type Flow, type TEFlow } from "@flows/flow.types";
import { ServerError } from "@io/ControllerError";

const writeText: Flow<[CreateSocialPost], string> = (ctx) => (body) => {
  const title = `<a href="${body.url}"><b>${body.title}</b></a>`;
  const date = `<a href="${ctx.env.WEB_URL}/events?startDate=${body.date}">${body.date}</a>`;
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
            .join("\n")}`,
          "\n",
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
            .join("\n")}`,
          "\n",
        ]
      : [];
  // const submitLink = `Submit a link to ${ctx.env.TG_BOT_USERNAME}`;
  const publicChannels = [
    `${ctx.env.TG_BOT_CHAT}`,
    `<a href="${ctx.env.WEB_URL}">alpha.lies.exposed</a>`,
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

export const postToTG: TEFlow<[UUID, CreateSocialPost], TelegramBot.Message> =
  (ctx) => (id, body) => {
    return pipe(
      writeText(ctx)(body),
      fp.TE.right,
      fp.TE.chain((text) => {
        ctx.logger.debug.log(
          "Upload media %O with text length %d",
          body.media,
          text.length,
        );
        const media: SocialPostBodyMultipleMedia = t.string.is(body.media)
          ? [{ type: "photo", media: body.media, thumbnail: body.media }]
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
              if (SocialPostPhoto.is(m)) {
                return ctx.tg.postPhoto(m.media, mediaText);
              }

              if (SocialPostDocument.is(m)) {
                return ctx.tg.postFile(
                  mediaText,
                  m.filename,
                  m.media,
                  PDFType.value,
                );
              }

              if (SocialPostVideo.is(m)) {
                return pipe(
                  ctx.http.get<Stream>(m.media, {
                    responseType: "stream",
                  }),
                  fp.TE.chain((stream) =>
                    ctx.tg.postVideo(stream, mediaText, {
                      duration: m.duration,
                    }),
                  ),
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
            return ctx.tg.postMediaGroup(mediaText, allowedMedia.right);
          }),
          fp.TE.chain((message) =>
            useReply
              ? ctx.tg.post(messageText, message.message_id)
              : fp.TE.right(message),
          ),
        );
      }),
      fp.TE.mapLeft((e) => ServerError([e.message])),
    );
  };
