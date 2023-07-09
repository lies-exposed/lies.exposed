import { type OnLoginErrorFn } from "@liexp/backend/lib/providers/ig/ig.provider";
import { type CreateSocialPost } from "@liexp/shared/lib/io/http/SocialPost";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { type EventV2Entity } from "@entities/Event.v2.entity";
import { type TEFlow } from "@flows/flow.types";
import { ServerError } from "@io/ControllerError";

export const postToIG: TEFlow<
  [CreateSocialPost, OnLoginErrorFn],
  EventV2Entity
> = (ctx) => (body, onError) => {
  ctx.logger.debug.log(
    "Posting %O on IG account %s",
    body,
    ctx.env.IG_USERNAME
  );
  const writeText = (body: CreateSocialPost): string => {
    const keywords = `${body.keywords.map((k) => `#${k.tag}`).join(" ")}`;

    return [body.title, body.date, "\n", body.content, "\n", keywords].join(
      "\n"
    );
  };

  return pipe(
    writeText(body),
    TE.right,
    TE.chainFirst(() => ctx.ig.login(onError)),
    TE.chain((text) => ctx.ig.postPhoto(Buffer.from([]), text)),
    TE.mapLeft((e) => ServerError([e.message]))
  );
};
