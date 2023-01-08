import { type ShareMessageBody } from "@liexp/shared/lib/io/http/ShareMessage";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { type UUID } from "io-ts-types/lib/UUID";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type Flow, type TEFlow } from "@flows/flow.types";
import { ServerError } from "@io/ControllerError";

const writeText: Flow<[ShareMessageBody], string> = (ctx) => (body) => {
  const title = `<a href="${body.url}"><b>${body.title}</b></a>`;
  const date = `<a href="${ctx.env.WEB_URL}/events?startDate=${body.date}">${body.date}</a>`;
  const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;
  const submitLink = `Submit a link to ${ctx.env.TG_BOT_USERNAME}`;
  const publicChannels = [
    `${ctx.env.TG_BOT_CHAT}`,
    `<a href="${ctx.env.WEB_URL}">alpha.lies.exposed</a>`,
  ];
  const footer = [submitLink, "Follow us ".concat(publicChannels.join(" | "))];

  return [
    title,
    date,
    "\n",
    body.content,
    "\n",
    keywords,
    "\n",
    ...footer,
  ].join("\n");
};

export const postToTG: TEFlow<[UUID, ShareMessageBody], EventV2Entity> =
  (ctx) => (id, body) => {
    return pipe(
      writeText(ctx)(body),
      TE.right,
      ctx.logger.info.logInTaskEither(`Posting ${id} with caption %s`),
      TE.chain((text) =>
        t.string.is(body.media)
          ? ctx.tg.postPhoto(body.media, text)
          : ctx.tg.postMediaGroup(text, body.media)
      ),
      TE.mapLeft((e) => ServerError([e.message]))
    );
  };
