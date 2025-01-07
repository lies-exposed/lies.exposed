import { EventSuggestionEntity } from "@liexp/backend/lib/entities/EventSuggestion.entity.js";
import { editEventQuery } from "@liexp/backend/lib/queries/events/editEvent.query.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

export const EditEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.EditSuggestion,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Suggestion body %O", body);
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) =>
          pipe(
            editEventQuery(suggestion.payload.event as any, {
              ...body.event,
              draft: O.fromNullable(body.event.draft),
              date: O.fromNullable(body.event.date),
              excerpt: O.fromNullable(body.event.excerpt),
              body: O.fromNullable(body.event.body),
              payload: {
                ...body.event.payload,
                location: O.fromNullable((body.event.payload as any).location),
                endDate: O.fromNullable((body.event.payload as any).endDate),
              } as any,
              media: O.fromNullable(body.event.media),
              links: O.fromNullable(body.event.links),
              keywords: O.fromNullable(body.event.keywords),
            })(ctx),
            TE.chain((event) =>
              ctx.db.save(EventSuggestionEntity, [
                {
                  ...suggestion,
                  creator: body.creator
                    ? { id: body.creator }
                    : { id: suggestion.creator.id },
                  payload: {
                    ...body,
                    event: {
                      ...event,
                      excerpt: event.excerpt ?? undefined,
                      body: event.body ?? undefined,
                    } as any,
                  },
                  id,
                  status: "PENDING",
                },
              ]),
            ),
          ),
        ),
        TE.chainEitherK(([d]) => toEventSuggestion(d)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
