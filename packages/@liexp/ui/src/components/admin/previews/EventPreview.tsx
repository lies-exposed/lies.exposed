import { Events } from "@liexp/shared/lib/io/http/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
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
    [record],
  );

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    result,
    E.fold(ValidationErrorsLayout, (p) => (
      <HelmetProvider>
        <ThemeProvider theme={ECOTheme}>
          <QueryClientProvider client={qc}>
            <EventTemplateUI
              event={p}
              tab={0}
              filters={{
                actors: [],
                groups: [],
                keywords: [],
                eventType: Events.EventType.members.map((t) => t.Type),
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
    )),
  );
};

export default EventPreview;
