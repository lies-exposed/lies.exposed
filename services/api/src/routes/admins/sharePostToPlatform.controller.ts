import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type ShareMessageBody } from "@liexp/shared/io/http/ShareMessage";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import * as t from "io-ts";
import { ServerError } from "@io/ControllerError";
import { type Route } from "@routes/route.types";

export const PostSharePayloadToPlatformRoute: Route = (r, ctx) => {
  const writeText = (body: ShareMessageBody): string => {
    const title = `<a href="${body.url}"><b>${body.title}</b></a>`;
    const date = `<a href="${ctx.env.WEB_URL}/events?startDate=${body.date}">${body.date}</a>`;
    const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;
    const footer = `Follow ${ctx.env.TG_BOT_CHAT}\nSubmit a link to ${ctx.env.TG_BOT_USERNAME}`;

    return [title, date, "\n", body.content, "\n", keywords, footer].join("\n");
  };

  AddEndpoint(r)(
    Endpoints.Admin.Custom.PostToPlatform,
    ({ params: { id }, body }) => {
      return pipe(
        writeText(body),
        TE.right,
        ctx.logger.info.logInTaskEither(`Posting ${id} with caption %s`),
        TE.chain((text) =>
          t.string.is(body.media)
            ? ctx.tg.postPhoto(body.media, text)
            : ctx.tg.postMediaGroup(body.media)
        ),
        TE.mapLeft((e) => ServerError([e.message])),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
