import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as Events from "@liexp/shared/io/http/Events";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { fetchRelations } from "./queries/fetchEventRelations.utils";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const CreateEventFromSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.CreateFromSuggestion,
    ({ params: { id }, body }) => {
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) => {
          return pipe(
            fetchRelations(ctx)({
              links: O.fromNullable(suggestion.payload.event.links),
              media: O.fromNullable(suggestion.payload.event.media),
              keywords: O.fromNullable(suggestion.payload.event.keywords),
            }),
            TE.map((relations) => ({
              ...suggestion.payload.event,
              ...relations,
              id:
                suggestion.payload.type === Events.EventSuggestionType.types[1].value
                  ? suggestion.payload.eventId
                  : suggestion.payload.event.id,
            })),
            TE.chain((event) => ctx.db.save(EventV2Entity, [event])),
            TE.chainFirst(() =>
              ctx.db.save(EventSuggestionEntity, [
                {
                  ...suggestion,
                  id,
                  status: "COMPLETED",
                },
              ])
            )
          );
        }),
        TE.map(([data]) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
