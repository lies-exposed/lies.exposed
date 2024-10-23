import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { fetchRelationIds } from "../queries/fetchEventRelations.query.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { EventSuggestionEntity } from "#entities/EventSuggestion.entity.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const CreateEventFromSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.CreateFromSuggestion,
    ({ params: { id }, body }) => {
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) => {
          return pipe(
            fetchRelationIds({
              links: O.fromNullable(suggestion.payload.event.links),
              media: O.fromNullable(suggestion.payload.event.media),
              keywords: O.fromNullable(suggestion.payload.event.keywords),
            })(ctx),
            TE.map((relations) => ({
              ...suggestion.payload.event,
              ...relations,
              socialPosts: [],
              id:
                suggestion.payload.type ===
                EventSuggestion.EventSuggestionType.types[1].value
                  ? suggestion.payload.eventId
                  : uuid(),
            })),
            TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
            TE.chainFirst(() =>
              ctx.db.save(EventSuggestionEntity, [
                {
                  ...suggestion,
                  id,
                  status: "COMPLETED",
                },
              ]),
            ),
          );
        }),
        TE.map(([data]) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
