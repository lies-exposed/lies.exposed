import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy";
import {
  AdminCreate,
  AdminDelete,
  AdminEdit,
} from "@liexp/shared/lib/io/http/User";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { sequenceS } from 'fp-ts/lib/Apply';
import { Equal } from "typeorm";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { UserEntity } from '@entities/User.entity';
import { extractFromURL } from "@flows/events/extractFromURL.flow";
import { ServerError, toControllerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { type Route } from "@routes/route.types";
import { authenticationHandler } from "@utils/authenticationHandler";
import { ensureUserExists } from '@utils/user.utils';

export const MakeExtractScientificStudyFromURLRoute: Route = (r, ctx) => {
  AddEndpoint(
    r,
    authenticationHandler(ctx, [
      AdminCreate.value,
      AdminEdit.value,
      AdminDelete.value,
    ])
  )(
    Endpoints.ScientificStudy.Custom.ExtractFromURL,

    ({ params: { id } }, req) => {
      return pipe(
        sequenceS(TE.ApplicativePar)({
          user: pipe(
            ensureUserExists(req.user),
            TE.fromEither,
            TE.map(u => {
              const user = new UserEntity();
              user.id = u.id;
              return user;
            })
          ),
          event: ctx.db.findOneOrFail(EventV2Entity, {
            where: { id: Equal(id) },
            loadRelationIds: {
              relations: ["media", "links", "keywords"],
            },
          })
        }),
        TE.chain(({ event, user }) => {
          return pipe(
            ctx.puppeteer.getBrowser({ headless: false }),
            TE.mapLeft(toControllerError),
            TE.chain((b) =>
              pipe(
                TE.tryCatch(
                  () => b.pages().then((p) => p[0]),
                  toControllerError
                ),
                TE.chain((p) =>
                  extractFromURL(ctx)(p, user, {
                    type: SCIENTIFIC_STUDY.value,
                    url: (event.payload as any).url,
                  })
                ),
                TE.chainFirst(() => {
                  return TE.tryCatch(() => b.close(), toControllerError);
                })
              )
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
              })
            )
          );
        }),
        TE.chainEitherK(toEventV2IO),
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
