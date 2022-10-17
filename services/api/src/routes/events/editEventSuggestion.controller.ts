import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { editEventQuery } from "./queries/editEvent.query";
import { toEventSuggestion } from "./suggestions/eventSuggestion.io";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";

export const EditEventSuggestionRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.EditSuggestion,
    ({ params: { id }, body }) => {
      ctx.logger.debug.log("Suggestion body %O", body);
      return pipe(
        ctx.db.findOneOrFail(EventSuggestionEntity, { where: { id } }),
        TE.chain((suggestion) =>
          pipe(
            editEventQuery(ctx)(suggestion.payload.event as any, {
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
            }),
            TE.chain((event) =>
              ctx.db.save(EventSuggestionEntity, [
                {
                  ...suggestion,
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
              ])
            )
          )
        ),
        TE.chainEitherK(([d]) => toEventSuggestion(d)),
        TE.map((data) => ({
          body: {
            data,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
