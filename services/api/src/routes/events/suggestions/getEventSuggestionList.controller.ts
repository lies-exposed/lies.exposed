import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { EventSuggestion } from "@liexp/shared/io/http";
import * as A from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { toEventSuggestion } from "./eventSuggestion.io";
import { searchEventSuggestion } from "@flows/event-suggestion/searchEventSuggestion.flow";
import { Route } from "@routes/route.types";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const GetEventSuggestionListRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.GetSuggestions,
    ({ query: { status, links, _order, _sort, _start, _end } }) => {
      const ordering = foldOptionals({
        _sort,
        _order,
      });

      const statusFilter: O.Option<EventSuggestion.EventSuggestionStatus[]> =
        pipe(
          status,
          O.map((s) => [s]),
          O.alt(
            (): O.Option<EventSuggestion.EventSuggestionStatus[]> =>
              O.some(["PENDING", "COMPLETED"])
          )
        );

      return pipe(
        searchEventSuggestion(ctx)({
          status: statusFilter,
          links,
          newLinks: O.none,
          order: {
            [ordering._sort]: ordering._order,
          },
          skip: O.getOrElse(() => 0)(_start),
          take: O.getOrElse(() => 20)(_end),
        }),
        TE.chainEitherK(({ data, total }) =>
          pipe(
            data,
            A.map(toEventSuggestion),
            A.sequence(E.Applicative),
            E.map((data) => ({ data, total }))
          )
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 201,
        }))
      );
    }
  );
};
