import { http } from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ECOTheme } from "../../../theme";
import { EventPageContent } from "../../EventPageContent";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

export const EventSuggestionPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(() => {
    const { payload, ...r } = record;
    return http.EventSuggestion.EventSuggestion.decode({
      ...r,
      ...record.payload,
    });
  }, [record]);

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
              event={{
                ...(p.event as any),
                media: [],
                keywords: [],
                links: [],
              }}
              onDateClick={() => undefined}
              onAreaClick={() => undefined}
              onActorClick={() => undefined}
              onGroupClick={() => undefined}
              onKeywordClick={() => undefined}
              onLinkClick={() => undefined}
              onGroupMemberClick={() => undefined}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    ))
  );
};
