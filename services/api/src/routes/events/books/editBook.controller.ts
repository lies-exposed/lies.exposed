import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventV2IO } from "@liexp/backend/lib/io/event/eventV2.io.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { Equal } from "typeorm";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const MakeEditBookEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.BookEvent.Edit,
    ({ params: { id }, body: { keywords, media, links, ...body } }) => {
      return pipe(
        // refactor following code with TE.Do
        ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
        TE.chain((book) =>
          ctx.db.save(EventV2Entity, [
            {
              ...book,
              type: BOOK.value,
              keywords: keywords.map((id) => ({ id })),
              media: media.map((id) => ({ id })),
              links: links.map((id) => ({ id })),
              ...body,
            },
          ]),
        ),
        TE.chainEitherK(([book]) => EventV2IO.decodeSingle(book)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
