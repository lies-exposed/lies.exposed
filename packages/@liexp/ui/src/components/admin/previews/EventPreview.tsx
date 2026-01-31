import { type EventRelationIds } from "@liexp/io/lib/http/Events/index.js";
import { Events } from "@liexp/io/lib/http/index.js";
import { http } from "@liexp/io/lib/index.js";
import { getRelationIds } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
import { type ParseError } from "effect/ParseResult";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { EventTemplateUI } from "../../../templates/EventTemplate.js";
import { ECOTheme } from "../../../theme/index.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

interface EventPreviewProps {
  event?: any;
}

const EventPreview: React.FC<EventPreviewProps> = ({ event }) => {
  const record = event ?? useEditContext().record;
  const qc = useQueryClient();

  const result = React.useMemo(
    () =>
      pipe(
        Schema.decodeUnknownEither(http.Events.Event)({
          ...(record ?? {}),
          payload: {
            ...record?.payload,
            location:
              record?.payload?.location === "" ||
              record?.payload?.location === undefined
                ? undefined
                : record.payload.location,
          },
        }),
      ),
    [record],
  );

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    E.Do,
    E.apS("result", result),
    E.bind("relations", ({ result }) =>
      pipe(getRelationIds(result), E.right<ParseError, EventRelationIds>),
    ),
    E.fold(ValidationErrorsLayout, ({ result, relations }) => {
      return (
        <HelmetProvider>
          <ThemeProvider theme={ECOTheme}>
            <QueryClientProvider client={qc}>
              <EventTemplateUI
                event={result}
                tab={0}
                filters={{
                  actors: [...relations.actors],
                  groups: [...relations.groups],
                  keywords: [...relations.keywords],
                  eventType: Events.EventType.members.map((t) => t.literals[0]),
                }}
                onTabChange={() => {}}
                onActorClick={() => undefined}
                onGroupClick={() => undefined}
                onKeywordClick={() => undefined}
                onLinkClick={() => undefined}
                onGroupMemberClick={() => undefined}
                onDateClick={() => undefined}
                onAreaClick={() => undefined}
                onMediaClick={() => undefined}
                onEventClick={() => undefined}
              />
            </QueryClientProvider>
          </ThemeProvider>
        </HelmetProvider>
      );
    }),
  );
};

export default EventPreview;
