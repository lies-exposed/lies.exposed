import { RequestDecoder } from "@liexp/backend/lib/express/decoders/request.decoder.js";
import { authenticationHandler } from "@liexp/backend/lib/express/middleware/auth.middleware.js";
import { foldOptionals } from "@liexp/backend/lib/utils/foldOptionals.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EventSuggestionRead } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as O from "effect/Option";
import * as A from "fp-ts/lib/Array.js";
import * as E from "fp-ts/lib/Either.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { toControllerError } from "../../../io/ControllerError.js";
import { toEventSuggestion } from "./eventSuggestion.io.js";
import { searchEventSuggestion } from "#flows/event-suggestion/searchEventSuggestion.flow.js";
import { AddEndpoint } from "#routes/endpoint.subscriber.js";
import { type Route } from "#routes/route.types.js";

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
      req,
    ) => {
      const ordering = foldOptionals({
        _sort,
        _order,
      });

      const statusFilter: O.Option<EventSuggestion.EventSuggestionStatus[]> =
        pipe(
          status,
          O.map((s) => [s]),
          O.orElse(
            (): O.Option<EventSuggestion.EventSuggestionStatus[]> =>
              O.some([
                "PENDING",
                "COMPLETED",
              ] as EventSuggestion.EventSuggestionStatus[]),
          ),
        );

      return pipe(
        TE.Do,
        TE.bind("user", () =>
          pipe(
            RequestDecoder.decodeUserFromRequest(req, [
              EventSuggestionRead.literals[0],
            ])(ctx),
            TE.fromIOEither,
          ),
        ),
        TE.bind("creator", ({ user }) =>
          pipe(
            _creator,
            O.orElse(() =>
              [EventSuggestionRead.literals[0]].some((p) =>
                user.permissions.includes(p),
              )
                ? O.some(user.id)
                : O.none(),
            ),
            TE.right,
            TE.mapLeft(toControllerError),
          ),
        ),
        TE.chain(({ creator }) =>
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
        ),
        TE.chainEitherK(({ data, total }) =>
          pipe(
            data,
            A.map(toEventSuggestion),
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
