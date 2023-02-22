import { http } from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { EventTemplateUI } from "../../../templates/EventTemplate";
import { ECOTheme } from "../../../theme";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

interface EventPreviewProps {
  event?: any;
}

const EventPreview: React.FC<EventPreviewProps> = ({ event }) => {
  const record = event ?? useEditContext().record;

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Events.Event.decode({
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
    [record]
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
    ))
  );
};

export default EventPreview;
