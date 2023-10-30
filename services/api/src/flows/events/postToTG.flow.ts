import { type Stream } from "stream";
import { fp, pipe } from "@liexp/core/lib/fp";
import {
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
  const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;
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
  const submitLink = `Submit a link to ${ctx.env.TG_BOT_USERNAME}`;
  const publicChannels = [
    `${ctx.env.TG_BOT_CHAT}`,
    `<a href="${ctx.env.WEB_URL}">alpha.lies.exposed</a>`,
    `<a href="https://github.com/lies-exposed/lies.exposed">GitHub</a>`,
  ];
  const footer = [submitLink, "Follow us ".concat(publicChannels.join(" | "))];

  return [
    title,
    date,
    "\n",
    body.content,
    "\n",
    ...actors,
    ...groups,
    keywords,
    "\n",
    ...footer,
  ].join("\n");
};

const getMessageTexts = (
  post: CreateSocialPost,
  text: string
): { mediaText: string; messageText: string; useReply: boolean } => {
  if (text.length > 300) {
    return {
      mediaText: post.title,
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
        ctx.logger.debug.log("Upload media %O", body.media);
        const media: SocialPostBodyMultipleMedia = t.string.is(body.media)
          ? [{ type: "photo", media: body.media }]
          : body.media;

        const { mediaText, messageText, useReply } = getMessageTexts(body, text);

        return pipe(
          media,
          fp.TE.right,
          fp.TE.chain((media) => {
            if (media.length === 1) {
              const m = media[0];
              if (SocialPostPhoto.is(m)) {
                return ctx.tg.postPhoto(m.media, mediaText);
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
            return ctx.tg.postMediaGroup(mediaText, media);
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
