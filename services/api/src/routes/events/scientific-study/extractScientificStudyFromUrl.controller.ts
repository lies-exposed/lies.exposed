import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { pipe } from "fp-ts/function";
import { extractFromURL } from "@flows/events/extractFromURL.flow";
import { Equal } from "typeorm";
import { ServerError, toControllerError } from "@io/ControllerError";
import { toEventV2IO } from "@routes/events/eventV2.io";
import { Route } from "@routes/route.types";

export const MakeExtractScientificStudyFromURLRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.ScientificStudy.Custom.ExtractFromURL,
    ({ params: { id } }) => {
      return pipe(
        ctx.db.findOneOrFail(EventV2Entity, {
          where: { id: Equal(id) },
          loadRelationIds: {
            relations: ["media", "links", "keywords"],
          },
        }),
        TE.chain((existingEvent) => {
          // TE.chain((meta) => {
          //   if (meta.provider) {
          //     return pipe(
          //       db.findOne(GroupEntity, {
          //         where: {
          //           name: Like(`%${meta.provider.toLowerCase()}%`),
          //         },
          //       }),
          //       TE.map((p) => ({
          //         ...meta,
          //         publisher: pipe(
          //           p,
          //           O.map((_) => _.id),
          //           O.toUndefined
          //         ),
          //       }))
          //     );
          //   }
          //   return TE.right({ ...meta, publisher: undefined });
          // }),
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
                  extractFromURL(ctx)(p, {
                    type: SCIENTIFIC_STUDY.value,
                    url: (existingEvent.payload as any).url,
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
                  { ...meta.value, id: existingEvent.id },
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
