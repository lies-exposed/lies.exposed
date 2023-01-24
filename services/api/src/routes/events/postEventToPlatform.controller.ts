import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { type ShareMessageBody } from "@liexp/shared/io/http/ShareMessage";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ServerError } from "@io/ControllerError";
import { type Route } from "@routes/route.types";

export const PostEventToPlatformRoute: Route = (r, ctx) => {
  const writeText = (body: ShareMessageBody): string => {
    const title = `<a href="${body.url}"><b>${body.title}</b></a>`;
    const date = `<a href="${ctx.env.WEB_URL}/events?startDate=${body.date}">${body.date}</a>`;
    const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;

    return [title, date, "\n", body.content, "\n", keywords].join("\n");
  };

  AddEndpoint(r)(
    Endpoints.Event.Custom.PostToPlatform,
    ({ params: { id }, body }) => {
      return pipe(
        writeText(body),
        TE.right,
        ctx.logger.info.logInTaskEither(`Posting ${id} with caption %s`),
        TE.chain((text) => ctx.tg.postPhoto(body.media, text)),
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
