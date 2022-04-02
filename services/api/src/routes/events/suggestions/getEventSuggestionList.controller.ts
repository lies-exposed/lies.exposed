import { AddEndpoint, Endpoints } from "@liexp/shared/endpoints";
import { sequenceS } from "fp-ts/lib/Apply";
import * as O from "fp-ts/lib/Option";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import { In } from "typeorm";
import { EventSuggestionEntity } from "@entities/EventSuggestion.entity";
import { Route } from "@routes/route.types";
import { foldOptionals } from "@utils/foldOptionals.utils";

export const MakeGetEventSuggestionListRoute: Route = (r, ctx) => {
  AddEndpoint(r)(
    Endpoints.Event.Custom.GetSuggestions,
    ({ query: { status, _order, _sort } }) => {
      const ordering = foldOptionals({
        _sort,
        _order,
      });


      const statusFilter = pipe(
        status,
        O.fold(
          () => ["PENDING", "COMPLETED"],
          (s) => [s]
        ),
        In
      );

      return pipe(
        sequenceS(TE.ApplicativePar)({
          data: ctx.db.find(EventSuggestionEntity, {
            where: {
              status: statusFilter,
            },
            order: {
              [ordering._sort]: ordering._order,
            },
          }),
          total: ctx.db.count(EventSuggestionEntity),
        }),
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
