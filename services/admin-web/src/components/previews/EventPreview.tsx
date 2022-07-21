import { http } from "@liexp/shared/io";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import { ThemeProvider } from "@liexp/ui/components/mui";
import { ECOTheme } from "@liexp/ui/theme";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";

const EventPreview: React.FC = () => {
  const { record } = useEditContext();

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
            <EventPageContent
              event={p}
              onActorClick={() => undefined}
              onGroupClick={() => undefined}
              onKeywordClick={() => undefined}
              onLinkClick={() => undefined}
              onGroupMemberClick={() => undefined}
              onDateClick={() => undefined}
              onAreaClick={() => undefined}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    ))
  );
};

export default EventPreview;
