import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { ECOTheme } from "../../../theme/index.js";
import { EventPageContent } from "../../EventPageContent.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

export const EventSuggestionPreview: React.FC = () => {
  const { record } = useEditContext();
  const qc = useQueryClient();

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
                areas: [],
              }}
              relations={{
                media: [],
                links: [],
                actors: [],
                groups: [],
                keywords: [],
                groupsMembers: [],
                areas: [],
              }}
              onDateClick={() => undefined}
              onAreaClick={() => undefined}
              onActorClick={() => undefined}
              onGroupClick={() => undefined}
              onMediaClick={() => undefined}
              onKeywordClick={() => undefined}
              onLinkClick={() => undefined}
              onGroupMemberClick={() => undefined}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    )),
  );
};
