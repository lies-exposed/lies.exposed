// import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
// import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/ScientificStudy.js";
// import * as O from "fp-ts/lib/Option.js";
// import * as TE from "fp-ts/lib/TaskEither.js";
// import { pipe } from "@liexp/core/lib/fp/index.js";
// import { Equal } from "typeorm";
// import { findByURL } from "../../../queries/events/scientificStudy.query";
// import { EventV2Entity } from "#entities/Event.v2.entity.js";
// import { extractFromURL } from "#flows/events/extractFromURL.flow.js";
// import { ServerError, toControllerError } from "#io/ControllerError.js";
// import { EventV2IO } from "#routes/events/eventV2.io.js";
// import { Route } from "#routes/route.types.js";

// export const MakeCreateScientificStudyFromURLRoute: Route = (r, ctx) => {
//   AddEndpoint(r)(
//     Endpoints.ScientificStudy.Custom.CreateFromURL,
//     ({ body: { url } }) => {
//       return pipe(
//         findByURL(ctx)(url),
//         TE.chain((existingEvent) => {
//           if (O.isNone(existingEvent)) {
//             return pipe(
//               ctx.puppeteer.getBrowser({ headless: true }),
//               TE.mapLeft(toControllerError),
//               TE.chain((b) =>
//                 pipe(
//                   TE.tryCatch(
//                     () => b.pages().then((p) => p[0]),
//                     toControllerError
//                   ),
//                   TE.chain((p) =>
//                     extractFromURL(ctx)(p, {
//                       type: SCIENTIFIC_STUDY.value,
//                       url,
//                     })
//                   ),
//                   TE.chainFirst(() => {
//                     return TE.tryCatch(() => b.close(), toControllerError);
//                   })
//                 )
//               ),
//               TE.chain((meta) => {
//                 if (O.isSome(meta)) {
//                   return ctx.db.save(EventV2Entity, [meta.value]);
//                 }
//                 return TE.left(ServerError());
//               }),
//               TE.chain(([result]) =>
//                 ctx.db.findOneOrFail(EventV2Entity, {
//                   where: { id: Equal(result.id) },
//                   loadRelationIds: {
//                     relations: ["media", "links", "keywords"],
//                   },
//                 })
//               )
//             );
//           }
//           return TE.right(existingEvent.value);
//         }),
//         TE.chainEitherK(EventV2IO),
//         TE.map((data) => ({
//           body: {
//             data,
//           },
//           statusCode: 201,
//         }))
//       );
//     }
//   );
// };
