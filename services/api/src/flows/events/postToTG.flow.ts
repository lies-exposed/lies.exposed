import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
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
                `<a href="${ctx.env.WEB_URL}/actors/${a.id}">${a.fullName}</a>`
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
              (g) => `<a href="${ctx.env.WEB_URL}/groups/${g.id}">${g.name}</a>`
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
      ctx.logger.info.logInPipe(`Posting ${id} with caption %s`),
      TE.right,
      TE.chain((text) => {
        ctx.logger.debug.log("Upload media %O", body.media);
        return t.string.is(body.media)
          ? ctx.tg.postPhoto(body.media, text)
          : ctx.tg.postMediaGroup(text, body.media);
      }),
      TE.mapLeft((e) => ServerError([e.message]))
    );
  };
