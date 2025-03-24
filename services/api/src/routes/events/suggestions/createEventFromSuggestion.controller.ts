import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { fetchRelationIds } from "@liexp/backend/lib/queries/events/fetchEventRelations.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as O from "effect/Option";
import * as TE from "fp-ts/lib/TaskEither.js";
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
                EventSuggestion.EventSuggestionType.members[1].Type
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
