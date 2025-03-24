import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import {
  EventSuggestionRead,
  type User,
} from "@liexp/shared/lib/io/http/User.js";
import { type EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as O from "effect/Option";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { searchEventSuggestion } from "#flows/event-suggestion/searchEventSuggestion.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";
import { authenticationHandler } from "#utils/authenticationHandler.js";

export const GetEventSuggestionListRoute: Route = (r, ctx) => {
  AddEndpoint(r, authenticationHandler(["event-suggestion:read"])(ctx))(
    Endpoints.Event.Custom.GetSuggestions,
    (
      {
        query: {
          status,
          links,
          _order,
          _sort,
          _start,
          _end,
          creator: _creator,
        },
      },
      { user },
    ) => {
      const u: User = user as any;
      const ordering = foldOptionals({
        _sort,
        _order,
      });

      const statusFilter: O.Option<EventSuggestion.EventSuggestionStatus[]> =
        pipe(
          status,
          O.map((s) => [s]),
          O.orElseSome(
            (): O.Option<EventSuggestion.EventSuggestionStatus[]> =>
              O.some([
                "PENDING",
                "COMPLETED",
              ] as EventSuggestion.EventSuggestionStatus[]),
          ),
        );

      ctx.logger.debug.log("_Creator %O", _creator);
      const creator = pipe(
        _creator,
        O.orElseSome(() =>
          [EventSuggestionRead.Type].some((p) => u.permissions.includes(p))
            ? O.some(u.id)
            : O.none,
        ),
      );

      ctx.logger.debug.log("Creator %O", creator);

      return pipe(
        searchEventSuggestion({
          status: statusFilter,
          links,
          newLinks: O.none(),
          order: {
            [ordering._sort]: ordering._order,
          },
          creator,
          skip: O.getOrElse(() => 0)(_start),
          take: O.getOrElse(() => 20)(_end),
        })(ctx),
        TE.chainEitherK(({ data, total }) =>
          pipe(
            data,
            A.map((d) =>
              toEventSuggestion({ ...d, creator: d.creator?.id as any }),
            ),
            A.sequence(E.Applicative),
            E.map((data) => ({ data, total })),
          ),
        ),
        TE.map(({ data, total }) => ({
          body: {
            data,
            total,
          },
          statusCode: 201,
        })),
      );
    },
  );
};
