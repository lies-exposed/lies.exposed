import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { ServerError } from "@io/ControllerError";
import { Route } from "@routes/route.types";

export const PostEventToPlatformRoute: Route = (r, ctx) => {
  AddEndpoint(r)(Endpoints.Event.Custom.PostToPlatform, ({ body }) => {
    const text = `<a href="${body.url}"><b>${body.title}</b></a>\n<a href="${
      ctx.env.WEB_URL
    }/events?startDate=${body.date}">${body.date}</a> - ${
      body.content
    }`;

    ctx.logger.info.log("Posting %s with caption %s", body.media, text);

    return pipe(
      ctx.tg.postPhoto(body.media, text),
      TE.mapLeft((e) => ServerError([e.message])),
      TE.map((data) => ({
        body: {
          data,
        },
        statusCode: 201,
      }))
    );
  });
};
