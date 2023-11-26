import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { BOOK } from '@liexp/shared/lib/io/http/Events/EventType';
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal } from 'typeorm';
import { toBookIO } from "./book.io";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { type Route } from "@routes/route.types";

export const MakeEditBookEventRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.BookEvent.Edit,
    ({ params: {id},  body: { keywords, media, links, ...body } }) => {
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
        ])
        ),
        TE.chainEitherK(([book]) => toBookIO(book)),
        TE.map((data) => ({
          body: { data },
          statusCode: 200,
        })),
      );
    },
  );
};
