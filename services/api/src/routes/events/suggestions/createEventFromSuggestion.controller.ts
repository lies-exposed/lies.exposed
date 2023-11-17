import { AddEndpoint, Endpoints } from "@liexp/shared/lib/endpoints";
import { EventSuggestion } from "@liexp/shared/lib/io/http";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { fetchRelationIds } from "../queries/fetchEventRelations.query";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { type Route } from "@routes/route.types";

export const CreateEventFromSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.CreateFromSuggestion,
    ({ params: { id }, body }) => {
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) => {
          return pipe(
            fetchRelationIds(ctx)({
              links: O.fromNullable(suggestion.payload.event.links),
              media: O.fromNullable(suggestion.payload.event.media),
              keywords: O.fromNullable(suggestion.payload.event.keywords),
            }),
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
