import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/User.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { UserEntity } from "#entities/User.entity.js";
import { extractFromURL } from "#flows/events/extractFromURL.flow.js";
import { ServerError, toControllerError } from "#io/ControllerError.js";
import { toEventV2IO } from "#routes/events/eventV2.io.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";
import { ensureUserExists } from "#utils/user.utils.js";

export const MakeExtractScientificStudyFromURLRoute: Route = (r, ctx) => {
  AddEndpoint(
    r,
    authenticationHandler(ctx, [
      AdminCreate.value,
      AdminEdit.value,
      AdminDelete.value,
    ]),
  )(
    Endpoints.ScientificStudy.Custom.ExtractFromURL,

    ({ params: { id } }, req) => {
      return pipe(
        sequenceS(TE.ApplicativePar)({
          user: pipe(
            ensureUserExists(req.user),
            TE.fromEither,
            TE.map((u) => {
              const user = new UserEntity();
              user.id = u.id;
              return user;
            }),
          ),
          event: ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          }),
        }),
        TE.chain(({ event, user }) => {
          return pipe(
            ctx.puppeteer.getBrowser({}),
            TE.mapLeft(toControllerError),
            TE.chain((b) =>
              pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  toControllerError,
                ),
                TE.chain((p) =>
                  extractFromURL(ctx)(p, user, {
                    type: SCIENTIFIC_STUDY.value,
                    url: (event.payload as any).url,
                  }),
                ),
                TE.chainFirst(() => {
                  return TE.tryCatch(() => b.close(), toControllerError);
                }),
              ),
            ),
            TE.chain((meta) => {
              if (O.isSome(meta)) {
                return ctx.db.save(EventV2Entity, [
                  { ...meta.value, id: event.id },
                ]);
              }
              return TE.left(ServerError());
            }),
            TE.chain(([result]) =>
              ctx.db.findOneOrFail(EventV2Entity, {
                where: { id: Equal(result.id) },
                loadRelationIds: {
                  relations: ["media", "links", "keywords"],
                },
              }),
            ),
          );
        }),
        TE.chainEitherK(toEventV2IO),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
