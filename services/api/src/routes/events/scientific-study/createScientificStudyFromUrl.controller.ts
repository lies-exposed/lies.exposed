// import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
// import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
// import * as O from "fp-ts/lib/Option";
// import * as TE from "fp-ts/lib/TaskEither";
// import { pipe } from "fp-ts/lib/function";
// import { Equal } from "typeorm";
// import { findByURL } from "../../../queries/events/scientificStudy.query";
// import { EventV2Entity } from "@entities/Event.v2.entity";
// import { extractFromURL } from "@flows/events/extractFromURL.flow";
// import { ServerError, toControllerError } from "@io/ControllerError";
// import { toEventV2IO } from "@routes/events/eventV2.io";
// import { Route } from "@routes/route.types";

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
//         TE.chainEitherK(toEventV2IO),
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
