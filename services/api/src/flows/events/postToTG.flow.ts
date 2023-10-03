import { PassThrough, type Stream } from "stream";
import { fp, pipe } from "@liexp/core/lib/fp";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import type TelegramBot from "node-telegram-bot-api";
import { type EventV2Entity } from "@entities/Event.v2.entity";
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

export const postToTG: TEFlow<[UUID, CreateSocialPost], EventV2Entity> =
  (ctx) => (id, body) => {
    return pipe(
      writeText(ctx)(body),
      fp.TE.right,
      fp.TE.chain((text) => {
        ctx.logger.debug.log("Upload media %O", body.media);
        const media: TelegramBot.InputMedia[] = t.string.is(body.media)
          ? [{ type: "photo", media: body.media }]
          : body.media;

        return pipe(
          media,
          fp.TE.right,
          fp.TE.chain((media) => {
            if (media.length === 1) {
              if (media[0].type === "photo") {
                return ctx.tg.postPhoto(media[0].media, text);
              }
              return pipe(
                ctx.http.get<Stream>(media[0].media, {
                  responseType: "stream",
                }),
                ctx.logger.debug.logInTaskEither(() => ["Video received"]),
                fp.TE.chain((stream) => {
                  const durationStream = new PassThrough();
                  const postVideoStream = new PassThrough();
                  stream.pipe(durationStream);

                  return pipe(
                    ctx.ffmpeg.ffprobe(durationStream as any),
                    fp.TE.chain((opts) => {
                      stream.pipe(postVideoStream);
                      return ctx.tg.postVideo(postVideoStream, text, {
                        duration: opts.format.duration,
                      });
                    }),
                  );
                }),
              );
            }
            return ctx.tg.postMediaGroup(text, media);
          }),
        );
      }),
      fp.TE.mapLeft((e) => ServerError([e.message])),
    );
  };
