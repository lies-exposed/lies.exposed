import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toBookIO } from "./book.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

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
        TE.chainEitherK(([book]) => toBookIO(book)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
