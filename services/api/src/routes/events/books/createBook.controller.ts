import { pipe } from "@liexp/core/lib/fp/index.js";
import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { EventV2IO } from "../eventV2.io.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { type Route } from "#routes/route.types.js";

export const MakeCreateBookEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.BookEvent.Create,
    ({ body: { draft, keywords, media, links, ...body } }) => {
      return pipe(
        ctx.db.save(EventV2Entity, [
          {
            type: BOOK.value,
            draft,
            keywords: keywords.map((id) => ({ id })),
            media: media.map((id) => ({ id })),
            links: links.map((id) => ({ id })),
            ...body,
          },
        ]),
        TE.chainEitherK(([book]) => EventV2IO.decodeSingle(book)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
